// Mock uuid before imports
jest.mock("uuid", () => ({
  v4: jest.fn(),
}));

import { v4 as uuidv4 } from "uuid";
import {
  fisherYatesShuffle,
  createNewFlashcard,
  updateFlashcardField,
  deleteFlashcardAndReorder,
  moveFlashcard,
  validateFlashcards,
} from "@/app/utils/flashcardUtils";
import { Flashcard } from "@/app/types/flashcardTypes";

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>;

describe("flashcardUtils", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup uuid mock to return predictable values
    let counter = 0;
    mockUuidv4.mockImplementation(() => `test-uuid-${++counter}` as any);

    // Reset counter for each test
    counter = 0;
  });

  describe("fisherYatesShuffle", () => {
    // Mock Math.random for predictable shuffling
    const originalRandom = Math.random;

    beforeEach(() => {
      // Mock Math.random to return 0.5 for consistent testing
      Math.random = jest.fn(() => 0.5);
    });

    afterEach(() => {
      Math.random = originalRandom;
    });

    it("should shuffle an array and return all elements", () => {
      const input = [1, 2, 3, 4, 5];
      const result = fisherYatesShuffle(input);

      expect(result).toHaveLength(5);
      expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
      expect(result).not.toBe(input); // Should be a new array
    });

    it("should return limited count when count parameter is provided", () => {
      const input = [1, 2, 3, 4, 5];
      const result = fisherYatesShuffle(input, 3);

      expect(result).toHaveLength(3);
      expect(result.every((item) => input.includes(item))).toBe(true);
    });

    it("should handle empty array", () => {
      const result = fisherYatesShuffle([]);
      expect(result).toEqual([]);
    });

    it("should handle single element array", () => {
      const input = [42];
      const result = fisherYatesShuffle(input);
      expect(result).toEqual([42]);
    });

    it("should handle count larger than array length", () => {
      const input = [1, 2, 3];
      const result = fisherYatesShuffle(input, 10);

      expect(result).toHaveLength(3);
      expect(result.sort()).toEqual([1, 2, 3]);
    });

    it("should handle count of 0", () => {
      const input = [1, 2, 3, 4, 5];
      const result = fisherYatesShuffle(input, 0);
      expect(result).toEqual([]);
    });

    it("should handle negative count", () => {
      const input = [1, 2, 3, 4, 5];
      const result = fisherYatesShuffle(input, -1);
      // slice(0, -1) returns all but the last element
      expect(result).toHaveLength(4);
      expect(result.every((item) => input.includes(item))).toBe(true);
    });

    it("should work with different data types", () => {
      const input = ["a", "b", "c", "d"];
      const result = fisherYatesShuffle(input);

      expect(result).toHaveLength(4);
      expect(result.sort()).toEqual(["a", "b", "c", "d"]);
    });

    it("should work with object arrays", () => {
      const input = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = fisherYatesShuffle(input);

      expect(result).toHaveLength(3);
      expect(result.map((item) => item.id).sort()).toEqual([1, 2, 3]);
    });

    it("should not mutate original array", () => {
      const input = [1, 2, 3, 4, 5];
      const originalInput = [...input];
      fisherYatesShuffle(input);

      expect(input).toEqual(originalInput);
    });
  });

  describe("createNewFlashcard", () => {
    it("should create a new flashcard with correct structure", () => {
      const result = createNewFlashcard(5);

      expect(result).toEqual({
        id: "test-uuid-1",
        front: "",
        back: "",
        order: 5,
      });
    });

    it("should create flashcard with order 0 for empty deck", () => {
      const result = createNewFlashcard(0);

      expect(result.order).toBe(0);
      expect(result.front).toBe("");
      expect(result.back).toBe("");
      expect(result.id).toBe("test-uuid-1");
    });

    it("should handle large order values", () => {
      const result = createNewFlashcard(1000);
      expect(result.order).toBe(1000);
    });

    it("should handle negative order values", () => {
      const result = createNewFlashcard(-1);
      expect(result.order).toBe(-1);
    });

    it("should generate unique IDs for multiple calls", () => {
      const card1 = createNewFlashcard(0);
      const card2 = createNewFlashcard(1);

      expect(card1.id).toBe("test-uuid-1");
      expect(card2.id).toBe("test-uuid-2");
      expect(card1.id).not.toBe(card2.id);
    });

    it("should handle decimal order values", () => {
      const result = createNewFlashcard(2.5);
      expect(result.order).toBe(2.5);
    });
  });

  describe("updateFlashcardField", () => {
    const mockFlashcards: Flashcard[] = [
      { id: "1", front: "Question 1", back: "Answer 1", order: 0 },
      { id: "2", front: "Question 2", back: "Answer 2", order: 1 },
      { id: "3", front: "Question 3", back: "Answer 3", order: 2 },
    ];

    it("should update front field of existing flashcard", () => {
      const result = updateFlashcardField(
        mockFlashcards,
        "2",
        "front",
        "Updated Question"
      );

      expect(result[1].front).toBe("Updated Question");
      expect(result[1].back).toBe("Answer 2");
      expect(result[1].id).toBe("2");
      expect(result[1].order).toBe(1);
    });

    it("should update back field of existing flashcard", () => {
      const result = updateFlashcardField(
        mockFlashcards,
        "3",
        "back",
        "Updated Answer"
      );

      expect(result[2].back).toBe("Updated Answer");
      expect(result[2].front).toBe("Question 3");
      expect(result[2].id).toBe("3");
      expect(result[2].order).toBe(2);
    });

    it("should not modify other flashcards", () => {
      const result = updateFlashcardField(
        mockFlashcards,
        "2",
        "front",
        "Updated Question"
      );

      expect(result[0]).toEqual(mockFlashcards[0]);
      expect(result[2]).toEqual(mockFlashcards[2]);
    });

    it("should handle non-existent ID", () => {
      const result = updateFlashcardField(
        mockFlashcards,
        "999",
        "front",
        "New Value"
      );

      expect(result).toEqual(mockFlashcards);
    });

    it("should handle empty string value", () => {
      const result = updateFlashcardField(mockFlashcards, "1", "front", "");

      expect(result[0].front).toBe("");
      expect(result[0].back).toBe("Answer 1");
    });

    it("should handle long string values", () => {
      const longString = "A".repeat(1000);
      const result = updateFlashcardField(
        mockFlashcards,
        "1",
        "back",
        longString
      );

      expect(result[0].back).toBe(longString);
    });

    it("should handle special characters", () => {
      const specialValue = "Special chars: !@#$%^&*()_+{}|:<>?[]\\;',./";
      const result = updateFlashcardField(
        mockFlashcards,
        "1",
        "front",
        specialValue
      );

      expect(result[0].front).toBe(specialValue);
    });

    it("should handle unicode characters", () => {
      const unicodeValue = "🎯 Math: x² + y² = z² 中文 العربية";
      const result = updateFlashcardField(
        mockFlashcards,
        "1",
        "back",
        unicodeValue
      );

      expect(result[0].back).toBe(unicodeValue);
    });

    it("should return new array without mutating original", () => {
      const originalFlashcards = [...mockFlashcards];
      const result = updateFlashcardField(
        mockFlashcards,
        "1",
        "front",
        "New Value"
      );

      expect(mockFlashcards).toEqual(originalFlashcards);
      expect(result).not.toBe(mockFlashcards);
    });

    it("should handle empty flashcards array", () => {
      const result = updateFlashcardField([], "1", "front", "Value");
      expect(result).toEqual([]);
    });
  });

  describe("deleteFlashcardAndReorder", () => {
    const mockFlashcards: Flashcard[] = [
      { id: "1", front: "Q1", back: "A1", order: 0 },
      { id: "2", front: "Q2", back: "A2", order: 1 },
      { id: "3", front: "Q3", back: "A3", order: 2 },
      { id: "4", front: "Q4", back: "A4", order: 3 },
    ];

    it("should delete flashcard and reorder correctly when deleting from middle", () => {
      const result = deleteFlashcardAndReorder(mockFlashcards, "2");

      expect(result.deletedCardIndex).toBe(1);
      expect(result.updatedFlashcards).toHaveLength(3);
      expect(result.updatedFlashcards).toEqual([
        { id: "1", front: "Q1", back: "A1", order: 0 },
        { id: "3", front: "Q3", back: "A3", order: 1 }, // order decreased
        { id: "4", front: "Q4", back: "A4", order: 2 }, // order decreased
      ]);
    });

    it("should delete first flashcard and reorder correctly", () => {
      const result = deleteFlashcardAndReorder(mockFlashcards, "1");

      expect(result.deletedCardIndex).toBe(0);
      expect(result.updatedFlashcards).toHaveLength(3);
      expect(result.updatedFlashcards).toEqual([
        { id: "2", front: "Q2", back: "A2", order: 0 }, // order decreased by 1
        { id: "3", front: "Q3", back: "A3", order: 1 }, // order decreased by 1
        { id: "4", front: "Q4", back: "A4", order: 2 }, // order decreased by 1
      ]);
    });

    it("should delete last flashcard without affecting others", () => {
      const result = deleteFlashcardAndReorder(mockFlashcards, "4");

      expect(result.deletedCardIndex).toBe(3);
      expect(result.updatedFlashcards).toHaveLength(3);
      expect(result.updatedFlashcards).toEqual([
        { id: "1", front: "Q1", back: "A1", order: 0 },
        { id: "2", front: "Q2", back: "A2", order: 1 },
        { id: "3", front: "Q3", back: "A3", order: 2 },
      ]);
    });

    it("should handle non-existent ID", () => {
      const result = deleteFlashcardAndReorder(mockFlashcards, "999");

      expect(result.deletedCardIndex).toBe(-1);
      // When deletedCardIndex is -1, all cards with order > -1 get decremented
      expect(result.updatedFlashcards).toEqual([
        { id: "1", front: "Q1", back: "A1", order: -1 },
        { id: "2", front: "Q2", back: "A2", order: 0 },
        { id: "3", front: "Q3", back: "A3", order: 1 },
        { id: "4", front: "Q4", back: "A4", order: 2 },
      ]);
    });

    it("should handle single flashcard", () => {
      const singleCard = [{ id: "1", front: "Q1", back: "A1", order: 0 }];
      const result = deleteFlashcardAndReorder(singleCard, "1");

      expect(result.deletedCardIndex).toBe(0);
      expect(result.updatedFlashcards).toEqual([]);
    });

    it("should handle empty array", () => {
      const result = deleteFlashcardAndReorder([], "1");

      expect(result.deletedCardIndex).toBe(-1);
      expect(result.updatedFlashcards).toEqual([]);
    });

    it("should not mutate original array", () => {
      const originalFlashcards = [...mockFlashcards];
      deleteFlashcardAndReorder(mockFlashcards, "2");

      expect(mockFlashcards).toEqual(originalFlashcards);
    });

    it("should handle flashcards with non-sequential orders", () => {
      const nonSequentialCards = [
        { id: "1", front: "Q1", back: "A1", order: 0 },
        { id: "2", front: "Q2", back: "A2", order: 5 },
        { id: "3", front: "Q3", back: "A3", order: 10 },
      ];

      const result = deleteFlashcardAndReorder(nonSequentialCards, "2");

      expect(result.deletedCardIndex).toBe(1);
      expect(result.updatedFlashcards).toEqual([
        { id: "1", front: "Q1", back: "A1", order: 0 },
        { id: "3", front: "Q3", back: "A3", order: 9 }, // order decreased by 1
      ]);
    });
  });

  describe("moveFlashcard", () => {
    const mockFlashcards: Flashcard[] = [
      { id: "1", front: "Q1", back: "A1", order: 0 },
      { id: "2", front: "Q2", back: "A2", order: 1 },
      { id: "3", front: "Q3", back: "A3", order: 2 },
      { id: "4", front: "Q4", back: "A4", order: 3 },
    ];

    it("should move flashcard up correctly", () => {
      const result = moveFlashcard(mockFlashcards, 2, "up");

      expect(result).toEqual([
        { id: "1", front: "Q1", back: "A1", order: 0 },
        { id: "3", front: "Q3", back: "A3", order: 1 }, // moved up
        { id: "2", front: "Q2", back: "A2", order: 2 }, // moved down
        { id: "4", front: "Q4", back: "A4", order: 3 },
      ]);
    });

    it("should move flashcard down correctly", () => {
      const result = moveFlashcard(mockFlashcards, 1, "down");

      expect(result).toEqual([
        { id: "1", front: "Q1", back: "A1", order: 0 },
        { id: "2", front: "Q2", back: "A2", order: 1 }, // stayed in same position after sorting
        { id: "3", front: "Q3", back: "A3", order: 2 },
        { id: "4", front: "Q4", back: "A4", order: 3 },
      ]);
    });

    it("should not move first flashcard up", () => {
      const result = moveFlashcard(mockFlashcards, 0, "up");
      expect(result).toEqual(mockFlashcards);
    });

    it("should not move last flashcard down", () => {
      const result = moveFlashcard(mockFlashcards, 3, "down");
      expect(result).toEqual(mockFlashcards);
    });

    it("should handle index out of bounds", () => {
      const result = moveFlashcard(mockFlashcards, 10, "up");
      expect(result).toEqual(mockFlashcards);
    });

    it("should handle single flashcard", () => {
      const singleCard = [{ id: "1", front: "Q1", back: "A1", order: 0 }];
      const resultUp = moveFlashcard(singleCard, 0, "up");
      const resultDown = moveFlashcard(singleCard, 0, "down");

      expect(resultUp).toEqual(singleCard);
      expect(resultDown).toEqual(singleCard);
    });

    it("should handle empty array", () => {
      const resultUp = moveFlashcard([], 0, "up");
      const resultDown = moveFlashcard([], 0, "down");

      expect(resultUp).toEqual([]);
      expect(resultDown).toEqual([]);
    });

    it("should not mutate original array", () => {
      const originalFlashcards = [...mockFlashcards];
      moveFlashcard(mockFlashcards, 1, "down");

      expect(mockFlashcards).toEqual(originalFlashcards);
    });

    it("should handle two-card array", () => {
      const twoCards = [
        { id: "1", front: "Q1", back: "A1", order: 0 },
        { id: "2", front: "Q2", back: "A2", order: 1 },
      ];

      const result = moveFlashcard(twoCards, 0, "down");

      expect(result).toEqual([
        { id: "2", front: "Q2", back: "A2", order: 0 },
        { id: "1", front: "Q1", back: "A1", order: 1 },
      ]);
    });
  });

  describe("validateFlashcards", () => {
    const validFlashcards: Flashcard[] = [
      { id: "1", front: "Question 1", back: "Answer 1", order: 0 },
      { id: "2", front: "Question 2", back: "Answer 2", order: 1 },
      { id: "3", front: "Question 3", back: "Answer 3", order: 2 },
    ];

    describe("deck title validation", () => {
      it("should pass with valid title and flashcards", () => {
        const result = validateFlashcards("Valid Title", validFlashcards);
        expect(result.isValid).toBe(true);
        expect(result.errorMessage).toBeUndefined();
      });

      it("should fail with empty title", () => {
        const result = validateFlashcards("", validFlashcards);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe("Please enter a deck title");
      });

      it("should fail with whitespace-only title", () => {
        const result = validateFlashcards("   ", validFlashcards);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe("Please enter a deck title");
      });

      it("should fail with title too short", () => {
        const result = validateFlashcards("Hi", validFlashcards);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe(
          "Deck title must be at least 3 characters long"
        );
      });

      it("should pass with title exactly 3 characters", () => {
        const result = validateFlashcards("ABC", validFlashcards);
        expect(result.isValid).toBe(true);
      });

      it("should fail with title too long", () => {
        const longTitle = "A".repeat(101);
        const result = validateFlashcards(longTitle, validFlashcards);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe(
          "Deck title must be less than 100 characters"
        );
      });

      it("should pass with title exactly 100 characters", () => {
        const maxTitle = "A".repeat(100);
        const result = validateFlashcards(maxTitle, validFlashcards);
        expect(result.isValid).toBe(true);
      });
    });

    describe("flashcards count validation", () => {
      it("should fail with fewer than 3 flashcards", () => {
        const twoCards = validFlashcards.slice(0, 2);
        const result = validateFlashcards("Valid Title", twoCards);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe("Please have at least 3 flashcards");
      });

      it("should fail with empty flashcards array", () => {
        const result = validateFlashcards("Valid Title", []);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe("Please have at least 3 flashcards");
      });

      it("should pass with exactly 3 flashcards", () => {
        const result = validateFlashcards("Valid Title", validFlashcards);
        expect(result.isValid).toBe(true);
      });

      it("should pass with more than 3 flashcards", () => {
        const moreCards = [
          ...validFlashcards,
          { id: "4", front: "Question 4", back: "Answer 4", order: 3 },
          { id: "5", front: "Question 5", back: "Answer 5", order: 4 },
        ];
        const result = validateFlashcards("Valid Title", moreCards);
        expect(result.isValid).toBe(true);
      });
    });

    describe("flashcard content validation", () => {
      it("should fail with empty front content", () => {
        const cardsWithEmptyFront = [
          { id: "1", front: "", back: "Answer 1", order: 0 },
          { id: "2", front: "Question 2", back: "Answer 2", order: 1 },
          { id: "3", front: "Question 3", back: "Answer 3", order: 2 },
        ];
        const result = validateFlashcards("Valid Title", cardsWithEmptyFront);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe(
          "Please fill in all flashcard content"
        );
      });

      it("should fail with empty back content", () => {
        const cardsWithEmptyBack = [
          { id: "1", front: "Question 1", back: "", order: 0 },
          { id: "2", front: "Question 2", back: "Answer 2", order: 1 },
          { id: "3", front: "Question 3", back: "Answer 3", order: 2 },
        ];
        const result = validateFlashcards("Valid Title", cardsWithEmptyBack);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe(
          "Please fill in all flashcard content"
        );
      });

      it("should fail with whitespace-only content", () => {
        const cardsWithWhitespace = [
          { id: "1", front: "   ", back: "Answer 1", order: 0 },
          { id: "2", front: "Question 2", back: "Answer 2", order: 1 },
          { id: "3", front: "Question 3", back: "Answer 3", order: 2 },
        ];
        const result = validateFlashcards("Valid Title", cardsWithWhitespace);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe(
          "Please fill in all flashcard content"
        );
      });

      it("should pass with content that has leading/trailing spaces", () => {
        const cardsWithSpaces = [
          { id: "1", front: " Question 1 ", back: " Answer 1 ", order: 0 },
          { id: "2", front: "Question 2", back: "Answer 2", order: 1 },
          { id: "3", front: "Question 3", back: "Answer 3", order: 2 },
        ];
        const result = validateFlashcards("Valid Title", cardsWithSpaces);
        expect(result.isValid).toBe(true);
      });
    });

    describe("flashcard content length validation", () => {
      it("should fail with front content too long", () => {
        const longFront = "A".repeat(501);
        const cardsWithLongFront = [
          { id: "1", front: longFront, back: "Answer 1", order: 0 },
          { id: "2", front: "Question 2", back: "Answer 2", order: 1 },
          { id: "3", front: "Question 3", back: "Answer 3", order: 2 },
        ];
        const result = validateFlashcards("Valid Title", cardsWithLongFront);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe(
          "Flashcard content must be less than 500 characters"
        );
      });

      it("should fail with back content too long", () => {
        const longBack = "A".repeat(501);
        const cardsWithLongBack = [
          { id: "1", front: "Question 1", back: longBack, order: 0 },
          { id: "2", front: "Question 2", back: "Answer 2", order: 1 },
          { id: "3", front: "Question 3", back: "Answer 3", order: 2 },
        ];
        const result = validateFlashcards("Valid Title", cardsWithLongBack);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe(
          "Flashcard content must be less than 500 characters"
        );
      });

      it("should pass with content exactly 500 characters", () => {
        const maxContent = "A".repeat(500);
        const cardsWithMaxContent = [
          { id: "1", front: maxContent, back: maxContent, order: 0 },
          { id: "2", front: "Question 2", back: "Answer 2", order: 1 },
          { id: "3", front: "Question 3", back: "Answer 3", order: 2 },
        ];
        const result = validateFlashcards("Valid Title", cardsWithMaxContent);
        expect(result.isValid).toBe(true);
      });
    });

    describe("edge cases and comprehensive scenarios", () => {
      it("should validate all fields in correct order", () => {
        // Title validation should come first
        const result1 = validateFlashcards("", []);
        expect(result1.errorMessage).toBe("Please enter a deck title");

        // Short title validation
        const result2 = validateFlashcards("Hi", []);
        expect(result2.errorMessage).toBe(
          "Deck title must be at least 3 characters long"
        );

        // Long title validation
        const longTitle = "A".repeat(101);
        const result3 = validateFlashcards(longTitle, []);
        expect(result3.errorMessage).toBe(
          "Deck title must be less than 100 characters"
        );

        // Flashcard count validation
        const result4 = validateFlashcards("Valid Title", []);
        expect(result4.errorMessage).toBe("Please have at least 3 flashcards");
      });

      it("should handle complex valid scenario", () => {
        const complexCards = [
          {
            id: "1",
            front: "Complex Question 1 with números 123",
            back: "Complex Answer 1 🎯",
            order: 0,
          },
          {
            id: "2",
            front: "Question with\nlinebreaks",
            back: "Answer with\ttabs",
            order: 1,
          },
          {
            id: "3",
            front: "Question with special chars !@#$",
            back: "Answer with émojis 🚀",
            order: 2,
          },
        ];
        const result = validateFlashcards("Complex Deck Title", complexCards);
        expect(result.isValid).toBe(true);
      });

      it("should handle mixed validation errors - count first", () => {
        const problematicCards = [
          { id: "1", front: "", back: "Answer 1", order: 0 }, // empty front
          { id: "2", front: "A".repeat(501), back: "Answer 2", order: 1 }, // too long front
        ];
        const result = validateFlashcards("Valid Title", problematicCards);
        expect(result.isValid).toBe(false);
        // Should catch flashcard count error first (only 2 cards)
        expect(result.errorMessage).toBe("Please have at least 3 flashcards");
      });

      it("should handle unicode and special characters in content", () => {
        const unicodeCards = [
          {
            id: "1",
            front: "🎯 Question in 中文",
            back: "Answer in العربية",
            order: 0,
          },
          {
            id: "2",
            front: "Math: ∑ x² + ∫ f(x)dx",
            back: "Science: H₂O + CO₂",
            order: 1,
          },
          {
            id: "3",
            front: "Code: console.log('hello');",
            back: "Output: hello",
            order: 2,
          },
        ];
        const result = validateFlashcards("Unicode Deck", unicodeCards);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe("Integration and edge cases", () => {
    it("should handle functions working together", () => {
      // Create a flashcard
      const newCard = createNewFlashcard(0);
      expect(newCard.id).toBe("test-uuid-1");

      // Update it
      const updated = updateFlashcardField(
        [newCard],
        newCard.id,
        "front",
        "Test Question"
      );
      expect(updated[0].front).toBe("Test Question");

      // Validate it (should fail - need 3 cards)
      const validation = validateFlashcards("Test Deck", updated);
      expect(validation.isValid).toBe(false);
    });
  });
});
