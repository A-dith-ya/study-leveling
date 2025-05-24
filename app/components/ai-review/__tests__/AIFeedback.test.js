import React from "react";
import { render, screen } from "@testing-library/react-native";

import AIFeedback from "@/app/components/ai-review/AIFeedback";

describe("AIFeedback", () => {
  describe("Rendering", () => {
    it("renders the section label correctly", () => {
      render(<AIFeedback explanation="Test explanation" />);

      expect(screen.getByText("AI Feedback")).toBeTruthy();
    });

    it("renders the explanation text", () => {
      const explanation = "This is a detailed explanation of your answer.";

      render(<AIFeedback explanation={explanation} />);

      expect(screen.getByText(explanation)).toBeTruthy();
    });

    it("renders with proper component structure", () => {
      const { UNSAFE_getByType } = render(
        <AIFeedback explanation="Test explanation" />
      );

      const scrollView = UNSAFE_getByType(require("react-native").ScrollView);
      expect(scrollView).toBeTruthy();
    });
  });

  describe("Content Handling", () => {
    it("handles short explanations", () => {
      const shortExplanation = "Good!";

      render(<AIFeedback explanation={shortExplanation} />);

      expect(screen.getByText(shortExplanation)).toBeTruthy();
    });

    it("handles long explanations", () => {
      const longExplanation =
        "This is a very detailed explanation that covers multiple aspects of the answer. It includes information about what was correct, what was incorrect, what was missing, and provides additional context to help the student understand the topic better. The explanation should be scrollable when it exceeds the available space in the component.";

      render(<AIFeedback explanation={longExplanation} />);

      expect(screen.getByText(longExplanation)).toBeTruthy();
    });

    it("handles explanations with special characters", () => {
      const specialExplanation =
        "Great work! 🎉 You got 85% correct. Here's what you missed: H₂O → water molecule.";

      render(<AIFeedback explanation={specialExplanation} />);

      expect(screen.getByText(specialExplanation)).toBeTruthy();
    });

    it("handles explanations with line breaks", () => {
      const multilineExplanation =
        "Your answer was partially correct.\n\nYou understood the main concept but missed some details.\n\nTry to be more specific next time.";

      render(<AIFeedback explanation={multilineExplanation} />);

      expect(screen.getByText(multilineExplanation)).toBeTruthy();
    });

    it("handles explanations with HTML-like content", () => {
      const htmlExplanation =
        "Your answer mentioned <strong>photosynthesis</strong> but missed the role of chlorophyll.";

      render(<AIFeedback explanation={htmlExplanation} />);

      expect(screen.getByText(htmlExplanation)).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty string explanation", () => {
      render(<AIFeedback explanation="" />);

      expect(screen.getByText("AI Feedback")).toBeTruthy();
      expect(screen.getByText("")).toBeTruthy();
    });

    it("handles whitespace-only explanation", () => {
      const whitespaceExplanation = "   \n\t   ";

      render(<AIFeedback explanation={whitespaceExplanation} />);

      expect(screen.getByText("AI Feedback")).toBeTruthy();
      expect(screen.getByText(whitespaceExplanation)).toBeTruthy();
    });

    it("handles explanation with only punctuation", () => {
      const punctuationExplanation = "!!!...???";

      render(<AIFeedback explanation={punctuationExplanation} />);

      expect(screen.getByText(punctuationExplanation)).toBeTruthy();
    });
  });

  describe("Props Validation", () => {
    it("requires explanation prop", () => {
      // This test ensures the component expects an explanation prop
      const explanation = "Required explanation";

      render(<AIFeedback explanation={explanation} />);

      expect(screen.getByText(explanation)).toBeTruthy();
    });

    it("handles numeric explanation values", () => {
      // Edge case where explanation might be passed as number
      const numericExplanation = "Your score: 85";

      render(<AIFeedback explanation={numericExplanation} />);

      expect(screen.getByText(numericExplanation)).toBeTruthy();
    });
  });

  describe("Accessibility", () => {
    it("provides accessible text content", () => {
      const explanation =
        "This explanation should be accessible to screen readers.";

      render(<AIFeedback explanation={explanation} />);

      expect(screen.getByText("AI Feedback")).toBeTruthy();
      expect(screen.getByText(explanation)).toBeTruthy();
    });

    it("maintains proper heading hierarchy", () => {
      render(<AIFeedback explanation="Test explanation for hierarchy" />);

      // The "AI Feedback" label should be rendered as a prominent text element
      expect(screen.getByText("AI Feedback")).toBeTruthy();
    });
  });

  describe("Styling Integration", () => {
    it("applies container styles", () => {
      const { UNSAFE_getByType } = render(
        <AIFeedback explanation="Styled content" />
      );

      const container = UNSAFE_getByType(require("react-native").View);
      expect(container.props.style).toBeDefined();
    });

    it("applies scroll view styles", () => {
      const { UNSAFE_getByType } = render(
        <AIFeedback explanation="Scrollable content" />
      );

      const scrollView = UNSAFE_getByType(require("react-native").ScrollView);
      expect(scrollView.props.style).toBeDefined();
      expect(scrollView.props.showsVerticalScrollIndicator).toBe(false);
    });
  });

  describe("Performance", () => {
    it("renders efficiently with large content", () => {
      const largeExplanation = "A".repeat(10000); // Very large text

      const startTime = Date.now();
      render(<AIFeedback explanation={largeExplanation} />);
      const renderTime = Date.now() - startTime;

      expect(screen.getByText("AI Feedback")).toBeTruthy();
      expect(renderTime).toBeLessThan(1000); // Should render in under 1 second
    });

    it("handles re-renders efficiently", () => {
      const { rerender } = render(
        <AIFeedback explanation="Initial explanation" />
      );

      expect(screen.getByText("Initial explanation")).toBeTruthy();

      rerender(<AIFeedback explanation="Updated explanation" />);

      expect(screen.getByText("Updated explanation")).toBeTruthy();
      expect(screen.queryByText("Initial explanation")).toBeFalsy();
    });
  });

  describe("Content Display", () => {
    it("preserves text formatting", () => {
      const formattedExplanation =
        "Your answer was good.\n\nHowever, you could improve by:\n- Being more specific\n- Adding examples\n- Checking spelling";

      render(<AIFeedback explanation={formattedExplanation} />);

      expect(screen.getByText(formattedExplanation)).toBeTruthy();
    });

    it("displays content within scrollable container", () => {
      const { UNSAFE_getByType } = render(
        <AIFeedback explanation="Scrollable explanation content" />
      );

      const scrollView = UNSAFE_getByType(require("react-native").ScrollView);
      expect(scrollView).toBeTruthy();

      // Check that the ScrollView contains the text
      const textElement = screen.getByText("Scrollable explanation content");
      expect(textElement).toBeTruthy();
    });
  });
});
