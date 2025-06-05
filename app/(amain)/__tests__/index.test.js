import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "expo-router";

import Index from "@/app/(amain)/index";
import { useUserData } from "@/app/hooks/useUser";
import { useDecks } from "@/app/hooks/useDeck";
import { calculateXPToNextLevel } from "@/app/utils/xpUtils";

// Mock dependencies
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock("@/app/hooks/useUser", () => ({
  useUserData: jest.fn(),
  useUpdateUserCosmetics: jest.fn(),
}));

jest.mock("@/app/hooks/useDeck", () => ({
  useDecks: jest.fn(),
}));

jest.mock("@/app/hooks/useAppStoreVersionCheck", () => ({
  useAppStoreVersionCheck: jest.fn(),
}));

jest.mock("@/app/utils/xpUtils", () => ({
  calculateXPToNextLevel: jest.fn(),
}));

// Mock Expo Vector Icons
jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Ionicons: ({ name, size, color, ...props }) => (
      <Text {...props} accessibilityLabel={name}>
        {name}
      </Text>
    ),
  };
});

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native");
  return {
    SafeAreaView: ({ children, ...props }) => (
      <View {...props}>{children}</View>
    ),
  };
});

// Mock components that are complex and not the focus of this test
jest.mock("@/app/components/dashboard/DashboardHeader", () => {
  const { View, Text } = require("react-native");
  return function MockDashboardHeader({
    level,
    currentXP,
    requiredXP,
    streakCount,
    coins,
  }) {
    return (
      <View>
        <Text>Level {level}</Text>
        <Text>
          {currentXP} / {requiredXP} XP
        </Text>
        <Text>Streak: {streakCount}</Text>
        <Text>Coins: {coins}</Text>
      </View>
    );
  };
});

jest.mock("@/app/components/dashboard/DeckCard", () => {
  const { View, Text, Pressable } = require("react-native");
  return function MockDeckCard({
    title,
    cardCount,
    onEdit,
    onPractice,
    onAIReview,
  }) {
    return (
      <View>
        <Text>{title}</Text>
        <Text>{cardCount} cards</Text>
        <Pressable onPress={onEdit} accessibilityRole="button">
          <Text>Edit</Text>
        </Pressable>
        <Pressable onPress={onPractice} accessibilityRole="button">
          <Text>Practice</Text>
        </Pressable>
        <Pressable onPress={onAIReview} accessibilityRole="button">
          <Text>AI Review</Text>
        </Pressable>
      </View>
    );
  };
});

jest.mock("@/app/components/common/LoadingScreen", () => {
  const { Text } = require("react-native");
  return function MockLoadingScreen({ message }) {
    return <Text>{message || "Loading..."}</Text>;
  };
});

jest.mock("@/app/components/common/UpdateModal", () => {
  const { View } = require("react-native");
  return function MockUpdateModal() {
    return <View />;
  };
});

jest.mock("@/app/components/common/CodeRedemptionModal", () => {
  const { View } = require("react-native");
  return function MockCodeRedemptionModal() {
    return <View />;
  };
});

// Mock FlashList as FlatList for testing
jest.mock("@shopify/flash-list", () => ({
  FlashList: require("react-native").FlatList,
}));

// Mock Image component
jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  const { View, Text } = RN;

  RN.Image = ({ source, style, ...props }) => (
    <View style={style} {...props}>
      <Text>MockImage</Text>
    </View>
  );

  return RN;
});

describe("Index Screen", () => {
  let queryClient;
  const mockUseAppStoreVersionCheck =
    require("@/app/hooks/useAppStoreVersionCheck").useAppStoreVersionCheck;
  const mockUseUpdateUserCosmetics =
    require("@/app/hooks/useUser").useUpdateUserCosmetics;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset all mocks
    jest.clearAllMocks();

    // Default mock implementations
    calculateXPToNextLevel.mockReturnValue(1000);

    // Mock useAppStoreVersionCheck
    mockUseAppStoreVersionCheck.mockReturnValue({
      versionInfo: null,
      openStoreUpdate: jest.fn(),
      dismissUpdate: jest.fn(),
    });

    // Mock useUpdateUserCosmetics
    mockUseUpdateUserCosmetics.mockReturnValue({
      mutate: jest.fn(),
    });
  });

  const renderWithQueryClient = (component) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe("Loading States", () => {
    it("shows loading screen when user data is loading", () => {
      useUserData.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      useDecks.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      renderWithQueryClient(<Index />);

      expect(screen.getByText("Loading...")).toBeOnTheScreen();
    });

    it("shows loading screen with message when decks are loading", () => {
      useUserData.mockReturnValue({
        data: { level: 1, xp: 500, streak: 5, coins: 100 },
        isLoading: false,
        error: null,
      });

      useDecks.mockReturnValue({
        data: [],
        isLoading: true,
        error: null,
      });

      renderWithQueryClient(<Index />);

      expect(screen.getByText("Loading decks...")).toBeOnTheScreen();
    });
  });

  describe("Header Section", () => {
    beforeEach(() => {
      useUserData.mockReturnValue({
        data: { level: 1, xp: 500, streak: 5, coins: 100 },
        isLoading: false,
        error: null,
      });

      useDecks.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });
    });

    it("displays app branding with title", () => {
      renderWithQueryClient(<Index />);

      expect(screen.getByText("Study Leveling")).toBeOnTheScreen();
    });

    it("navigates to account screen when account icon is pressed", () => {
      renderWithQueryClient(<Index />);

      const accountButton = screen.getByText("person");
      fireEvent.press(accountButton);

      expect(router.push).toHaveBeenCalledWith("/(flashcard)/Account");
    });
  });

  describe("Dashboard Header", () => {
    beforeEach(() => {
      useDecks.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });
    });

    it("displays user stats with default values when user data is null", () => {
      useUserData.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      renderWithQueryClient(<Index />);

      expect(screen.getByText("Level 1")).toBeOnTheScreen();
      expect(screen.getByText("0 / 1000 XP")).toBeOnTheScreen();
      expect(screen.getByText("Streak: 0")).toBeOnTheScreen();
      expect(screen.getByText("Coins: 0")).toBeOnTheScreen();
    });

    it("displays actual user stats when user data is available", () => {
      const userData = {
        level: 5,
        xp: 750,
        streak: 12,
        coins: 350,
      };

      useUserData.mockReturnValue({
        data: userData,
        isLoading: false,
        error: null,
      });

      calculateXPToNextLevel.mockReturnValue(1200);

      renderWithQueryClient(<Index />);

      expect(screen.getByText("Level 5")).toBeOnTheScreen();
      expect(screen.getByText("750 / 1200 XP")).toBeOnTheScreen();
      expect(screen.getByText("Streak: 12")).toBeOnTheScreen();
      expect(screen.getByText("Coins: 350")).toBeOnTheScreen();
      expect(calculateXPToNextLevel).toHaveBeenCalledWith(5);
    });
  });

  describe("Deck List", () => {
    beforeEach(() => {
      useUserData.mockReturnValue({
        data: { level: 1, xp: 500, streak: 5, coins: 100 },
        isLoading: false,
        error: null,
      });
    });

    it("shows empty state message when no decks exist", () => {
      useDecks.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      renderWithQueryClient(<Index />);

      expect(
        screen.getByText("No decks yet. Create your first deck to get started!")
      ).toBeOnTheScreen();
    });

    it("displays deck cards when decks are available", () => {
      const mockDecks = [
        { deckId: "1", title: "Spanish Vocabulary", flashcardCount: 25 },
        { deckId: "2", title: "Math Formulas", flashcardCount: 15 },
      ];

      useDecks.mockReturnValue({
        data: mockDecks,
        isLoading: false,
        error: null,
      });

      renderWithQueryClient(<Index />);

      expect(screen.getByText("Spanish Vocabulary")).toBeOnTheScreen();
      expect(screen.getByText("25 cards")).toBeOnTheScreen();
      expect(screen.getByText("Math Formulas")).toBeOnTheScreen();
      expect(screen.getByText("15 cards")).toBeOnTheScreen();
    });
  });

  describe("Deck Card Interactions", () => {
    const mockDecks = [
      { deckId: "deck-123", title: "Test Deck", flashcardCount: 10 },
    ];

    beforeEach(() => {
      useUserData.mockReturnValue({
        data: { level: 1, xp: 500, streak: 5, coins: 100 },
        isLoading: false,
        error: null,
      });

      useDecks.mockReturnValue({
        data: mockDecks,
        isLoading: false,
        error: null,
      });
    });

    it("navigates to edit screen when edit button is pressed", () => {
      renderWithQueryClient(<Index />);

      const editButton = screen.getByText("Edit");
      fireEvent.press(editButton);

      expect(router.push).toHaveBeenCalledWith(
        "/(flashcard)/EditFlashcard?deckId=deck-123"
      );
    });

    it("navigates to review screen when practice button is pressed", () => {
      renderWithQueryClient(<Index />);

      const practiceButton = screen.getByText("Practice");
      fireEvent.press(practiceButton);

      expect(router.push).toHaveBeenCalledWith(
        "/(flashcard)/FlashcardReview?deckId=deck-123"
      );
    });

    it("navigates to AI review screen when AI review button is pressed", () => {
      renderWithQueryClient(<Index />);

      const aiReviewButton = screen.getByText("AI Review");
      fireEvent.press(aiReviewButton);

      expect(router.push).toHaveBeenCalledWith(
        "/(flashcard)/AIReview?deckId=deck-123"
      );
    });
  });

  describe("Action Buttons", () => {
    beforeEach(() => {
      useUserData.mockReturnValue({
        data: { level: 1, xp: 500, streak: 5, coins: 100 },
        isLoading: false,
        error: null,
      });

      useDecks.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });
    });

    it("navigates to flashcard decoration when decorate button is pressed", () => {
      renderWithQueryClient(<Index />);

      const decorateButton = screen.getByText("color-palette");
      fireEvent.press(decorateButton);

      expect(router.push).toHaveBeenCalledWith(
        "/(flashcard)/FlashcardDecoration"
      );
    });

    it("navigates to create deck screen when create deck button is pressed", () => {
      renderWithQueryClient(<Index />);

      const createDeckButton = screen.getByText("Create Deck");
      fireEvent.press(createDeckButton);

      expect(router.push).toHaveBeenCalledWith("/(flashcard)");
    });

    it("displays create deck button with correct text and icon", () => {
      renderWithQueryClient(<Index />);

      expect(screen.getByText("Create Deck")).toBeOnTheScreen();
      expect(screen.getByText("add-circle-outline")).toBeOnTheScreen();
    });
  });

  describe("Component Integration", () => {
    it("renders all main sections when data is loaded successfully", () => {
      const userData = { level: 3, xp: 450, streak: 7, coins: 200 };
      const mockDecks = [
        { deckId: "1", title: "Biology Terms", flashcardCount: 30 },
      ];

      useUserData.mockReturnValue({
        data: userData,
        isLoading: false,
        error: null,
      });

      useDecks.mockReturnValue({
        data: mockDecks,
        isLoading: false,
        error: null,
      });

      renderWithQueryClient(<Index />);

      // Verify all main sections are present
      expect(screen.getByText("Level 3")).toBeOnTheScreen();
      expect(screen.getByText("Biology Terms")).toBeOnTheScreen();
      expect(screen.getByText("Create Deck")).toBeOnTheScreen();
    });

    it("handles undefined user data gracefully", () => {
      useUserData.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });

      useDecks.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      renderWithQueryClient(<Index />);

      // Should use default values
      expect(screen.getByText("Level 1")).toBeOnTheScreen();
      expect(screen.getByText("0 / 1000 XP")).toBeOnTheScreen();
    });
  });

  describe("Accessibility", () => {
    beforeEach(() => {
      useUserData.mockReturnValue({
        data: { level: 1, xp: 500, streak: 5, coins: 100 },
        isLoading: false,
        error: null,
      });

      useDecks.mockReturnValue({
        data: [{ deckId: "1", title: "Test Deck", flashcardCount: 5 }],
        isLoading: false,
        error: null,
      });
    });

    it("ensures buttons have proper accessibility roles", () => {
      renderWithQueryClient(<Index />);

      const editButton = screen.getByText("Edit");
      const practiceButton = screen.getByText("Practice");
      const aiReviewButton = screen.getByText("AI Review");

      expect(screen.getByRole("button", { name: /edit/i })).toBeTruthy();
      expect(screen.getByRole("button", { name: /practice/i })).toBeTruthy();
      expect(screen.getByRole("button", { name: /ai review/i })).toBeTruthy();
    });
  });
});
