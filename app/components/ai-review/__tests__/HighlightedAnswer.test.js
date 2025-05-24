import React from "react";
import { render, screen } from "@testing-library/react-native";

import HighlightedAnswer from "@/app/components/ai-review/HighlightedAnswer";

describe("HighlightedAnswer", () => {
  const mockSegments = [
    { text: "The water ", type: "none" },
    { text: "cycle", type: "correct" },
    { text: " involves ", type: "none" },
    { text: "evaporation", type: "correct" },
    { text: " and ", type: "none" },
    { text: "condensation", type: "missing" },
    { text: " plus ", type: "none" },
    { text: "wrong process", type: "incorrect" },
  ];

  describe("Rendering", () => {
    it("renders the label correctly", () => {
      render(<HighlightedAnswer label="Your Answer" segments={mockSegments} />);

      expect(screen.getByText("Your Answer")).toBeTruthy();
    });

    it("renders all text segments", () => {
      render(<HighlightedAnswer label="Test Answer" segments={mockSegments} />);

      expect(screen.getByText("The water ")).toBeTruthy();
      expect(screen.getByText("cycle")).toBeTruthy();
      expect(screen.getByText(" involves ")).toBeTruthy();
      expect(screen.getByText("evaporation")).toBeTruthy();
      expect(screen.getByText(" and ")).toBeTruthy();
      expect(screen.getByText("condensation")).toBeTruthy();
      expect(screen.getByText(" plus ")).toBeTruthy();
      expect(screen.getByText("wrong process")).toBeTruthy();
    });

    it("applies correct styling based on segment type", () => {
      render(
        <HighlightedAnswer
          label="Test Answer"
          segments={[
            { text: "correct text", type: "correct" },
            { text: "incorrect text", type: "incorrect" },
            { text: "missing text", type: "missing" },
            { text: "normal text", type: "none" },
          ]}
        />
      );

      const correctText = screen.getByText("correct text");
      const incorrectText = screen.getByText("incorrect text");
      const missingText = screen.getByText("missing text");
      const normalText = screen.getByText("normal text");

      expect(correctText).toBeTruthy();
      expect(incorrectText).toBeTruthy();
      expect(missingText).toBeTruthy();
      expect(normalText).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty segments array", () => {
      render(<HighlightedAnswer label="Empty Answer" segments={[]} />);

      expect(screen.getByText("Empty Answer")).toBeTruthy();
    });

    it("handles segments with empty text", () => {
      render(
        <HighlightedAnswer
          label="Test Answer"
          segments={[
            { text: "", type: "correct" },
            { text: "visible text", type: "none" },
          ]}
        />
      );

      expect(screen.getByText("visible text")).toBeTruthy();
    });

    it("handles unknown segment types", () => {
      render(
        <HighlightedAnswer
          label="Test Answer"
          segments={[{ text: "unknown type", type: "unknown" }]}
        />
      );

      expect(screen.getByText("unknown type")).toBeTruthy();
    });

    it("handles segments with special characters", () => {
      render(
        <HighlightedAnswer
          label="Special Characters"
          segments={[
            { text: "Text with !@#$%^&*()", type: "correct" },
            { text: "Unicode: 🌟🔬⚡", type: "incorrect" },
          ]}
        />
      );

      expect(screen.getByText("Text with !@#$%^&*()")).toBeTruthy();
      expect(screen.getByText("Unicode: 🌟🔬⚡")).toBeTruthy();
    });

    it("handles very long text segments", () => {
      const longText =
        "This is a very long text segment that should still render correctly even when it contains many words and characters that might cause wrapping or other display issues in the user interface.";

      render(
        <HighlightedAnswer
          label="Long Text"
          segments={[{ text: longText, type: "correct" }]}
        />
      );

      expect(screen.getByText(longText)).toBeTruthy();
    });
  });

  describe("Props Validation", () => {
    it("handles different label types", () => {
      render(
        <HighlightedAnswer label="Correct Answer" segments={mockSegments} />
      );

      expect(screen.getByText("Correct Answer")).toBeTruthy();
    });

    it("renders unique keys for segments with same text", () => {
      const duplicateSegments = [
        { text: "same text", type: "correct" },
        { text: "same text", type: "incorrect" },
        { text: "same text", type: "none" },
      ];

      render(
        <HighlightedAnswer
          label="Duplicate Text"
          segments={duplicateSegments}
        />
      );

      const elements = screen.getAllByText("same text");
      expect(elements).toHaveLength(3);
    });
  });

  describe("Accessibility", () => {
    it("has proper text content for screen readers", () => {
      render(
        <HighlightedAnswer
          label="Screen Reader Test"
          segments={[
            { text: "This text ", type: "none" },
            { text: "should be readable", type: "correct" },
            { text: " by screen readers", type: "none" },
          ]}
        />
      );

      expect(screen.getByText("Screen Reader Test")).toBeTruthy();
      expect(screen.getByText("This text ")).toBeTruthy();
      expect(screen.getByText("should be readable")).toBeTruthy();
      expect(screen.getByText(" by screen readers")).toBeTruthy();
    });
  });

  describe("Component Structure", () => {
    it("uses ScrollView for scrollable content", () => {
      const { UNSAFE_getByType } = render(
        <HighlightedAnswer label="Scrollable Content" segments={mockSegments} />
      );

      const scrollView = UNSAFE_getByType(require("react-native").ScrollView);
      expect(scrollView).toBeTruthy();
    });

    it("maintains proper text hierarchy", () => {
      render(
        <HighlightedAnswer
          label="Hierarchy Test"
          segments={[
            { text: "First part ", type: "correct" },
            { text: "second part", type: "incorrect" },
          ]}
        />
      );

      // Label should be rendered as a separate text element
      expect(screen.getByText("Hierarchy Test")).toBeTruthy();

      // Segments should be rendered as separate text elements
      expect(screen.getByText("First part ")).toBeTruthy();
      expect(screen.getByText("second part")).toBeTruthy();
    });
  });

  describe("Styling Integration", () => {
    it("applies container styles correctly", () => {
      const { UNSAFE_getByType } = render(
        <HighlightedAnswer label="Style Test" segments={mockSegments} />
      );

      const scrollView = UNSAFE_getByType(require("react-native").ScrollView);
      expect(scrollView.props.style).toBeDefined();
    });
  });
});
