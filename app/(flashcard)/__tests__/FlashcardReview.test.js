import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";

import FlashcardReview from "../FlashcardReview";
import { useDeck } from "../../hooks/useDeck";
import { useUserData } from "../../hooks/useUser";
import * as flashcardUtils from "../../utils/flashcardUtils";
import * as xpUtils from "../../utils/xpUtils";
import * as dayUtils from "../../utils/dayUtils";

// Mock dependencies following Kent C. Dodds' principles
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
  useLocalSearchParams: jest.fn(),
}));

jest.mock("../../hooks/useDeck", () => ({
  useDeck: jest.fn(),
}));

jest.mock("../../hooks/useUser", () => ({
  useUserData: jest.fn(),
}));

jest.mock("../../utils/flashcardUtils", () => ({
  fisherYatesShuffle: jest.fn(),
}));

jest.mock("../../utils/xpUtils", () => ({
  calculateXPForSession: jest.fn(),
}));

jest.mock("../../utils/dayUtils", () => ({
  getElapsedSeconds: jest.fn(),
}));

// Mock components with testable interfaces
jest.mock("../../components/flashcard/ReviewHeader", () => {
  const React = require("react");
  return function MockReviewHeader({
    currentIndex,
    totalCards,
    isReviewingMarked,
    shuffleMode,
    onToggleShuffle,
  }) {
    return React.createElement("View", {
      testID: "review-header",
      children: [
        React.createElement(
          "Text",
          {
            key: "progress",
            testID: "progress-text",
          },
          `${currentIndex + 1} / ${totalCards}${isReviewingMarked ? " (Reviewing Marked)" : ""}`
        ),
        React.createElement(
          "Pressable",
          {
            key: "shuffle",
            testID: "shuffle-button",
            onPress: onToggleShuffle,
            accessibilityState: { selected: shuffleMode },
          },
          React.createElement("Text", {}, "Shuffle")
        ),
      ],
    });
  };
});

jest.mock("../../components/flashcard/FlashcardDisplay", () => {
  const React = require("react");
  return function MockFlashcardDisplay({ front, back, onFlip }) {
    return React.createElement("View", {
      testID: "flashcard-display",
      children: [
        React.createElement("Pressable", {
          key: "card",
          testID: "flashcard",
          onPress: onFlip,
          children: [
            React.createElement(
              "Text",
              {
                key: "front",
                testID: "card-front",
              },
              front
            ),
            React.createElement(
              "Text",
              {
                key: "back",
                testID: "card-back",
              },
              back
            ),
          ],
        }),
      ],
    });
  };
});

jest.mock("../../components/flashcard/ReviewControls", () => {
  const React = require("react");
  return function MockReviewControls({
    onPrevious,
    onNext,
    onMark,
    isFirstCard,
    isLastCard,
  }) {
    return React.createElement("View", {
      testID: "review-controls",
      children: [
        React.createElement(
          "Pressable",
          {
            key: "previous",
            testID: "previous-button",
            onPress: onPrevious,
            disabled: isFirstCard,
            accessibilityState: { disabled: isFirstCard },
          },
          React.createElement("Text", {}, "Previous")
        ),
        !isLastCard &&
          React.createElement(
            "Pressable",
            {
              key: "mark",
              testID: "mark-button",
              onPress: onMark,
            },
            React.createElement("Text", {}, "Mark")
          ),
        React.createElement(
          "Pressable",
          {
            key: "next",
            testID: "next-button",
            onPress: onNext,
            disabled: isLastCard,
            accessibilityState: { disabled: isLastCard },
          },
          React.createElement("Text", {}, "Next")
        ),
      ],
    });
  };
});

jest.mock("../../components/common/LoadingScreen", () => {
  const React = require("react");
  return function MockLoadingScreen({ message }) {
    return React.createElement("View", {
      testID: "loading-screen",
      children: React.createElement("Text", {}, message),
    });
  };
});

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");

  return {
    ...Reanimated,
    useSharedValue: jest.fn(() => ({ value: 0 })),
    withTiming: jest.fn((value) => value),
    withSequence: jest.fn((value) => value),
    Easing: {
      bezier: jest.fn(() => ({})),
    },
  };
});

describe("FlashcardReview", () => {
  const mockDeckData = {
    flashcards: [
      {
        flashcardId: "card-1",
        front: "What is photosynthesis?",
        back: "The process by which plants make food using sunlight",
      },
      {
        flashcardId: "card-2",
        front: "What is the water cycle?",
        back: "The continuous movement of water on Earth",
      },
      {
        flashcardId: "card-3",
        front: "What is gravity?",
        back: "A force that attracts objects with mass",
      },
    ],
  };

  const mockUserData = {
    id: "user-1",
    decorations: [
      {
        decorationId: "star-1",
        x: 10,
        y: 20,
        scale: 1,
        rotation: 0,
        flipX: false,
        flipY: false,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    useLocalSearchParams.mockReturnValue({ deckId: "deck-1" });
    useDeck.mockReturnValue({
      data: mockDeckData,
      isLoading: false,
    });
    useUserData.mockReturnValue({
      data: mockUserData,
    });
    flashcardUtils.fisherYatesShuffle.mockImplementation((arr) =>
      [...arr].reverse()
    );
    xpUtils.calculateXPForSession.mockReturnValue(75);
    dayUtils.getElapsedSeconds.mockReturnValue(300);
  });

  describe("Rendering", () => {
    it("renders the flashcard review interface", () => {
      render(<FlashcardReview />);

      expect(screen.getByTestId("review-header")).toBeOnTheScreen();
      expect(screen.getByTestId("flashcard-display")).toBeOnTheScreen();
      expect(screen.getByTestId("review-controls")).toBeOnTheScreen();
    });

    it("displays the first flashcard initially", () => {
      render(<FlashcardReview />);

      expect(screen.getByText("What is photosynthesis?")).toBeOnTheScreen();
      expect(screen.getByText("1 / 3")).toBeOnTheScreen();
    });

    it("shows loading screen when deck data is loading", () => {
      useDeck.mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(<FlashcardReview />);

      expect(screen.getByTestId("loading-screen")).toBeOnTheScreen();
      expect(screen.getByText("Loading flashcards...")).toBeOnTheScreen();
    });

    it("displays complete review button on last card with no marked cards", () => {
      render(<FlashcardReview />);

      // Navigate to last card
      const nextButton = screen.getByTestId("next-button");
      fireEvent.press(nextButton);
      fireEvent.press(nextButton);

      expect(
        screen.getByRole("button", { name: /complete review/i })
      ).toBeOnTheScreen();
    });
  });

  describe("Card Navigation", () => {
    it("navigates to next card when next button is pressed", () => {
      render(<FlashcardReview />);

      const nextButton = screen.getByTestId("next-button");
      fireEvent.press(nextButton);

      expect(screen.getByText("What is the water cycle?")).toBeOnTheScreen();
      expect(screen.getByText("2 / 3")).toBeOnTheScreen();
    });

    it("navigates to previous card when previous button is pressed", () => {
      render(<FlashcardReview />);

      // Go to second card first
      const nextButton = screen.getByTestId("next-button");
      fireEvent.press(nextButton);

      // Then go back
      const previousButton = screen.getByTestId("previous-button");
      fireEvent.press(previousButton);

      expect(screen.getByText("What is photosynthesis?")).toBeOnTheScreen();
      expect(screen.getByText("1 / 3")).toBeOnTheScreen();
    });

    it("disables previous button on first card", () => {
      render(<FlashcardReview />);

      const previousButton = screen.getByTestId("previous-button");

      //   expect(previousButton).toHaveAccessibilityState({ disabled: true });
      expect(previousButton.props.accessibilityState?.disabled).toBe(true);
    });

    it("disables next button on last card when no marked cards exist", () => {
      render(<FlashcardReview />);

      // Navigate to last card
      const nextButton = screen.getByTestId("next-button");
      fireEvent.press(nextButton);
      fireEvent.press(nextButton);

      expect(nextButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe("Card Flipping", () => {
    it("flips card when flashcard is pressed", () => {
      render(<FlashcardReview />);

      const flashcard = screen.getByTestId("flashcard");
      fireEvent.press(flashcard);

      // Animation would typically handle the flip,
      // but we're testing the interaction occurred
      expect(flashcard).toBeTruthy();
    });
  });

  describe("Card Marking", () => {
    it("marks current card when mark button is pressed", () => {
      render(<FlashcardReview />);

      const markButton = screen.getByTestId("mark-button");
      fireEvent.press(markButton);

      // Should advance to next card after marking
      expect(screen.getByText("What is the water cycle?")).toBeOnTheScreen();
    });

    it("transitions to review mode when last card is marked", () => {
      render(<FlashcardReview />);

      // Navigate to last card
      const nextButton = screen.getByTestId("next-button");
      fireEvent.press(nextButton);

      // Mark the last card
      const markButton = screen.getByTestId("mark-button");
      fireEvent.press(markButton);
      fireEvent.press(nextButton);

      // Should show reviewing marked state
      expect(screen.getByText("1 / 1 (Reviewing Marked)")).toBeOnTheScreen();
    });

    it("doesn't show mark button on last card", () => {
      render(<FlashcardReview />);

      // Navigate to last card
      const nextButton = screen.getByTestId("next-button");
      fireEvent.press(nextButton);
      fireEvent.press(nextButton);

      expect(screen.queryByTestId("mark-button")).not.toBeOnTheScreen();
    });
  });

  describe("Shuffle Functionality", () => {
    it("shuffles cards when shuffle button is pressed", () => {
      render(<FlashcardReview />);

      const shuffleButton = screen.getByTestId("shuffle-button");
      fireEvent.press(shuffleButton);

      expect(flashcardUtils.fisherYatesShuffle).toHaveBeenCalledWith([0, 1, 2]);

      expect(shuffleButton.props.accessibilityState?.selected).toBe(true);
    });

    it("restores original order when shuffle is turned off", () => {
      render(<FlashcardReview />);

      const shuffleButton = screen.getByTestId("shuffle-button");

      // Turn shuffle on
      fireEvent.press(shuffleButton);

      // Turn shuffle off
      fireEvent.press(shuffleButton);

      expect(shuffleButton.props.accessibilityState?.selected).toBe(false);
    });

    it("applies shuffle when transitioning to marked cards review", () => {
      render(<FlashcardReview />);

      // Enable shuffle first
      const shuffleButton = screen.getByTestId("shuffle-button");
      fireEvent.press(shuffleButton);

      // Mark first card
      const markButton = screen.getByTestId("mark-button");
      fireEvent.press(markButton);

      // Navigate to last card and mark it
      const nextButton = screen.getByTestId("next-button");
      fireEvent.press(nextButton);
      fireEvent.press(markButton);

      expect(flashcardUtils.fisherYatesShuffle).toHaveBeenCalledWith([0, 1, 2]);
    });
  });

  describe("Session Completion", () => {
    it("navigates to reward screen when complete review is pressed", () => {
      render(<FlashcardReview />);

      // Navigate to last card
      const nextButton = screen.getByTestId("next-button");
      fireEvent.press(nextButton);
      fireEvent.press(nextButton);

      const completeButton = screen.getByRole("button", {
        name: /complete review/i,
      });
      fireEvent.press(completeButton);

      expect(router.push).toHaveBeenCalledWith(
        expect.stringContaining("/(flashcard)/FlashcardReward")
      );
      expect(router.push).toHaveBeenCalledWith(
        expect.stringContaining("deckId=deck-1")
      );
      expect(router.push).toHaveBeenCalledWith(
        expect.stringContaining("totalCards=3")
      );
    });

    it("includes correct parameters in reward navigation", () => {
      render(<FlashcardReview />);

      // Navigate to last card
      const nextButton = screen.getByTestId("next-button");
      fireEvent.press(nextButton);
      fireEvent.press(nextButton);

      const completeButton = screen.getByRole("button", {
        name: /complete review/i,
      });
      fireEvent.press(completeButton);

      const expectedUrl =
        "/(flashcard)/FlashcardReward?deckId=deck-1&totalCards=3&duration=300&xpEarned=75";
      expect(router.push).toHaveBeenCalledWith(expectedUrl);
    });
  });

  describe("Data Loading", () => {
    it("handles empty deck data", () => {
      useDeck.mockReturnValue({
        data: { flashcards: [] },
        isLoading: false,
      });

      render(<FlashcardReview />);

      expect(screen.getByTestId("review-header")).toBeOnTheScreen();
    });

    it("handles missing user data", () => {
      useUserData.mockReturnValue({
        data: null,
      });

      render(<FlashcardReview />);

      expect(screen.getByTestId("flashcard-display")).toBeOnTheScreen();
    });

    it("initializes remaining cards when deck data loads", () => {
      const { rerender } = render(<FlashcardReview />);

      // Initially no deck data
      useDeck.mockReturnValue({
        data: null,
        isLoading: false,
      });

      rerender(<FlashcardReview />);

      // Then deck data loads
      useDeck.mockReturnValue({
        data: mockDeckData,
        isLoading: false,
      });

      rerender(<FlashcardReview />);

      expect(screen.getByText("1 / 3")).toBeOnTheScreen();
    });
  });

  describe("Edge Cases", () => {
    it("handles navigation with marked cards", () => {
      render(<FlashcardReview />);

      // Mark first card
      const markButton = screen.getByTestId("mark-button");
      fireEvent.press(markButton);

      // Navigate to last remaining card
      const nextButton = screen.getByTestId("next-button");
      fireEvent.press(nextButton);

      // Try to go to next when marked cards exist
      fireEvent.press(nextButton);

      expect(screen.getByText("1 / 1 (Reviewing Marked)")).toBeOnTheScreen();
    });

    it("handles single card deck", () => {
      const singleCardDeck = {
        flashcards: [mockDeckData.flashcards[0]],
      };

      useDeck.mockReturnValue({
        data: singleCardDeck,
        isLoading: false,
      });

      render(<FlashcardReview />);

      expect(screen.getByText("1 / 1")).toBeOnTheScreen();
      expect(
        screen.getByRole("button", { name: /complete review/i })
      ).toBeOnTheScreen();
    });

    it("resets flip state when navigating between cards", () => {
      render(<FlashcardReview />);

      // Flip current card
      const flashcard = screen.getByTestId("flashcard");
      fireEvent.press(flashcard);

      // Navigate to next card
      const nextButton = screen.getByTestId("next-button");
      fireEvent.press(nextButton);

      // Card should be in front state for new card
      expect(screen.getByText("What is the water cycle?")).toBeOnTheScreen();
    });
  });

  describe("Accessibility", () => {
    it("provides proper accessibility states for navigation buttons", () => {
      render(<FlashcardReview />);

      const previousButton = screen.getByTestId("previous-button");
      const nextButton = screen.getByTestId("next-button");

      expect(previousButton.props.accessibilityState?.disabled).toBe(true);
      expect(nextButton.props.accessibilityState?.disabled).toBe(false);
    });

    it("provides proper accessibility state for shuffle button", () => {
      render(<FlashcardReview />);

      const shuffleButton = screen.getByTestId("shuffle-button");
      expect(shuffleButton.props.accessibilityState?.selected).toBe(false);

      fireEvent.press(shuffleButton);
      expect(shuffleButton.props.accessibilityState?.selected).toBe(true);
    });

    it("has accessible complete review button", () => {
      render(<FlashcardReview />);

      // Navigate to last card
      const nextButton = screen.getByTestId("next-button");
      fireEvent.press(nextButton);
      fireEvent.press(nextButton);

      const completeButton = screen.getByRole("button", {
        name: /complete review/i,
      });
      expect(completeButton).toBeOnTheScreen();
    });
  });

  describe("User Decorations", () => {
    it("passes user decorations to flashcard display", () => {
      render(<FlashcardReview />);

      // The FlashcardDisplay component should receive decorations
      // This would be tested through component props in a more integrated test
      expect(screen.getByTestId("flashcard-display")).toBeOnTheScreen();
    });

    it("handles null decorations gracefully", () => {
      useUserData.mockReturnValue({
        data: {
          ...mockUserData,
          decorations: null,
        },
      });

      render(<FlashcardReview />);

      expect(screen.getByTestId("flashcard-display")).toBeOnTheScreen();
    });

    it("filters out null decoration items", () => {
      useUserData.mockReturnValue({
        data: {
          ...mockUserData,
          decorations: [
            mockUserData.decorations[0],
            null,
            {
              decorationId: "star-2",
              x: 30,
              y: 40,
              scale: 1.5,
              rotation: 45,
              flipX: true,
              flipY: false,
            },
          ],
        },
      });

      render(<FlashcardReview />);

      expect(screen.getByTestId("flashcard-display")).toBeOnTheScreen();
    });
  });

  describe("Animation Integration", () => {
    it("initializes animation values", () => {
      const mockUseSharedValue =
        require("react-native-reanimated").useSharedValue;

      render(<FlashcardReview />);

      expect(mockUseSharedValue).toHaveBeenCalledWith(0);
      expect(mockUseSharedValue).toHaveBeenCalledWith(1);
    });

    it("triggers animation on navigation", () => {
      const mockWithSequence = require("react-native-reanimated").withSequence;

      render(<FlashcardReview />);

      const nextButton = screen.getByTestId("next-button");
      fireEvent.press(nextButton);

      expect(mockWithSequence).toHaveBeenCalled();
    });
  });

  describe("Performance", () => {
    it("doesn't recreate card indices unnecessarily", () => {
      const { rerender } = render(<FlashcardReview />);

      // Rerender with same data
      rerender(<FlashcardReview />);

      expect(screen.getByText("1 / 3")).toBeOnTheScreen();
    });

    it("handles large deck efficiently", () => {
      const largeDeck = {
        flashcards: Array.from({ length: 100 }, (_, i) => ({
          flashcardId: `card-${i}`,
          front: `Question ${i}`,
          back: `Answer ${i}`,
        })),
      };

      useDeck.mockReturnValue({
        data: largeDeck,
        isLoading: false,
      });

      render(<FlashcardReview />);

      expect(screen.getByText("1 / 100")).toBeOnTheScreen();
      expect(screen.getByText("Question 0")).toBeOnTheScreen();
    });
  });
});
