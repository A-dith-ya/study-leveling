import { AnswerSegment, SegmentResult } from "../types/reviewTypes";
import type { Schema } from "../../amplify/data/resource";

/**
 * Sanitizes input text by removing leading/trailing spaces and normalizing multiple spaces between words
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, " ");
};

/**
 * Finds the next matching segment in the text from a given position
 */
const findNextSegment = (
  parts: string[],
  remainingInput: string,
  startPos: number,
  isCorrectParts: boolean
): SegmentResult | null => {
  let earliestIndex = Infinity;
  let foundText = "";
  let segmentType: AnswerSegment["type"] = "none";

  for (const part of parts) {
    if (!part) continue;
    const index = remainingInput.indexOf(part, startPos);
    if (index !== -1 && index < earliestIndex) {
      earliestIndex = index;
      foundText = part;
      segmentType = isCorrectParts ? "correct" : "incorrect";
    }
  }

  if (earliestIndex === Infinity) {
    return null;
  }

  return {
    text: foundText,
    index: earliestIndex,
    type: segmentType,
  };
};

/**
 * Creates segments from the user's answer, marking parts as correct, incorrect, or none
 */
export const createUserAnswerSegments = (
  userInput: string,
  response: Schema["FeedbackResponse"]["type"]
): AnswerSegment[] => {
  const userAnswerSegments: AnswerSegment[] = [];
  let currentPosition = 0;

  // Process the user input sequentially
  while (userInput.length > 0 && currentPosition < userInput.length) {
    // Find the next correct or incorrect segment
    const nextCorrect = findNextSegment(
      (response.correctParts || []).filter(
        (part): part is string => typeof part === "string"
      ),
      userInput,
      currentPosition,
      true
    );
    const nextIncorrect = findNextSegment(
      (response.incorrectParts || []).filter(
        (part): part is string => typeof part === "string"
      ),
      userInput,
      currentPosition,
      false
    );

    // Determine which segment comes first
    let nextSegment = null;
    if (nextCorrect && nextIncorrect) {
      nextSegment =
        nextCorrect.index <= nextIncorrect.index ? nextCorrect : nextIncorrect;
    } else {
      nextSegment = nextCorrect || nextIncorrect;
    }

    if (nextSegment) {
      // Add any unmatched text before this segment as "none"
      if (nextSegment.index > currentPosition) {
        const unmatchedText = userInput.slice(
          currentPosition,
          nextSegment.index
        );
        if (unmatchedText.trim()) {
          userAnswerSegments.push({
            text: unmatchedText,
            type: "none",
          });
        }
      }

      // Add the matched segment
      userAnswerSegments.push({
        text: nextSegment.text,
        type: nextSegment.type,
      });

      currentPosition = nextSegment.index + nextSegment.text.length;
    } else {
      // No more matches found, add remaining text as "none"
      const remainingText = userInput.slice(currentPosition);
      if (remainingText.trim()) {
        userAnswerSegments.push({
          text: remainingText,
          type: "none",
        });
      }
      break;
    }
  }

  return userAnswerSegments;
};

/**
 * Creates segments for the correct answer, showing the base answer as "none" and highlighting missing points
 */
export const createCorrectAnswerSegments = (
  correctAnswer: string,
  response: Schema["FeedbackResponse"]["type"]
): AnswerSegment[] => {
  const correctAnswerSegments: AnswerSegment[] = [];
  let currentPosition = 0;

  // Process the correct answer sequentially
  while (correctAnswer.length > 0 && currentPosition < correctAnswer.length) {
    // Find the next missing point in the correct answer
    const nextMissing = findNextSegment(
      (response.missingPoints || []).filter(
        (part): part is string => typeof part === "string"
      ),
      correctAnswer,
      currentPosition,
      false
    );

    if (nextMissing) {
      // Add any text before the missing point as "none"
      if (nextMissing.index > currentPosition) {
        const normalText = correctAnswer.slice(
          currentPosition,
          nextMissing.index
        );
        if (normalText.trim()) {
          correctAnswerSegments.push({
            text: normalText,
            type: "none",
          });
        }
      }

      // Add the missing point
      correctAnswerSegments.push({
        text: nextMissing.text,
        type: "missing",
      });

      currentPosition = nextMissing.index + nextMissing.text.length;
    } else {
      // No more missing points found, add remaining text as "none"
      const remainingText = correctAnswer.slice(currentPosition);
      if (remainingText.trim()) {
        correctAnswerSegments.push({
          text: remainingText,
          type: "none",
        });
      }
      break;
    }
  }

  return correctAnswerSegments;
};
