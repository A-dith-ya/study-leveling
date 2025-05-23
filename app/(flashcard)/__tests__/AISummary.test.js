import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";

import AISummary from "../AISummary";
import { useReviewStore } from "../../stores/reviewStore";
import { useDeck } from "../../hooks/useDeck";

// Mock dependencies
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
}));

jest.mock("../../stores/reviewStore", () => ({
  useReviewStore: jest.fn(),
}));

jest.mock("../../hooks/useDeck", () => ({
  useDeck: jest.fn(),
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
jest.mock("../../components/ai-review/HighlightedAnswer", () => {
  return function MockHighlightedAnswer({ label, segments }) {
    const React = require("react");
    return React.createElement("View", {
      testID: `highlighted-answer-${label.toLowerCase().replace(/\s+/g, '-')}`,
      children: [
        React.createElement("Text", { key: "label" }, label),
        React.createElement("Text", { key: "segments" }, segments?.map(s => s.text).join('') || ''),
      ],
    });
  };
});

jest.mock("../../components/ai-review/AIFeedback", () => {
  return function MockAIFeedback({ explanation }) {
    const React = require("react");
    return React.createElement("View", {
      testID: "ai-feedback",
      children: React.createElement("Text", {}, explanation),
    });
  };
});

jest.mock("../../components/common/LoadingScreen", () => {
  return function MockLoadingScreen({ message }) {
    const React = require("react");
    return React.createElement("View", {
      testID: "loading-screen",
      children: React.createElement("Text", {}, message),
    });
  };
});

jest.mock("@shopify/flash-list", () => ({
  FlashList: ({ data, renderItem }) => {
    const React = require("react");
    return React.createElement("View", {
      testID: "flash-list",
      children: data?.map((item, index) => 
        React.createElement("View", {
          key: item.id || index,
          testID: `flashcard-item-${index}`,
        }, renderItem({ item, index }))
      ) || [],
    });
  },
}));

jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  
  return {
    ...Reanimated,
    FadeInUp: {
      delay: jest.fn(() => ({})),
    },
  };
});

describe("AISummary", () => {
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
    "card-2": {
      userAnswerSegments: [
        { text: "Water moves ", type: "correct" },
        { text: "in circles", type: "incorrect" },
      ],
      correctAnswerSegments: [
        { text: "The continuous ", type: "missing" },
        { text: "movement of water", type: "correct" },
        { text: " on Earth", type: "missing" },
      ],
      aiExplanation: "You understand water movement but missed key details about continuity and Earth's involvement.",
    },
  };

  const mockUserAnswers = {
    "card-1": "Plants make food using sunlight",
    "card-2": "Water moves in circles",
  };

  const mockReviewStore = {
    deckId: "deck-1",
    evaluations: mockEvaluations,
    userAnswers: mockUserAnswers,
    hasEvaluation: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    useReviewStore.mockReturnValue(mockReviewStore);
    useDeck.mockReturnValue({
      data: mockDeckData,
      isLoading: false,
    });
    
    mockReviewStore.hasEvaluation.mockImplementation((cardId) => 
      mockEvaluations.hasOwnProperty(cardId)
    );
  });

  describe("Rendering", () => {
    it("renders the summary header correctly", () => {
      render(<AISummary />);

      expect(screen.getByText("Review Summary")).toBeOnTheScreen();
      expect(screen.getByText("2 of 3 Cards Reviewed")).toBeOnTheScreen();
    });

    it("renders evaluated flashcard summaries", () => {
      render(<AISummary />);

      expect(screen.getByText("What is photosynthesis?")).toBeOnTheScreen();
      expect(screen.getByText("What is the water cycle?")).toBeOnTheScreen();
      expect(screen.queryByText("What is gravity?")).not.toBeOnTheScreen();
    });

    it("renders highlighted answers for evaluated cards", () => {
      render(<AISummary />);

      // Use getAllByTestId for elements that appear multiple times
      expect(screen.getAllByTestId("highlighted-answer-your-answer")).toHaveLength(2);
      expect(screen.getAllByTestId("highlighted-answer-correct-answer")).toHaveLength(2);
    });

    it("renders AI feedback for evaluated cards", () => {
      render(<AISummary />);

      expect(screen.getByText("Good understanding of photosynthesis basics.")).toBeOnTheScreen();
      expect(screen.getByText("You understand water movement but missed key details about continuity and Earth's involvement.")).toBeOnTheScreen();
    });

    it("renders bottom action buttons with Ionicons", () => {
      render(<AISummary />);

      expect(screen.getByText("Retry Session")).toBeOnTheScreen();
      expect(screen.getByText("Dashboard")).toBeOnTheScreen();
      expect(screen.getByTestId("ionicon-refresh-outline")).toBeOnTheScreen();
      expect(screen.getByTestId("ionicon-home-outline")).toBeOnTheScreen();
    });
  });

  describe("Loading States", () => {
    it("shows loading screen when deck data is loading", () => {
      useDeck.mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(<AISummary />);

      expect(screen.getByTestId("loading-screen")).toBeOnTheScreen();
      expect(screen.getByText("Loading summary...")).toBeOnTheScreen();
    });

    it("shows loading screen when deck data is null", () => {
      useDeck.mockReturnValue({
        data: null,
        isLoading: false,
      });

      render(<AISummary />);

      expect(screen.getByTestId("loading-screen")).toBeOnTheScreen();
    });
  });

  describe("Empty States", () => {
    it("shows empty state when no cards are evaluated", () => {
      mockReviewStore.hasEvaluation.mockReturnValue(false);

      render(<AISummary />);

      expect(screen.getByText("No cards have been reviewed yet.")).toBeOnTheScreen();
      expect(screen.getByText("Start Review")).toBeOnTheScreen();
      expect(screen.getByText("0 of 3 Cards Reviewed")).toBeOnTheScreen();
    });

    it("shows start review button in empty state", () => {
      mockReviewStore.hasEvaluation.mockReturnValue(false);

      render(<AISummary />);

      expect(screen.getByText("Start Review")).toBeOnTheScreen();
    });
  });

  describe("Navigation", () => {
    it("navigates to AIReview when retry button is pressed", () => {
      render(<AISummary />);

      fireEvent.press(screen.getByText("Retry Session"));

      expect(router.replace).toHaveBeenCalledWith({
        pathname: "/(flashcard)/AIReview",
        params: { deckId: "deck-1" },
      });
    });

    it("navigates to dashboard when dashboard button is pressed", () => {
      render(<AISummary />);

      fireEvent.press(screen.getByText("Dashboard"));

      expect(router.replace).toHaveBeenCalledWith("/(amain)");
    });

    it("navigates to AIReview when start review button is pressed in empty state", () => {
      mockReviewStore.hasEvaluation.mockReturnValue(false);

      render(<AISummary />);

      fireEvent.press(screen.getByText("Start Review"));

      expect(router.replace).toHaveBeenCalledWith({
        pathname: "/(flashcard)/AIReview",
        params: { deckId: "deck-1" },
      });
    });
  });

  describe("Data Processing", () => {
    it("correctly filters evaluated cards", () => {
      render(<AISummary />);

      // Should show 2 evaluated cards, not the 3rd unevaluated one
      expect(screen.getByText("What is photosynthesis?")).toBeOnTheScreen();
      expect(screen.getByText("What is the water cycle?")).toBeOnTheScreen();
      expect(screen.queryByText("What is gravity?")).not.toBeOnTheScreen();
    });

    it("handles missing evaluation data gracefully", () => {
      const incompleteEvaluations = {
        "card-1": {
          userAnswerSegments: [{ text: "test", type: "correct" }],
          // Missing correctAnswerSegments and aiExplanation
        },
      };

      useReviewStore.mockReturnValue({
        ...mockReviewStore,
        evaluations: incompleteEvaluations,
      });

      render(<AISummary />);

      expect(screen.getByText("What is photosynthesis?")).toBeOnTheScreen();
    });

    it("handles missing user answers gracefully", () => {
      useReviewStore.mockReturnValue({
        ...mockReviewStore,
        userAnswers: {},
      });

      render(<AISummary />);

      expect(screen.getByText("What is photosynthesis?")).toBeOnTheScreen();
      expect(screen.getByText("What is the water cycle?")).toBeOnTheScreen();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty deck data", () => {
      useDeck.mockReturnValue({
        data: { flashcards: [] },
        isLoading: false,
      });

      render(<AISummary />);

      expect(screen.getByText("0 of 0 Cards Reviewed")).toBeOnTheScreen();
      expect(screen.getByText("No cards have been reviewed yet.")).toBeOnTheScreen();
    });

    it("handles undefined deckId", () => {
      useReviewStore.mockReturnValue({
        ...mockReviewStore,
        deckId: undefined,
      });

      useDeck.mockReturnValue({
        data: null,
        isLoading: false,
      });

      render(<AISummary />);

      expect(screen.getByTestId("loading-screen")).toBeOnTheScreen();
    });

    it("handles malformed evaluation data", () => {
      const malformedEvaluations = {
        "card-1": {
          userAnswerSegments: null,
          correctAnswerSegments: undefined,
          aiExplanation: "",
        },
      };

      useReviewStore.mockReturnValue({
        ...mockReviewStore,
        evaluations: malformedEvaluations,
      });

      render(<AISummary />);

      expect(screen.getByText("What is photosynthesis?")).toBeOnTheScreen();
    });
  });

  describe("Component Integration", () => {
    it("passes correct props to HighlightedAnswer components", () => {
      render(<AISummary />);

      expect(screen.getAllByTestId("highlighted-answer-your-answer")).toHaveLength(2);
      expect(screen.getAllByTestId("highlighted-answer-correct-answer")).toHaveLength(2);
    });

    it("passes correct props to AIFeedback component", () => {
      render(<AISummary />);

      expect(screen.getAllByTestId("ai-feedback")).toHaveLength(2);
    });

    it("renders FlashList with correct data", () => {
      render(<AISummary />);

      expect(screen.getByTestId("flash-list")).toBeOnTheScreen();
    });
  });
});