import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";

import AIReview from "@/app/(flashcard)/AIReview";
import { useReviewStore } from "@/app/stores/reviewStore";
import { useDeck } from "@/app/hooks/useDeck";
import { useAIReview } from "@/app/services/reviewService";
import * as reviewUtils from "@/app/utils/reviewUtils";

// Mock dependencies
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
  useLocalSearchParams: jest.fn(),
}));

// Mock hooks
jest.mock("@/app/hooks/useDeck", () => ({
  useDeck: jest.fn(),
}));

jest.mock("@/app/stores/reviewStore", () => ({
  useReviewStore: jest.fn(),
}));

jest.mock("@/app/services/reviewService", () => ({
  useAIReview: jest.fn(),
}));

jest.mock("@/app/utils/reviewUtils", () => ({
  sanitizeInput: jest.fn(),
  createUserAnswerSegments: jest.fn(),
  createCorrectAnswerSegments: jest.fn(),
}));

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name, size, color, ...props }) => {
    const React = require("react");
    return React.createElement("Text", {
      testID: `ionicon-${name}`,
      children: name,
      ...props,
    });
  },
}));

// Mock other components
jest.mock("@/app/components/ai-review/HighlightedAnswer", () => {
  return function MockHighlightedAnswer({ label, segments }) {
    const React = require("react");
    return React.createElement("View", {
      testID: `highlighted-answer-${label.toLowerCase().replace(/\s+/g, "-")}`,
      children: [
        React.createElement("Text", { key: "label" }, label),
        React.createElement(
          "Text",
          { key: "segments" },
          segments?.map((s) => s.text).join("") || ""
        ),
      ],
    });
  };
});

jest.mock("@/app/components/ai-review/LegendItem", () => ({
  LegendItem: ({ type, label }) => {
    const React = require("react");
    return React.createElement("View", {
      testID: `legend-item-${type}`,
      children: React.createElement("Text", {}, label),
    });
  },
}));

jest.mock("@/app/components/ai-review/MicButton", () => {
  return function MockMicButton() {
    const React = require("react");
    return React.createElement("View", {
      testID: "mic-button",
      children: React.createElement("Text", {}, "Mic"),
    });
  };
});

jest.mock("@/app/components/ai-review/AIFeedback", () => {
  return function MockAIFeedback({ explanation }) {
    const React = require("react");
    return React.createElement("View", {
      testID: "ai-feedback",
      children: React.createElement("Text", {}, explanation),
    });
  };
});

jest.mock("@/app/components/common/LoadingScreen", () => {
  return function MockLoadingScreen({ message }) {
    const React = require("react");
    return React.createElement("View", {
      testID: "loading-screen",
      children: React.createElement("Text", {}, message),
    });
  };
});

jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");

  return {
    ...Reanimated,
    useAnimatedStyle: jest.fn(() => ({})),
    useSharedValue: jest.fn(() => ({ value: 1 })),
    withTiming: jest.fn((value) => value),
    withSequence: jest.fn((value) => value),
  };
});

jest.mock("@/app/utils/logger", () => ({
  logger: {
    logDivider: jest.fn(),
  },
}));

describe("AIReview", () => {
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
        back: "A force that attracts objects toward each other",
      },
    ],
  };

  const mockEvaluations = {
    "card-1": {
      userAnswerSegments: [
        { text: "Plants make ", type: "none" },
        { text: "food", type: "correct" },
        { text: " using ", type: "none" },
        { text: "sunlight", type: "correct" },
      ],
      correctAnswerSegments: [
        { text: "The process by which plants make ", type: "none" },
        { text: "food", type: "correct" },
        { text: " using ", type: "none" },
        { text: "sunlight", type: "correct" },
      ],
      aiExplanation: "Good understanding of photosynthesis basics.",
    },
  };

  const mockUserAnswers = {
    "card-1": "Plants make food using sunlight",
  };

  const mockReviewStore = {
    initReview: jest.fn(),
    deckId: "deck-1",
    currentFlashcardIndex: 0,
    userAnswers: mockUserAnswers,
    evaluations: mockEvaluations,
    setUserAnswer: jest.fn(),
    setEvaluation: jest.fn(),
    hasEvaluation: jest.fn(),
    goToNextCard: jest.fn(),
    goToPreviousCard: jest.fn(),
  };

  const mockAIReview = {
    mutateAsync: jest.fn(),
    isPending: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mockAIReview to default state
    mockAIReview.isPending = false;
    mockAIReview.mutateAsync = jest.fn();

    // Reset mockReviewStore to default state
    mockReviewStore.deckId = "deck-1";
    mockReviewStore.currentFlashcardIndex = 0; // Always start from first card
    mockReviewStore.userAnswers = { ...mockUserAnswers };
    mockReviewStore.evaluations = { ...mockEvaluations };
    mockReviewStore.initReview = jest.fn();
    mockReviewStore.setUserAnswer = jest.fn();
    mockReviewStore.setEvaluation = jest.fn();
    mockReviewStore.hasEvaluation = jest.fn();
    mockReviewStore.goToNextCard = jest.fn();
    mockReviewStore.goToPreviousCard = jest.fn();

    useLocalSearchParams.mockReturnValue({ deckId: "deck-1" });
    useReviewStore.mockReturnValue(mockReviewStore);
    useDeck.mockReturnValue({
      data: mockDeckData,
      isLoading: false,
    });
    useAIReview.mockReturnValue(mockAIReview);

    // Setup review utils mocks
    reviewUtils.sanitizeInput.mockImplementation((input) => input?.trim());
    reviewUtils.createUserAnswerSegments.mockReturnValue([
      { text: "Plants make food using sunlight", type: "correct" },
    ]);
    reviewUtils.createCorrectAnswerSegments.mockReturnValue([
      {
        text: "The process by which plants make food using sunlight",
        type: "correct",
      },
    ]);

    mockReviewStore.hasEvaluation.mockImplementation((cardId) =>
      mockEvaluations.hasOwnProperty(cardId)
    );
  });

  describe("Rendering", () => {
    it("renders the question correctly", () => {
      render(<AIReview />);

      expect(screen.getByText("Question 1")).toBeOnTheScreen();
      expect(screen.getByText("What is photosynthesis?")).toBeOnTheScreen();
    });

    it("renders the legend bar with all legend items", () => {
      render(<AIReview />);

      expect(screen.getByTestId("legend-item-correct")).toBeOnTheScreen();
      expect(screen.getByTestId("legend-item-incorrect")).toBeOnTheScreen();
      expect(screen.getByTestId("legend-item-missing")).toBeOnTheScreen();
    });

    it("renders answer input when not evaluated", () => {
      mockReviewStore.hasEvaluation.mockReturnValue(false);

      render(<AIReview />);

      expect(screen.getByText("Your Answer")).toBeOnTheScreen();
      expect(
        screen.getByPlaceholderText("Type your answer here...")
      ).toBeOnTheScreen();
    });

    it("renders mic button when not evaluated", () => {
      mockReviewStore.hasEvaluation.mockReturnValue(false);

      render(<AIReview />);

      expect(screen.getByTestId("mic-button")).toBeOnTheScreen();
    });

    it("renders navigation buttons", () => {
      render(<AIReview />);

      expect(screen.getByTestId("ionicon-chevron-back")).toBeOnTheScreen();
      expect(screen.getByTestId("ionicon-chevron-forward")).toBeOnTheScreen();
    });

    it("renders submit button with correct text when not evaluated", () => {
      mockReviewStore.hasEvaluation.mockReturnValue(false);

      render(<AIReview />);

      expect(screen.getByRole("button", { name: /submit/i })).toBeOnTheScreen();
    });
  });

  describe("Evaluated State", () => {
    beforeEach(() => {
      mockReviewStore.hasEvaluation.mockReturnValue(true);
    });

    it("renders highlighted answers when evaluated", () => {
      render(<AIReview />);

      expect(
        screen.getByTestId("highlighted-answer-your-answer")
      ).toBeOnTheScreen();
      expect(
        screen.getByTestId("highlighted-answer-correct-answer")
      ).toBeOnTheScreen();
    });

    it("renders AI feedback when evaluated and explanation exists", () => {
      render(<AIReview />);

      expect(screen.getByTestId("ai-feedback")).toBeOnTheScreen();
      expect(
        screen.getByText("Good understanding of photosynthesis basics.")
      ).toBeOnTheScreen();
    });

    it("renders try again button when evaluated", () => {
      render(<AIReview />);

      expect(
        screen.getByRole("button", { name: /try again/i })
      ).toBeOnTheScreen();
    });

    it("does not render answer input when evaluated", () => {
      render(<AIReview />);

      expect(
        screen.queryByPlaceholderText("Type your answer here...")
      ).not.toBeOnTheScreen();
    });

    it("does not render mic button when evaluated", () => {
      render(<AIReview />);

      expect(screen.queryByTestId("mic-button")).not.toBeOnTheScreen();
    });
  });

  describe("Loading States", () => {
    it("shows loading screen when deck data is loading", () => {
      useDeck.mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(<AIReview />);

      expect(screen.getByTestId("loading-screen")).toBeOnTheScreen();
      expect(screen.getByText("Loading questions...")).toBeOnTheScreen();
    });

    it("shows activity indicator when AI review is pending", () => {
      mockAIReview.isPending = true;
      useAIReview.mockReturnValue(mockAIReview);

      render(<AIReview />);

      expect(screen.getByTestId("activity-indicator")).toBeOnTheScreen();
    });

    it("disables navigation buttons when AI review is pending", () => {
      mockAIReview.isPending = true;
      useAIReview.mockReturnValue(mockAIReview);

      render(<AIReview />);

      const backButton = screen.getByTestId("ionicon-chevron-back").parent;
      const forwardButton = screen.getByTestId(
        "ionicon-chevron-forward"
      ).parent;

      // Check accessibility state
      expect(backButton.parent.props.accessibilityState?.disabled).toBe(true);
      expect(forwardButton.parent.props.accessibilityState?.disabled).toBe(
        true
      );
    });
  });

  describe("User Interactions", () => {
    it("updates user input when typing in text input", () => {
      mockReviewStore.hasEvaluation.mockReturnValue(false);

      render(<AIReview />);

      const textInput = screen.getByPlaceholderText("Type your answer here...");
      fireEvent.changeText(textInput, "Plants use sunlight to make food");

      expect(textInput.props.value).toBe("Plants use sunlight to make food");
    });

    it("calls AI review when submit button is pressed with valid input", async () => {
      mockReviewStore.hasEvaluation.mockReturnValue(false);
      mockAIReview.mutateAsync.mockResolvedValue({
        aiExplanation: "Good answer!",
        userAnswerSegments: [{ text: "test", type: "correct" }],
        correctAnswerSegments: [{ text: "test", type: "correct" }],
      });

      render(<AIReview />);

      const textInput = screen.getByPlaceholderText("Type your answer here...");
      fireEvent.changeText(textInput, "Plants make food using sunlight");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(reviewUtils.sanitizeInput).toHaveBeenCalledWith(
          "Plants make food using sunlight"
        );
      });

      await waitFor(() => {
        expect(mockAIReview.mutateAsync).toHaveBeenCalledWith({
          question: "What is photosynthesis?",
          correctAnswer: "The process by which plants make food using sunlight",
          userAnswer: "Plants make food using sunlight",
        });
      });
    });

    it("sets evaluation after successful AI review", async () => {
      mockReviewStore.hasEvaluation.mockReturnValue(false);
      const mockResponse = {
        aiExplanation: "Good answer!",
        userAnswerSegments: [{ text: "test", type: "correct" }],
        correctAnswerSegments: [{ text: "test", type: "correct" }],
      };
      mockAIReview.mutateAsync.mockResolvedValue(mockResponse);

      render(<AIReview />);

      const textInput = screen.getByPlaceholderText("Type your answer here...");
      fireEvent.changeText(textInput, "Plants make food using sunlight");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockReviewStore.setEvaluation).toHaveBeenCalledWith("card-1", {
          userAnswerSegments: [
            { text: "Plants make food using sunlight", type: "correct" },
          ],
          correctAnswerSegments: [
            {
              text: "The process by which plants make food using sunlight",
              type: "correct",
            },
          ],
          aiExplanation: "Good answer!",
        });
      });
    });

    it("resets evaluation state when try again is pressed", () => {
      mockReviewStore.hasEvaluation.mockReturnValue(true);

      render(<AIReview />);

      const tryAgainButton = screen.getByRole("button", { name: /try again/i });
      fireEvent.press(tryAgainButton);

      // The component should reset to non-evaluated state
      // This would be verified by checking if the answer input appears again
    });
  });

  describe("Navigation", () => {
    it("navigates to next card when next button is pressed", () => {
      render(<AIReview />);

      const nextButton = screen.getByTestId("ionicon-chevron-forward").parent;
      fireEvent.press(nextButton);

      expect(mockReviewStore.setUserAnswer).toHaveBeenCalled();
      expect(mockReviewStore.goToNextCard).toHaveBeenCalled();
      expect(router.push).toHaveBeenCalledWith("/(flashcard)/AIReview");
    });

    it("navigates to previous card when back button is pressed", () => {
      render(<AIReview />);

      const backButton = screen.getByTestId("ionicon-chevron-back").parent;
      fireEvent.press(backButton);

      expect(mockReviewStore.setUserAnswer).toHaveBeenCalled();
      expect(mockReviewStore.goToPreviousCard).toHaveBeenCalled();
      expect(router.push).toHaveBeenCalledWith("/(flashcard)/AIReview");
    });

    it("navigates to summary when on last card and next is pressed", () => {
      mockReviewStore.currentFlashcardIndex = 2; // Last card (0-indexed)
      useReviewStore.mockReturnValue(mockReviewStore);

      render(<AIReview />);

      const nextButton = screen.getByTestId("ionicon-chevron-forward").parent;
      fireEvent.press(nextButton);

      expect(router.push).toHaveBeenCalledWith("/(flashcard)/AISummary");
    });
  });

  describe("Initialization", () => {
    it("initializes review when deckId is not set but routeDeckId is available", () => {
      mockReviewStore.deckId = null;
      useReviewStore.mockReturnValue(mockReviewStore);
      useLocalSearchParams.mockReturnValue({ deckId: "deck-2" });

      render(<AIReview />);

      expect(mockReviewStore.initReview).toHaveBeenCalledWith("deck-2");
    });

    it("does not initialize review when deckId is already set", () => {
      mockReviewStore.deckId = "deck-1";
      useReviewStore.mockReturnValue(mockReviewStore);

      render(<AIReview />);

      expect(mockReviewStore.initReview).not.toHaveBeenCalled();
    });

    it("loads user answer for current flashcard on mount", () => {
      render(<AIReview />);

      // The component should load the existing user answer
      expect(
        screen.getByText("Plants make food using sunlight")
      ).toBeOnTheScreen();
    });

    it("sets evaluated state based on existing evaluation", () => {
      mockReviewStore.hasEvaluation.mockReturnValue(true);

      render(<AIReview />);

      // Should show evaluated state
      expect(
        screen.getByRole("button", { name: /try again/i })
      ).toBeOnTheScreen();
    });
  });

  describe("Edge Cases", () => {
    it("handles missing question data", () => {
      useDeck.mockReturnValue({
        data: { flashcards: [] },
        isLoading: false,
      });

      render(<AIReview />);

      // When there are no flashcards, the component still shows "Question 1"
      // but the question text should be undefined/empty
      expect(screen.getByText("Question 1")).toBeOnTheScreen();
      expect(
        screen.queryByText("What is photosynthesis?")
      ).not.toBeOnTheScreen();
    });

    it("handles empty user input on submit", async () => {
      mockReviewStore.hasEvaluation.mockReturnValue(false);
      reviewUtils.sanitizeInput.mockReturnValue("");

      render(<AIReview />);

      const submitButton = screen.getByRole("button", { name: /submit/i });
      fireEvent.press(submitButton);

      expect(mockAIReview.mutateAsync).not.toHaveBeenCalled();
    });

    it("handles AI review error gracefully", async () => {
      mockReviewStore.hasEvaluation.mockReturnValue(false);
      mockAIReview.mutateAsync.mockRejectedValue(new Error("API Error"));
      render(<AIReview />);

      const textInput = screen.getByPlaceholderText("Type your answer here...");
      fireEvent.changeText(textInput, "Plants make food using sunlight");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      fireEvent.press(submitButton);

      // The component should handle the error gracefully
      await waitFor(() => {
        expect(mockAIReview.mutateAsync).toHaveBeenCalled();
      });
    });

    it("handles missing evaluation data", () => {
      mockReviewStore.hasEvaluation.mockReturnValue(true);
      mockReviewStore.evaluations = {};
      useReviewStore.mockReturnValue(mockReviewStore);

      render(<AIReview />);

      // Should not crash when evaluation data is missing
      expect(
        screen.getByRole("button", { name: /try again/i })
      ).toBeOnTheScreen();
    });

    it("handles malformed flashcard data", () => {
      useDeck.mockReturnValue({
        data: {
          flashcards: [
            {
              flashcardId: "card-1",
              // Missing front and back properties
            },
          ],
        },
        isLoading: false,
      });

      render(<AIReview />);

      // Should not crash with malformed data
      expect(screen.getByText("Question 1")).toBeOnTheScreen();
    });
  });

  describe("Component Integration", () => {
    it("passes correct props to HighlightedAnswer components", () => {
      mockReviewStore.hasEvaluation.mockReturnValue(true);

      render(<AIReview />);

      expect(
        screen.getByTestId("highlighted-answer-your-answer")
      ).toBeOnTheScreen();
      expect(
        screen.getByTestId("highlighted-answer-correct-answer")
      ).toBeOnTheScreen();
    });

    it("passes correct props to AIFeedback component", () => {
      mockReviewStore.hasEvaluation.mockReturnValue(true);

      render(<AIReview />);

      expect(screen.getByTestId("ai-feedback")).toBeOnTheScreen();
    });

    it("renders all legend items correctly", () => {
      render(<AIReview />);

      expect(screen.getByTestId("legend-item-correct")).toBeOnTheScreen();
      expect(screen.getByTestId("legend-item-incorrect")).toBeOnTheScreen();
      expect(screen.getByTestId("legend-item-missing")).toBeOnTheScreen();
    });
  });

  describe("Accessibility", () => {
    it("provides proper labels for form elements", () => {
      mockReviewStore.hasEvaluation.mockReturnValue(false);

      render(<AIReview />);

      const submitButton = screen.getByRole("button", { name: /submit/i });

      expect(submitButton).toBeOnTheScreen();
    });

    it("maintains focus management for navigation", () => {
      render(<AIReview />);

      const backButton = screen.getByTestId("ionicon-chevron-back").parent;
      const forwardButton = screen.getByTestId(
        "ionicon-chevron-forward"
      ).parent;

      expect(backButton).toBeTruthy();
      expect(forwardButton).toBeTruthy();
    });
  });
});
