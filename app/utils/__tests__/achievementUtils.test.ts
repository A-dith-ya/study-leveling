// Mock dayjs to control time for testing
jest.mock("dayjs", () => {
  const originalDayjs = jest.requireActual("dayjs");
  return jest.fn(() => ({
    hour: jest.fn(() => 14), // Default to 2 PM (not night time)
    ...originalDayjs(),
  }));
});

// Mock AWS Amplify and related dependencies before any imports
jest.mock("aws-amplify/data", () => ({
  generateClient: jest.fn(() => ({
    models: {
      User: {
        update: jest.fn(),
        get: jest.fn(),
      },
    },
  })),
}));

jest.mock("@aws-amplify/core", () => ({
  Hub: {
    listen: jest.fn(),
    dispatch: jest.fn(),
  },
  Logger: jest.fn(),
}));

jest.mock("@aws-amplify/api-graphql", () => ({}));
jest.mock("@aws-amplify/api", () => ({}));

// Mock the logger utility
jest.mock("@/app/utils/logger", () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

// Mock the user service
jest.mock("@/app/services/userService", () => ({
  updateUserAchievements: jest.fn(),
  getAchievementsByUserId: jest.fn(),
}));

// Mock the achievement store
jest.mock("@/app/stores/achievementStore", () => {
  const mockStore = {
    getState: jest.fn(),
    subscribe: jest.fn(),
    destroy: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockStore,
  };
});

// Mock MMKV storage
jest.mock("@/app/stores/mmkv", () => ({
  zustandStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

import { evaluateAchievements } from "@/app/utils/achievementUtils";
import { logger } from "@/app/utils/logger";
import useAchievementStore from "@/app/stores/achievementStore";
import { updateUserAchievements } from "@/app/services/userService";

const mockLogger = logger as jest.Mocked<typeof logger>;
const mockUseAchievementStore = useAchievementStore as jest.MockedFunction<
  typeof useAchievementStore
>;
const mockUpdateUserAchievements =
  updateUserAchievements as jest.MockedFunction<typeof updateUserAchievements>;

describe("achievementUtils", () => {
  let mockAchievementStore: {
    isUnlocked: jest.MockedFunction<(id: string) => boolean>;
    unlock: jest.MockedFunction<(id: string) => void>;
    getUnlockedAchievements: jest.MockedFunction<() => string[]>;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock achievement store
    mockAchievementStore = {
      isUnlocked: jest.fn(),
      unlock: jest.fn(),
      getUnlockedAchievements: jest.fn(),
    };

    (mockUseAchievementStore as any).getState = jest
      .fn()
      .mockReturnValue(mockAchievementStore);
    mockUpdateUserAchievements.mockResolvedValue(undefined);

    // Default return value for getUnlockedAchievements
    mockAchievementStore.getUnlockedAchievements.mockReturnValue([]);
  });

  describe("evaluateAchievements", () => {
    const userId = "test-user-123";

    describe("flashcard achievements", () => {
      it("should unlock deck-builder achievement for first card", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const result = await evaluateAchievements(userId, 1);

        expect(result).toEqual(["deck-builder"]);
        expect(mockUpdateUserAchievements).toHaveBeenCalledWith(userId, [
          "deck-builder",
        ]);
        expect(mockAchievementStore.unlock).toHaveBeenCalledWith(
          "deck-builder"
        );
        expect(mockLogger.debug).toHaveBeenCalledWith("Unlocked achievements", {
          achievementsToUnlock: ["deck-builder"],
        });
      });

      it("should unlock multiple flashcard achievements at once", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const result = await evaluateAchievements(userId, 100);

        expect(result).toEqual([
          "deck-builder",
          "flashcard-master-10",
          "flashcard-master-100",
        ]);
        expect(mockUpdateUserAchievements).toHaveBeenCalledWith(userId, [
          "deck-builder",
          "flashcard-master-10",
          "flashcard-master-100",
        ]);
      });

      it("should not unlock already unlocked achievements", async () => {
        mockAchievementStore.isUnlocked.mockImplementation((id: string) => {
          return id === "deck-builder" || id === "flashcard-master-10";
        });

        const result = await evaluateAchievements(userId, 100);

        expect(result).toEqual(["flashcard-master-100"]);
        expect(mockUpdateUserAchievements).toHaveBeenCalledWith(userId, [
          "flashcard-master-100",
        ]);
      });

      it("should unlock highest tier achievement (1000 cards)", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const result = await evaluateAchievements(userId, 1500);

        expect(result).toContain("flashcard-master-1000");
        expect(result).toHaveLength(4); // All flashcard achievements
      });

      it("should not unlock any achievements below threshold", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const result = await evaluateAchievements(userId, 0);

        expect(result).toEqual([]);
        expect(mockUpdateUserAchievements).not.toHaveBeenCalled();
      });
    });

    describe("streak achievements", () => {
      it("should unlock streak achievements when currentStreak is provided", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const result = await evaluateAchievements(userId, 5, 10);

        expect(result).toContain("streak-king-3");
        expect(result).toContain("streak-king-10");
        expect(result).not.toContain("streak-king-30");
      });

      it("should unlock highest streak achievement", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const result = await evaluateAchievements(userId, 5, 50);

        expect(result).toContain("streak-king-3");
        expect(result).toContain("streak-king-10");
        expect(result).toContain("streak-king-30");
      });

      it("should not unlock streak achievements when currentStreak is undefined", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const result = await evaluateAchievements(userId, 5);

        expect(result).not.toContain("streak-king-3");
        expect(result).not.toContain("streak-king-10");
        expect(result).not.toContain("streak-king-30");
      });

      it("should handle zero streak", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const result = await evaluateAchievements(userId, 5, 0);

        expect(result).not.toContain("streak-king-3");
        expect(result).not.toContain("streak-king-10");
        expect(result).not.toContain("streak-king-30");
      });
    });

    describe("session achievements", () => {
      it("should unlock session achievements when totalSessions is provided", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const result = await evaluateAchievements(userId, 5, undefined, 50);

        expect(result).toContain("session-surfer-10");
        expect(result).toContain("session-surfer-50");
        expect(result).not.toContain("session-surfer-100");
      });

      it("should unlock all session achievements", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const result = await evaluateAchievements(userId, 5, undefined, 150);

        expect(result).toContain("session-surfer-10");
        expect(result).toContain("session-surfer-50");
        expect(result).toContain("session-surfer-100");
      });

      it("should not unlock session achievements when totalSessions is undefined", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const result = await evaluateAchievements(userId, 5);

        expect(result).not.toContain("session-surfer-10");
        expect(result).not.toContain("session-surfer-50");
        expect(result).not.toContain("session-surfer-100");
      });

      it("should handle zero sessions", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const result = await evaluateAchievements(userId, 5, undefined, 0);

        expect(result).not.toContain("session-surfer-10");
        expect(result).not.toContain("session-surfer-50");
        expect(result).not.toContain("session-surfer-100");
      });
    });

    describe("time-based achievements", () => {
      it("should unlock time achievements when timeSpent is provided", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const result = await evaluateAchievements(
          userId,
          5,
          undefined,
          undefined,
          7200
        ); // 2 hours

        expect(result).toContain("study-time-1");
        expect(result).not.toContain("study-time-5");
        expect(result).not.toContain("study-time-10");
      });

      it("should unlock multiple time achievements", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const result = await evaluateAchievements(
          userId,
          5,
          undefined,
          undefined,
          20000
        ); // ~5.5 hours

        expect(result).toContain("study-time-1");
        expect(result).toContain("study-time-5");
        expect(result).not.toContain("study-time-10");
      });

      it("should unlock all time achievements", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const result = await evaluateAchievements(
          userId,
          5,
          undefined,
          undefined,
          40000
        ); // ~11 hours

        expect(result).toContain("study-time-1");
        expect(result).toContain("study-time-5");
        expect(result).toContain("study-time-10");
      });

      it("should not unlock time achievements when timeSpent is undefined", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const result = await evaluateAchievements(userId, 5);

        expect(result).not.toContain("study-time-1");
        expect(result).not.toContain("study-time-5");
        expect(result).not.toContain("study-time-10");
      });

      it("should handle zero time spent", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const result = await evaluateAchievements(
          userId,
          5,
          undefined,
          undefined,
          0
        );

        expect(result).not.toContain("study-time-1");
        expect(result).not.toContain("study-time-5");
        expect(result).not.toContain("study-time-10");
      });
    });

    describe("mixed achievement types", () => {
      it("should unlock achievements from multiple types", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const result = await evaluateAchievements(
          userId,
          100, // flashcards
          15, // streak
          25, // sessions
          5000 // time (1.4 hours)
        );

        // Should unlock achievements from all types
        expect(result).toContain("deck-builder");
        expect(result).toContain("flashcard-master-10");
        expect(result).toContain("flashcard-master-100");
        expect(result).toContain("streak-king-3");
        expect(result).toContain("streak-king-10");
        expect(result).toContain("session-surfer-10");
        expect(result).toContain("study-time-1");
      });

      it("should only unlock achievements that meet thresholds", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const result = await evaluateAchievements(
          userId,
          5, // flashcards (only deck-builder)
          2, // streak (below minimum)
          5, // sessions (below minimum)
          1000 // time (below minimum)
        );

        expect(result).toEqual(["deck-builder"]);
      });
    });

    describe("edge cases", () => {
      it("should return empty array when no achievements to unlock", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(true); // All achievements already unlocked

        const result = await evaluateAchievements(userId, 1000, 50, 150, 40000);

        expect(result).toEqual([]);
        expect(mockUpdateUserAchievements).not.toHaveBeenCalled();
      });

      it("should handle negative values gracefully", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const result = await evaluateAchievements(userId, -5, -10, -20, -100);

        expect(result).toEqual([]);
        expect(mockUpdateUserAchievements).not.toHaveBeenCalled();
      });

      it("should handle exact threshold values", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const result = await evaluateAchievements(
          userId,
          10, // Exactly at flashcard-master-10 threshold
          3, // Exactly at streak-king-3 threshold
          10, // Exactly at session-surfer-10 threshold
          3600 // Exactly at study-time-1 threshold (1 hour)
        );

        expect(result).toContain("deck-builder");
        expect(result).toContain("flashcard-master-10");
        expect(result).toContain("streak-king-3");
        expect(result).toContain("session-surfer-10");
        expect(result).toContain("study-time-1");
      });

      it("should handle very large numbers", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const result = await evaluateAchievements(
          userId,
          Number.MAX_SAFE_INTEGER,
          Number.MAX_SAFE_INTEGER,
          Number.MAX_SAFE_INTEGER,
          Number.MAX_SAFE_INTEGER
        );

        // Should unlock all achievements
        expect(result.length).toBeGreaterThan(0);
        expect(result).toContain("flashcard-master-1000");
        expect(result).toContain("streak-king-30");
        expect(result).toContain("session-surfer-100");
        expect(result).toContain("study-time-10");
      });
    });

    describe("error handling", () => {
      it("should handle errors from updateUserAchievements", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);
        mockUpdateUserAchievements.mockRejectedValue(
          new Error("Database error")
        );

        const result = await evaluateAchievements(userId, 10);

        expect(result).toEqual([]);
        expect(mockLogger.error).toHaveBeenCalledWith(
          "Failed to evaluate achievements",
          expect.any(Error)
        );
      });

      it("should handle errors from achievement store", async () => {
        (mockUseAchievementStore as any).getState = jest
          .fn()
          .mockImplementation(() => {
            throw new Error("Store error");
          });

        const result = await evaluateAchievements(userId, 10);

        expect(result).toEqual([]);
        expect(mockLogger.error).toHaveBeenCalledWith(
          "Failed to evaluate achievements",
          expect.any(Error)
        );
      });

      it("should handle partial failures in unlock process", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);
        mockAchievementStore.unlock.mockImplementation((id: string) => {
          if (id === "flashcard-master-10") {
            throw new Error("Unlock error");
          }
        });

        const result = await evaluateAchievements(userId, 10);

        expect(result).toEqual([]);
        expect(mockLogger.error).toHaveBeenCalled();
      });
    });

    describe("parameter validation", () => {
      it("should handle empty userId", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const result = await evaluateAchievements("", 10);

        expect(result).toEqual([]);
        expect(mockLogger.error).toHaveBeenCalled();
      });

      it("should handle null/undefined userId", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        // @ts-ignore - Testing runtime behavior with invalid input
        const result = await evaluateAchievements(null, 10);

        expect(result).toEqual([]);
        expect(mockLogger.error).toHaveBeenCalled();
      });

      it("should require totalCards parameter", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        // @ts-ignore - Testing runtime behavior with missing required parameter
        const result = await evaluateAchievements(userId);

        expect(result).toEqual([]);
      });
    });

    describe("performance considerations", () => {
      it("should efficiently handle many achievements", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const startTime = Date.now();
        await evaluateAchievements(userId, 1000, 30, 100, 40000);
        const endTime = Date.now();

        // Should complete within reasonable time (less than 1 second)
        expect(endTime - startTime).toBeLessThan(1000);
      });

      it("should not make unnecessary database calls when no achievements to unlock", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(true);

        await evaluateAchievements(userId, 1000);

        expect(mockUpdateUserAchievements).not.toHaveBeenCalled();
      });
    });

    describe("challenge achievements", () => {
      it("should unlock challenge achievement when all challenges are completed and claimed", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const dailyChallenges = [
          { isCompleted: true, isClaimed: true },
          { isCompleted: true, isClaimed: true },
          { isCompleted: true, isClaimed: true },
        ];

        const result = await evaluateAchievements(
          userId,
          5,
          undefined,
          undefined,
          undefined,
          dailyChallenges
        );

        expect(result).toContain("challenge-champ");
      });

      it("should not unlock challenge achievement when some challenges are incomplete", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const dailyChallenges = [
          { isCompleted: true, isClaimed: true },
          { isCompleted: false, isClaimed: false },
          { isCompleted: true, isClaimed: true },
        ];

        const result = await evaluateAchievements(
          userId,
          5,
          undefined,
          undefined,
          undefined,
          dailyChallenges
        );

        expect(result).not.toContain("challenge-champ");
      });

      it("should not unlock challenge achievement when challenges are completed but not claimed", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        const dailyChallenges = [
          { isCompleted: true, isClaimed: false },
          { isCompleted: true, isClaimed: true },
          { isCompleted: true, isClaimed: true },
        ];

        const result = await evaluateAchievements(
          userId,
          5,
          undefined,
          undefined,
          undefined,
          dailyChallenges
        );

        expect(result).not.toContain("challenge-champ");
      });
    });

    describe("night owl achievements", () => {
      const mockDayjs = require("dayjs");

      it("should unlock night owl achievement when app is used between 12am-5am", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        // Mock night time (2 AM)
        mockDayjs.mockReturnValue({
          hour: jest.fn(() => 2),
        });

        const result = await evaluateAchievements(userId, 5);

        expect(result).toContain("night-owl");
      });

      it("should unlock night owl achievement at midnight (12am)", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        // Mock midnight
        mockDayjs.mockReturnValue({
          hour: jest.fn(() => 0),
        });

        const result = await evaluateAchievements(userId, 5);

        expect(result).toContain("night-owl");
      });

      it("should unlock night owl achievement at 4am", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        // Mock 4 AM
        mockDayjs.mockReturnValue({
          hour: jest.fn(() => 4),
        });

        const result = await evaluateAchievements(userId, 5);

        expect(result).toContain("night-owl");
      });

      it("should not unlock night owl achievement during day time", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        // Mock day time (2 PM) - this is the default mock
        mockDayjs.mockReturnValue({
          hour: jest.fn(() => 14),
        });

        const result = await evaluateAchievements(userId, 5);

        expect(result).not.toContain("night-owl");
      });

      it("should not unlock night owl achievement at 5am", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        // Mock 5 AM (outside night owl range)
        mockDayjs.mockReturnValue({
          hour: jest.fn(() => 5),
        });

        const result = await evaluateAchievements(userId, 5);

        expect(result).not.toContain("night-owl");
      });

      it("should not unlock night owl achievement if already unlocked", async () => {
        mockAchievementStore.isUnlocked.mockImplementation((id: string) => {
          return id === "night-owl";
        });

        // Mock night time
        mockDayjs.mockReturnValue({
          hour: jest.fn(() => 2),
        });

        const result = await evaluateAchievements(userId, 5);

        expect(result).not.toContain("night-owl");
      });

      it("should work with other achievements during night time", async () => {
        mockAchievementStore.isUnlocked.mockReturnValue(false);

        // Mock night time
        mockDayjs.mockReturnValue({
          hour: jest.fn(() => 1),
        });

        const result = await evaluateAchievements(userId, 100);

        expect(result).toContain("night-owl");
        expect(result).toContain("deck-builder");
        expect(result).toContain("flashcard-master-10");
        expect(result).toContain("flashcard-master-100");
      });
    });
  });
});
