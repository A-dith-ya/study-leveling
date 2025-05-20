import { createUserAnswerSegments, createCorrectAnswerSegments } from '../reviewUtils';
import type { Schema } from "../../../amplify/data/resource";

describe('createUserAnswerSegments', () => {
  const mockResponse:Schema["FeedbackResponse"]["type"] = {
    correctParts: ["water moves", "evaporation"],
    incorrectParts: ["into rivers"],
    missingPoints: ["condensation", "precipitation"],
    aiExplanation: "Test explanation"
  };

  it('should correctly segment user input with correct and incorrect parts', () => {
    const userInput = "The water moves through the air and goes into rivers with evaporation";
    const segments = createUserAnswerSegments(userInput, mockResponse);

    expect(segments).toEqual([
      { text: "The ", type: "none" },
      { text: "water moves", type: "correct" },
      { text: " through the air and goes ", type: "none" },
      { text: "into rivers", type: "incorrect" },
      { text: " with ", type: "none" },
      { text: "evaporation", type: "correct" }
    ]);
  });

  it('should handle empty user input', () => {
    const segments = createUserAnswerSegments("", mockResponse);
    expect(segments).toEqual([]);
  });

  it('should handle input with no matches', () => {
    const userInput = "Something completely different";
    const segments = createUserAnswerSegments(userInput, mockResponse);
    expect(segments).toEqual([
      { text: "Something completely different", type: "none" }
    ]);
  });

  it('should handle null parts in response', () => {
    const response: Schema["FeedbackResponse"]["type"] = {
      correctParts: [null, "valid part", null],
      incorrectParts: [],
      missingPoints: [],
      aiExplanation: ""
    };
    const userInput = "This is a valid part test";
    const segments = createUserAnswerSegments(userInput, response);
    expect(segments).toEqual([
      { text: "This is a ", type: "none" },
      { text: "valid part", type: "correct" },
      { text: " test", type: "none" }
    ]);
  });
});

describe('createCorrectAnswerSegments', () => {
  const mockResponse: Schema["FeedbackResponse"]["type"] = {
    correctParts: ["water cycle", "evaporation"],
    incorrectParts: ["wrong part"],
    missingPoints: ["condensation process", "precipitation"],
    aiExplanation: "Test explanation"
  };

  it('should correctly segment correct answer with missing points', () => {
    const correctAnswer = "The water cycle includes evaporation and condensation process with precipitation";
    const segments = createCorrectAnswerSegments(correctAnswer, mockResponse);

    expect(segments).toEqual([
      { text: "The water cycle includes evaporation and ", type: "none" },
      { text: "condensation process", type: "missing" },
      { text: " with ", type: "none" },
      { text: "precipitation", type: "missing" }
    ]);
  });

  it('should handle empty correct answer', () => {
    const segments = createCorrectAnswerSegments("", mockResponse);
    expect(segments).toEqual([]);
  });

  it('should handle answer with no missing points', () => {
    const response: Schema["FeedbackResponse"]["type"] = {
      correctParts: [],
      incorrectParts: [],
      missingPoints: [],
      aiExplanation: ""
    };
    const correctAnswer = "Complete answer with no missing points";
    const segments = createCorrectAnswerSegments(correctAnswer, response);
    expect(segments).toEqual([
      { text: "Complete answer with no missing points", type: "none" }
    ]);
  });

  it('should handle null or undefined missing points', () => {
    const response: Schema["FeedbackResponse"]["type"] = {
      correctParts: [],
      incorrectParts: [],
      missingPoints: [null, "valid missing point", null],
      aiExplanation: ""
    };
    const correctAnswer = "Answer with valid missing point here";
    const segments = createCorrectAnswerSegments(correctAnswer, response);
    expect(segments).toEqual([
      { text: "Answer with ", type: "none" },
      { text: "valid missing point", type: "missing" },
      { text: " here", type: "none" }
    ]);
  });
});

// Test edge cases and error handling
describe('Edge cases and error handling', () => {
  const mockResponse: Schema["FeedbackResponse"]["type"] = {
    correctParts: ["test"],
    incorrectParts: ["wrong"],
    missingPoints: ["missing"],
    aiExplanation: ""
  };

  it('should handle overlapping segments in user answer', () => {
    const userInput = "test wrong test"; // Contains both correct and incorrect parts
    const segments = createUserAnswerSegments(userInput, mockResponse);
    expect(segments.length).toBeGreaterThan(0);
    expect(segments.every(s => s.text && s.type)).toBe(true);
  });

  it('should handle special characters in input', () => {
    const userInput = "test! @wrong# $test%";
    const segments = createUserAnswerSegments(userInput, mockResponse);
    expect(segments.length).toBeGreaterThan(0);
    expect(segments.every(s => s.text && s.type)).toBe(true);
  });

  it('should handle multiple consecutive spaces', () => {
    const userInput = "test    wrong     test";
    const segments = createUserAnswerSegments(userInput, mockResponse);
    expect(segments.length).toBeGreaterThan(0);
    expect(segments.every(s => s.text && s.type)).toBe(true);
  });

  it('should handle case sensitivity', () => {
    const userInput = "TEST wrong TEST";
    const segments = createUserAnswerSegments(userInput, mockResponse);
    expect(segments).toEqual([
      { text: "TEST ", type: "none" }, 
      { text: "wrong", type: "incorrect" },
      { text: " TEST", type: "none" },
    ]);
  });
}); 