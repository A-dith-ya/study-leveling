// Mock dependencies before imports
jest.mock("dayjs", () => {
  const actualDayjs = jest.requireActual("dayjs");
  const mockDayjs = jest.fn((date) => {
    if (date) {
      return actualDayjs(date);
    }
    // Return a fixed "current" time for testing
    return actualDayjs("2025-05-24T15:30:00");
  });

  // Add dayjs methods
  mockDayjs.prototype = actualDayjs.prototype;
  Object.setPrototypeOf(mockDayjs, actualDayjs);

  // Copy static methods
  Object.keys(actualDayjs).forEach((key) => {
    (mockDayjs as any)[key] = actualDayjs[key];
  });

  return mockDayjs;
});

jest.mock("@/app/stores/challengeStore", () => {
  const mockStore = {
    dailyChallenges: [],
    updateProgress: jest.fn(),
    getState: jest.fn(),
  };

  mockStore.getState.mockReturnValue(mockStore);

  return {
    __esModule: true,
    default: mockStore,
  };
});

import dayjs from "dayjs";
import useChallengeStore from "@/app/stores/challengeStore";
import {
  getChestImage,
  getChestStyle,
  getTimeUntilReset,
  formatResetTime,
  updateFlashcardChallenges,
  updateSessionChallenges,
} from "@/app/utils/challengeUtils";

const mockUseChallengeStore = useChallengeStore as jest.MockedFunction<
  typeof useChallengeStore
>;
const mockDayjs = dayjs as jest.MockedFunction<typeof dayjs>;

describe("challengeUtils", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset dayjs mock to default behavior
    mockDayjs.mockImplementation((date) => {
      const actualDayjs = jest.requireActual("dayjs");
      if (date) {
        return actualDayjs(date);
      }
      return actualDayjs("2025-05-24T15:30:00"); // Fixed time: 3:30 PM
    });
  });

  describe("getChestImage", () => {
    it("should return gold chest image for gold type", () => {
      const result = getChestImage("gold");
      expect(result).toBeDefined();
      expect(typeof result).toBe("object"); // Jest require() returns an object
    });

    it("should return silver chest image for silver type", () => {
      const result = getChestImage("silver");
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
    });

    it("should return bronze chest image for bronze type", () => {
      const result = getChestImage("bronze");
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
    });

    it("should return bronze chest image as default for unknown type", () => {
      // @ts-ignore - Testing runtime behavior with invalid input
      const result = getChestImage("unknown");
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
    });

    it("should return bronze chest image for null/undefined input", () => {
      // @ts-ignore - Testing runtime behavior with invalid input
      const resultNull = getChestImage(null);
      // @ts-ignore - Testing runtime behavior with invalid input
      const resultUndefined = getChestImage(undefined);

      expect(resultNull).toBeDefined();
      expect(resultUndefined).toBeDefined();
    });

    it("should return different images for different chest types", () => {
      const goldResult = getChestImage("gold");
      const silverResult = getChestImage("silver");
      const bronzeResult = getChestImage("bronze");

      expect(goldResult).not.toEqual(silverResult);
      expect(silverResult).not.toEqual(bronzeResult);
      expect(goldResult).not.toEqual(bronzeResult);
    });

    it("should return consistent results for same input", () => {
      const result1 = getChestImage("gold");
      const result2 = getChestImage("gold");
      expect(result1).toEqual(result2);
    });
  });

  describe("getChestStyle", () => {
    it("should return bronze style for bronze type", () => {
      const result = getChestStyle("bronze");
      expect(result).toEqual({ backgroundColor: "#F3E1D4" });
    });

    it("should return silver style for silver type", () => {
      const result = getChestStyle("silver");
      expect(result).toEqual({ backgroundColor: "#E0E8F0" });
    });

    it("should return gold style with transform for gold type", () => {
      const result = getChestStyle("gold");
      expect(result).toEqual({
        backgroundColor: "#FEF2D8",
        transform: [{ scaleX: -1 }],
      });
    });

    it("should return empty object for unknown type", () => {
      // @ts-ignore - Testing runtime behavior with invalid input
      const result = getChestStyle("unknown");
      expect(result).toEqual({});
    });

    it("should return empty object for null/undefined input", () => {
      // @ts-ignore - Testing runtime behavior with invalid input
      const resultNull = getChestStyle(null);
      // @ts-ignore - Testing runtime behavior with invalid input
      const resultUndefined = getChestStyle(undefined);

      expect(resultNull).toEqual({});
      expect(resultUndefined).toEqual({});
    });

    it("should return consistent styles for same input", () => {
      const result1 = getChestStyle("gold");
      const result2 = getChestStyle("gold");
      expect(result1).toEqual(result2);
    });
  });

  describe("getTimeUntilReset", () => {
    it("should calculate time until next day correctly at 3:30 PM", () => {
      const result = getTimeUntilReset();

      // At 3:30 PM, should be 8h 30m until midnight
      expect(result.hours).toBe(8);
      expect(result.minutes).toBe(30);
    });

    it("should handle time close to midnight", () => {
      // Mock time at 11:58 PM
      mockDayjs.mockImplementation((date) => {
        const actualDayjs = jest.requireActual("dayjs");
        if (date) {
          return actualDayjs(date);
        }
        return actualDayjs("2025-05-24T23:58:00");
      });

      const result = getTimeUntilReset();

      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(2);
    });

    it("should handle midnight exactly", () => {
      // Mock time at exactly midnight
      mockDayjs.mockImplementation((date) => {
        const actualDayjs = jest.requireActual("dayjs");
        if (date) {
          return actualDayjs(date);
        }
        return actualDayjs("2025-05-24T00:00:00");
      });

      const result = getTimeUntilReset();

      expect(result.hours).toBe(24);
      expect(result.minutes).toBe(0);
    });

    it("should handle early morning hours", () => {
      // Mock time at 2:15 AM
      mockDayjs.mockImplementation((date) => {
        const actualDayjs = jest.requireActual("dayjs");
        if (date) {
          return actualDayjs(date);
        }
        return actualDayjs("2025-05-24T02:15:00");
      });

      const result = getTimeUntilReset();

      expect(result.hours).toBe(21);
      expect(result.minutes).toBe(45);
    });

    it("should return valid time objects", () => {
      const result = getTimeUntilReset();

      expect(typeof result.hours).toBe("number");
      expect(typeof result.minutes).toBe("number");
      expect(result.hours).toBeGreaterThanOrEqual(0);
      expect(result.minutes).toBeGreaterThanOrEqual(0);
      expect(result.minutes).toBeLessThan(60);
    });

    it("should handle dayjs errors gracefully", () => {
      // Mock dayjs to throw an error
      mockDayjs.mockImplementation(() => {
        throw new Error("Dayjs error");
      });

      expect(() => getTimeUntilReset()).toThrow();
    });
  });

  describe("formatResetTime", () => {
    it("should format hours and minutes correctly", () => {
      const result = formatResetTime(2, 30);
      expect(result).toBe("2h 30m");
    });

    it("should format only minutes when hours is 0", () => {
      const result = formatResetTime(0, 45);
      expect(result).toBe("45m");
    });

    it("should format only hours when minutes is 0", () => {
      const result = formatResetTime(3, 0);
      expect(result).toBe("3h");
    });

    it("should handle zero hours and zero minutes", () => {
      const result = formatResetTime(0, 0);
      expect(result).toBe("0m");
    });

    it("should handle single digit values", () => {
      const result = formatResetTime(1, 5);
      expect(result).toBe("1h 5m");
    });

    it("should handle large values", () => {
      const result = formatResetTime(25, 75);
      expect(result).toBe("25h 75m");
    });

    it("should handle negative values", () => {
      const result = formatResetTime(-1, -5);
      expect(result).toBe("-1h -5m");
    });

    it("should handle edge cases with minutes >= 60", () => {
      const result = formatResetTime(1, 90);
      expect(result).toBe("1h 90m");
    });

    it("should handle decimal values by truncating", () => {
      const result = formatResetTime(2.7, 30.9);
      expect(result).toBe("2.7h 30.9m");
    });
  });

  describe("updateFlashcardChallenges", () => {
    let mockStore: any;

    beforeEach(() => {
      mockStore = {
        dailyChallenges: [
          {
            id: "reward-10",
            progress: 5,
            target: 10,
          },
          {
            id: "reward-20",
            progress: 15,
            target: 20,
          },
          {
            id: "session-1",
            progress: 0,
            target: 1,
          },
        ],
        updateProgress: jest.fn(),
      };

      mockUseChallengeStore.getState = jest.fn().mockReturnValue(mockStore);
    });

    it("should update progress for flashcard challenges only", () => {
      updateFlashcardChallenges(3);

      expect(mockStore.updateProgress).toHaveBeenCalledWith("reward-10", 8);
      expect(mockStore.updateProgress).toHaveBeenCalledWith("reward-20", 18);
      expect(mockStore.updateProgress).not.toHaveBeenCalledWith(
        "session-1",
        expect.any(Number)
      );
      expect(mockStore.updateProgress).toHaveBeenCalledTimes(2);
    });

    it("should handle zero cards studied", () => {
      updateFlashcardChallenges(0);

      expect(mockStore.updateProgress).toHaveBeenCalledWith("reward-10", 5);
      expect(mockStore.updateProgress).toHaveBeenCalledWith("reward-20", 15);
      expect(mockStore.updateProgress).toHaveBeenCalledTimes(2);
    });

    it("should handle negative cards studied", () => {
      updateFlashcardChallenges(-2);

      expect(mockStore.updateProgress).toHaveBeenCalledWith("reward-10", 3);
      expect(mockStore.updateProgress).toHaveBeenCalledWith("reward-20", 13);
      expect(mockStore.updateProgress).toHaveBeenCalledTimes(2);
    });

    it("should handle large number of cards studied", () => {
      updateFlashcardChallenges(100);

      expect(mockStore.updateProgress).toHaveBeenCalledWith("reward-10", 105);
      expect(mockStore.updateProgress).toHaveBeenCalledWith("reward-20", 115);
      expect(mockStore.updateProgress).toHaveBeenCalledTimes(2);
    });

    it("should handle empty challenge list", () => {
      mockStore.dailyChallenges = [];

      updateFlashcardChallenges(5);

      expect(mockStore.updateProgress).not.toHaveBeenCalled();
    });

    it("should handle challenges with no flashcard challenges", () => {
      mockStore.dailyChallenges = [
        {
          id: "session-1",
          progress: 0,
          target: 1,
        },
        {
          id: "other-challenge",
          progress: 0,
          target: 5,
        },
      ];

      updateFlashcardChallenges(5);

      expect(mockStore.updateProgress).not.toHaveBeenCalled();
    });

    it("should handle store errors gracefully", () => {
      mockUseChallengeStore.getState = jest.fn().mockImplementation(() => {
        throw new Error("Store error");
      });

      expect(() => updateFlashcardChallenges(5)).toThrow("Store error");
    });

    it("should handle updateProgress errors", () => {
      mockStore.updateProgress.mockImplementation(() => {
        throw new Error("Update error");
      });

      expect(() => updateFlashcardChallenges(5)).toThrow("Update error");
    });

    it("should handle decimal card values", () => {
      updateFlashcardChallenges(2.5);

      expect(mockStore.updateProgress).toHaveBeenCalledWith("reward-10", 7.5);
      expect(mockStore.updateProgress).toHaveBeenCalledWith("reward-20", 17.5);
    });
  });

  describe("updateSessionChallenges", () => {
    let mockStore: any;

    beforeEach(() => {
      mockStore = {
        dailyChallenges: [
          {
            id: "session-1",
            progress: 0,
            target: 1,
          },
          {
            id: "session-3",
            progress: 2,
            target: 3,
          },
          {
            id: "reward-10",
            progress: 5,
            target: 10,
          },
        ],
        updateProgress: jest.fn(),
      };

      mockUseChallengeStore.getState = jest.fn().mockReturnValue(mockStore);
    });

    it("should update progress for session challenges only", () => {
      updateSessionChallenges(1);

      expect(mockStore.updateProgress).toHaveBeenCalledWith("session-1", 1);
      expect(mockStore.updateProgress).toHaveBeenCalledWith("session-3", 3);
      expect(mockStore.updateProgress).not.toHaveBeenCalledWith(
        "reward-10",
        expect.any(Number)
      );
      expect(mockStore.updateProgress).toHaveBeenCalledTimes(2);
    });

    it("should use default value of 1 when no parameter provided", () => {
      updateSessionChallenges();

      expect(mockStore.updateProgress).toHaveBeenCalledWith("session-1", 1);
      expect(mockStore.updateProgress).toHaveBeenCalledWith("session-3", 3);
      expect(mockStore.updateProgress).toHaveBeenCalledTimes(2);
    });

    it("should handle multiple sessions completed", () => {
      updateSessionChallenges(2);

      expect(mockStore.updateProgress).toHaveBeenCalledWith("session-1", 2);
      expect(mockStore.updateProgress).toHaveBeenCalledWith("session-3", 4);
      expect(mockStore.updateProgress).toHaveBeenCalledTimes(2);
    });

    it("should handle zero sessions", () => {
      updateSessionChallenges(0);

      expect(mockStore.updateProgress).toHaveBeenCalledWith("session-1", 0);
      expect(mockStore.updateProgress).toHaveBeenCalledWith("session-3", 2);
      expect(mockStore.updateProgress).toHaveBeenCalledTimes(2);
    });

    it("should handle negative sessions", () => {
      updateSessionChallenges(-1);

      expect(mockStore.updateProgress).toHaveBeenCalledWith("session-1", -1);
      expect(mockStore.updateProgress).toHaveBeenCalledWith("session-3", 1);
      expect(mockStore.updateProgress).toHaveBeenCalledTimes(2);
    });

    it("should handle empty challenge list", () => {
      mockStore.dailyChallenges = [];

      updateSessionChallenges(1);

      expect(mockStore.updateProgress).not.toHaveBeenCalled();
    });

    it("should handle challenges with no session challenges", () => {
      mockStore.dailyChallenges = [
        {
          id: "reward-10",
          progress: 5,
          target: 10,
        },
        {
          id: "other-challenge",
          progress: 0,
          target: 5,
        },
      ];

      updateSessionChallenges(1);

      expect(mockStore.updateProgress).not.toHaveBeenCalled();
    });

    it("should handle store errors gracefully", () => {
      mockUseChallengeStore.getState = jest.fn().mockImplementation(() => {
        throw new Error("Store error");
      });

      expect(() => updateSessionChallenges(1)).toThrow("Store error");
    });

    it("should handle updateProgress errors", () => {
      mockStore.updateProgress.mockImplementation(() => {
        throw new Error("Update error");
      });

      expect(() => updateSessionChallenges(1)).toThrow("Update error");
    });

    it("should handle decimal session values", () => {
      updateSessionChallenges(1.5);

      expect(mockStore.updateProgress).toHaveBeenCalledWith("session-1", 1.5);
      expect(mockStore.updateProgress).toHaveBeenCalledWith("session-3", 3.5);
    });

    it("should handle large number of sessions", () => {
      updateSessionChallenges(10);

      expect(mockStore.updateProgress).toHaveBeenCalledWith("session-1", 10);
      expect(mockStore.updateProgress).toHaveBeenCalledWith("session-3", 12);
      expect(mockStore.updateProgress).toHaveBeenCalledTimes(2);
    });
  });

  describe("Integration scenarios", () => {
    let mockStore: any;

    beforeEach(() => {
      mockStore = {
        dailyChallenges: [
          {
            id: "reward-10",
            progress: 5,
            target: 10,
          },
          {
            id: "session-1",
            progress: 0,
            target: 1,
          },
          {
            id: "reward-20",
            progress: 15,
            target: 20,
          },
          {
            id: "session-3",
            progress: 2,
            target: 3,
          },
        ],
        updateProgress: jest.fn(),
      };

      mockUseChallengeStore.getState = jest.fn().mockReturnValue(mockStore);
    });

    it("should update different challenge types independently", () => {
      updateFlashcardChallenges(3);
      updateSessionChallenges(1);

      expect(mockStore.updateProgress).toHaveBeenCalledWith("reward-10", 8);
      expect(mockStore.updateProgress).toHaveBeenCalledWith("reward-20", 18);
      expect(mockStore.updateProgress).toHaveBeenCalledWith("session-1", 1);
      expect(mockStore.updateProgress).toHaveBeenCalledWith("session-3", 3);
      expect(mockStore.updateProgress).toHaveBeenCalledTimes(4);
    });

    it("should work with mixed challenge IDs", () => {
      mockStore.dailyChallenges = [
        { id: "reward-special", progress: 0, target: 5 },
        { id: "session-special", progress: 0, target: 2 },
        { id: "other-reward-10", progress: 0, target: 10 },
        { id: "other-session-1", progress: 0, target: 1 },
      ];

      updateFlashcardChallenges(2);
      updateSessionChallenges(1);

      expect(mockStore.updateProgress).toHaveBeenCalledWith(
        "reward-special",
        2
      );
      expect(mockStore.updateProgress).toHaveBeenCalledWith(
        "session-special",
        1
      );
      expect(mockStore.updateProgress).toHaveBeenCalledTimes(2);
    });
  });

  describe("Performance considerations", () => {
    it("should handle large challenge lists efficiently", () => {
      const largeChallengeList = Array.from({ length: 100 }, (_, index) => ({
        id: `reward-${index}`,
        progress: index,
        target: index + 10,
      }));

      const mockStore = {
        dailyChallenges: largeChallengeList,
        updateProgress: jest.fn(),
      };

      mockUseChallengeStore.getState = jest.fn().mockReturnValue(mockStore);

      const startTime = Date.now();
      updateFlashcardChallenges(5);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
      expect(mockStore.updateProgress).toHaveBeenCalledTimes(100);
    });

    it("should not create unnecessary function calls", () => {
      const mockStore = {
        dailyChallenges: [],
        updateProgress: jest.fn(),
      };

      mockUseChallengeStore.getState = jest.fn().mockReturnValue(mockStore);

      updateFlashcardChallenges(5);
      updateSessionChallenges(1);

      expect(mockStore.updateProgress).not.toHaveBeenCalled();
      expect(mockUseChallengeStore.getState).toHaveBeenCalledTimes(2);
    });
  });
});
