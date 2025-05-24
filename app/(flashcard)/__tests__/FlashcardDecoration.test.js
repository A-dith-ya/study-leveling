import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FlashcardDecoration from "@/app/(flashcard)/FlashcardDecoration";

// Mock dependencies
jest.mock("@/app/hooks/useUser", () => ({
  useUserData: jest.fn(),
  useUpdateUserDecorations: jest.fn(),
}));

jest.mock("@/app/components/common/EditHeader", () => {
  return function MockEditHeader({
    title,
    rightButtonText,
    onRightButtonPress,
  }) {
    const { Text, Pressable } = require("react-native");
    return (
      <>
        <Text>{title}</Text>
        <Pressable
          onPress={onRightButtonPress}
          testID="save-button"
          accessibilityRole="button"
        >
          <Text>{rightButtonText}</Text>
        </Pressable>
      </>
    );
  };
});

jest.mock("@/app/components/common/LoadingScreen", () => {
  return function MockLoadingScreen() {
    const { Text } = require("react-native");
    return <Text>Loading...</Text>;
  };
});

jest.mock("@/app/components/DraggableSticker", () => {
  return {
    DraggableSticker: function MockDraggableSticker({
      sticker,
      onSelect,
      onDelete,
    }) {
      const { Pressable, Text } = require("react-native");
      return (
        <Pressable
          testID={`draggable-sticker-${sticker.id}`}
          onPress={onSelect}
        >
          <Text>Sticker: {sticker.id}</Text>
          <Pressable
            testID={`delete-sticker-${sticker.id}`}
            onPress={() => onDelete(sticker.id)}
          >
            <Text>Delete</Text>
          </Pressable>
        </Pressable>
      );
    },
  };
});

jest.mock("@/app/utils/stickerUtils", () => ({
  CARD_WIDTH: 300,
  CARD_HEIGHT: 200,
  STICKER_SIZE: 50,
  getImageFromId: jest.fn((id) => ({ uri: `mock-image-${id}` })),
  formatTitle: jest.fn((id) => id.replace(/([A-Z])/g, " $1").trim()),
}));

jest.mock("@gorhom/bottom-sheet", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: React.forwardRef(function MockBottomSheet(
      { children, index: initialIndex = -1 },
      ref
    ) {
      const { View } = require("react-native");
      const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

      // Expose mock methods on the ref
      React.useImperativeHandle(ref, () => ({
        snapToIndex: jest.fn((index) => {
          setCurrentIndex(index);
        }),
        close: jest.fn(() => {
          setCurrentIndex(-1);
        }),
      }));

      // Update internal state when prop changes
      React.useEffect(() => {
        setCurrentIndex(initialIndex);
      }, [initialIndex]);

      // Only render children when sheet is supposed to be visible (index >= 0)
      return currentIndex >= 0 ? (
        <View testID="bottom-sheet">{children}</View>
      ) : null;
    }),
    BottomSheetView: function MockBottomSheetView({ children }) {
      const { View } = require("react-native");
      return <View>{children}</View>;
    },
    BottomSheetScrollView: function MockBottomSheetScrollView({ children }) {
      const { ScrollView } = require("react-native");
      return <ScrollView>{children}</ScrollView>;
    },
  };
});

// Mock React Native modules
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }) => children,
}));

jest.mock("react-native-gesture-handler", () => ({
  GestureHandlerRootView: ({ children }) => children,
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: function MockIonicons({ name }) {
    const { Text } = require("react-native");
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

const {
  useUserData,
  useUpdateUserDecorations,
} = require("@/app/hooks/useUser");

// Test data
const mockUserData = {
  ownedCosmetics: [
    {
      cosmeticId: "star",
      category: "STICKER",
      count: 3,
    },
    {
      cosmeticId: "heart",
      category: "STICKER",
      count: 2,
    },
    {
      cosmeticId: "invalidSticker",
      category: "THEME",
      count: 1,
    },
  ],
  decorations: [
    {
      decorationId: "star#1",
      x: 100,
      y: 50,
      scale: 1.2,
      rotation: 45,
      flipX: false,
      flipY: true,
    },
  ],
};

const mockUpdateUserDecorations = {
  mutate: jest.fn(),
};

// Helper function to render component with QueryClient
function renderWithQueryClient(component) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
}

describe("FlashcardDecoration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUserData.mockReturnValue({
      data: mockUserData,
      isLoading: false,
    });
    useUpdateUserDecorations.mockReturnValue(mockUpdateUserDecorations);
  });

  describe("Loading State", () => {
    it("shows loading screen when data is loading", () => {
      useUserData.mockReturnValue({
        data: null,
        isLoading: true,
      });

      renderWithQueryClient(<FlashcardDecoration />);

      expect(screen.getByText("Loading...")).toBeOnTheScreen();
    });
  });

  describe("Basic Rendering", () => {
    it("renders the main screen elements correctly", () => {
      renderWithQueryClient(<FlashcardDecoration />);

      // Check header
      expect(screen.getByText("Decorate Flashcard")).toBeOnTheScreen();
      expect(screen.getByText("Save")).toBeOnTheScreen();

      // Check flashcard content
      expect(
        screen.getByText("What is the powerhouse of the cell?")
      ).toBeOnTheScreen();

      // Check add sticker button
      expect(screen.getByText("Add Sticker")).toBeOnTheScreen();
      expect(screen.getByTestId("icon-add-circle")).toBeOnTheScreen();
    });

    it("renders existing decorations from user data", () => {
      renderWithQueryClient(<FlashcardDecoration />);

      // Should render the existing sticker from mockUserData
      expect(screen.getByTestId("draggable-sticker-star#1")).toBeOnTheScreen();
      expect(screen.getByText("Sticker: star#1")).toBeOnTheScreen();
    });

    it("handles user data without decorations", () => {
      useUserData.mockReturnValue({
        data: { ...mockUserData, decorations: null },
        isLoading: false,
      });

      renderWithQueryClient(<FlashcardDecoration />);

      expect(screen.getByText("Add Sticker")).toBeOnTheScreen();
      expect(
        screen.queryByTestId("draggable-sticker-star#1")
      ).not.toBeOnTheScreen();
    });
  });

  describe("Add Sticker Functionality", () => {
    it("opens sticker palette when add sticker button is pressed", () => {
      renderWithQueryClient(<FlashcardDecoration />);

      const addButton = screen.getByRole("button", { name: /Add Sticker/i });
      fireEvent.press(addButton);

      // Bottom sheet should become visible
      expect(screen.getByTestId("bottom-sheet")).toBeOnTheScreen();
      expect(screen.getByText("Choose a Sticker")).toBeOnTheScreen();
    });

    it("displays available stickers in the palette", () => {
      renderWithQueryClient(<FlashcardDecoration />);

      const addButton = screen.getByText("Add Sticker");
      fireEvent.press(addButton);

      // Should show stickers from user's owned cosmetics
      expect(screen.getByText("star")).toBeOnTheScreen();
      expect(screen.getByText("heart")).toBeOnTheScreen();

      // Should show usage counts
      expect(screen.getByText("1/3")).toBeOnTheScreen(); // star (1 used, 3 total)
      expect(screen.getByText("0/2")).toBeOnTheScreen(); // heart (0 used, 2 total)

      // Should not show non-sticker cosmetics
      expect(screen.queryByText("invalidSticker")).not.toBeOnTheScreen();
    });

    it("adds a sticker when selected from palette", () => {
      renderWithQueryClient(<FlashcardDecoration />);

      const addButton = screen.getByText("Add Sticker");
      fireEvent.press(addButton);

      // Select heart sticker (which has 0 used)
      const heartSticker = screen.getByText("heart");
      fireEvent.press(heartSticker);

      // Should add the sticker to the canvas
      expect(screen.getByTestId("draggable-sticker-heart#1")).toBeOnTheScreen();
    });

    it("prevents adding stickers when count limit is reached", () => {
      // Mock user data where star stickers are at limit
      const maxedOutUserData = {
        ...mockUserData,
        decorations: [
          {
            decorationId: "star#1",
            x: 100,
            y: 50,
            scale: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
          },
          {
            decorationId: "star#2",
            x: 150,
            y: 75,
            scale: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
          },
          {
            decorationId: "star#3",
            x: 200,
            y: 100,
            scale: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
          },
        ],
      };

      useUserData.mockReturnValue({
        data: maxedOutUserData,
        isLoading: false,
      });

      renderWithQueryClient(<FlashcardDecoration />);

      const addButton = screen.getByText("Add Sticker");
      fireEvent.press(addButton);

      // Star sticker should show as disabled (3/3 used)
      expect(screen.getByText("3/3")).toBeOnTheScreen();
    });
  });

  describe("Sticker Management", () => {
    it("allows selecting and deleting stickers", () => {
      renderWithQueryClient(<FlashcardDecoration />);

      // Select existing sticker
      const existingSticker = screen.getByTestId("draggable-sticker-star#1");
      fireEvent.press(existingSticker);

      // Delete the sticker
      const deleteButton = screen.getByTestId("delete-sticker-star#1");
      fireEvent.press(deleteButton);

      // Sticker should be removed
      expect(
        screen.queryByTestId("draggable-sticker-star#1")
      ).not.toBeOnTheScreen();
    });
  });

  describe("Save Functionality", () => {
    it("saves decorations when save button is pressed", () => {
      renderWithQueryClient(<FlashcardDecoration />);

      // Add a new sticker first
      const addButton = screen.getByText("Add Sticker");
      fireEvent.press(addButton);

      const heartSticker = screen.getByText("heart");
      fireEvent.press(heartSticker);

      // Press save button
      const saveButton = screen.getByTestId("save-button");
      fireEvent.press(saveButton);

      // Should call mutation with decorations
      expect(mockUpdateUserDecorations.mutate).toHaveBeenCalledWith({
        decorations: expect.arrayContaining([
          expect.objectContaining({
            decorationId: "star#1",
            x: 100,
            y: 50,
            scale: 1.2,
            rotation: 45,
            flipX: false,
            flipY: true,
          }),
          expect.objectContaining({
            decorationId: "heart#1",
            x: expect.any(Number),
            y: expect.any(Number),
            scale: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
          }),
        ]),
      });
    });

    it("does not save when no stickers are placed", () => {
      useUserData.mockReturnValue({
        data: { ...mockUserData, decorations: [] },
        isLoading: false,
      });

      renderWithQueryClient(<FlashcardDecoration />);

      const saveButton = screen.getByTestId("save-button");
      fireEvent.press(saveButton);

      // Should not call mutation when no stickers
      expect(mockUpdateUserDecorations.mutate).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("handles missing user data gracefully", () => {
      useUserData.mockReturnValue({
        data: null,
        isLoading: false,
      });

      renderWithQueryClient(<FlashcardDecoration />);

      // Should still render basic UI
      expect(screen.getByText("Decorate Flashcard")).toBeOnTheScreen();
      expect(screen.getByText("Add Sticker")).toBeOnTheScreen();
    });

    it("handles user data without owned cosmetics", () => {
      useUserData.mockReturnValue({
        data: { ownedCosmetics: [] },
        isLoading: false,
      });

      renderWithQueryClient(<FlashcardDecoration />);

      const addButton = screen.getByText("Add Sticker");
      fireEvent.press(addButton);

      // Should show empty palette
      expect(screen.getByText("Choose a Sticker")).toBeOnTheScreen();
      expect(screen.queryByText("star")).not.toBeOnTheScreen();
      expect(screen.queryByText("heart")).not.toBeOnTheScreen();
    });

    it("filters out cosmetics without required properties", () => {
      const incompleteUserData = {
        ownedCosmetics: [
          { cosmeticId: "star", category: "STICKER", count: 3 },
          { cosmeticId: null, category: "STICKER", count: 2 }, // missing cosmeticId
          { cosmeticId: "triangle", category: "STICKER", count: 0 }, // zero count
          { category: "STICKER", count: 1 }, // missing cosmeticId
        ],
      };

      useUserData.mockReturnValue({
        data: incompleteUserData,
        isLoading: false,
      });

      renderWithQueryClient(<FlashcardDecoration />);

      const addButton = screen.getByText("Add Sticker");
      fireEvent.press(addButton);

      // Should only show valid sticker
      expect(screen.getByText("star")).toBeOnTheScreen();
      expect(screen.queryByText("triangle")).not.toBeOnTheScreen();
    });
  });

  describe("Accessibility", () => {
    it("provides accessible button labels", () => {
      renderWithQueryClient(<FlashcardDecoration />);

      // Buttons should have accessible text
      expect(
        screen.getByRole("button", { name: /add sticker/i })
      ).toBeOnTheScreen();
      expect(screen.getByRole("button", { name: /save/i })).toBeOnTheScreen();
    });
  });
});
