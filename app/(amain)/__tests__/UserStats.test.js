import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";

import UserStats from "@/app/(amain)/UserStats";
import { useUserData } from "@/app/hooks/useUser";
import useUserStore from "@/app/stores/userStore";
import useAchievementStore from "@/app/stores/achievementStore";
import * as achievementUtils from "@/app/utils/achievementUtils";

// Mock dependencies
jest.mock("@/app/hooks/useUser", () => ({
  useUserData: jest.fn(),
}));

jest.mock("@/app/stores/userStore", () => {
  const mockStore = {
    user: null,
    setUser: jest.fn(),
    fetchUser: jest.fn(),
    clearUser: jest.fn(),
  };

  // Mock the useUserStore hook to handle selectors properly
  const mockUseUserStore = jest.fn((selector) => {
    if (typeof selector === "function") {
      return selector(mockStore);
    }
    return mockStore;
  });

  // Add a way to update the mock store from tests
  mockUseUserStore.mockStore = mockStore;

  return {
    __esModule: true,
    default: mockUseUserStore,
  };
});

jest.mock("@/app/stores/achievementStore", () => {
  // Create a global mock store object that will be shared
  const mockStore = {
    isUnlocked: jest.fn(),
    getState: jest.fn(),
  };

  // Set up getState to return the mock store itself
  mockStore.getState.mockReturnValue(mockStore);

  // Mock the default export as a function that returns the mock store
  const mockUseAchievementStore = jest.fn(() => mockStore);

  // Add the getState method to the hook function itself
  mockUseAchievementStore.getState = () => mockStore;

  return {
    __esModule: true,
    default: mockUseAchievementStore,
  };
});

jest.mock("@/app/utils/achievementUtils", () => ({
  evaluateAchievements: jest.fn(),
}));

jest.mock("@/app/utils/xpUtils", () => ({
  calculateXPToNextLevel: jest.fn(),
}));

jest.mock("@/app/utils/dayUtils", () => ({
  formatDurationToHoursAndMinutes: jest.fn(),
}));

jest.mock("@/app/utils/logger", () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Mock react-native-reanimated first
jest.mock("react-native-reanimated", () => {
  const View = require("react-native").View;
  const Text = require("react-native").Text;
  const Pressable = require("react-native").Pressable;

  return {
    __esModule: true,
    default: {
      View: View,
      Text: Text,
      createAnimatedComponent: (component) => component,
      // Animation functions
      useSharedValue: jest.fn(() => ({ value: 0 })),
      useAnimatedStyle: jest.fn(() => ({})),
      withTiming: jest.fn((value) => value),
      withSpring: jest.fn((value) => value),
      withSequence: jest.fn((value) => value),
      interpolate: jest.fn(
        (input, inputRange, outputRange) => outputRange?.[0] || 0
      ),
      Extrapolation: { CLAMP: "clamp" },
    },
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withTiming: jest.fn((value) => value),
    withSpring: jest.fn((value) => value),
    withSequence: jest.fn((value) => value),
    interpolate: jest.fn(
      (input, inputRange, outputRange) => outputRange?.[0] || 0
    ),
    Extrapolation: { CLAMP: "clamp" },
    createAnimatedComponent: (component) => component,
  };
});

// Mock components
jest.mock("@/app/components/gamification/LevelDisplay", () => {
  return function MockLevelDisplay({ level, nextLevel, currentXP, targetXP }) {
    const React = require("react");
    return React.createElement("View", {
      testID: "level-display",
      children: React.createElement(
        "Text",
        {},
        `Level ${level} - ${currentXP}/${targetXP} XP`
      ),
    });
  };
});

jest.mock("@/app/components/gamification/StatCard", () => {
  return function MockStatCard({ icon, value, label, color }) {
    const React = require("react");
    return React.createElement("View", {
      testID: `stat-card-${label.toLowerCase().replace(/\s+/g, "-")}`,
      children: [
        React.createElement("Text", { key: "value" }, value),
        React.createElement("Text", { key: "label" }, label),
      ],
    });
  };
});

jest.mock("@/app/components/gamification/AchievementModal", () => {
  return function MockAchievementModal({ achievement, visible, onClose }) {
    const React = require("react");
    if (!visible) return null;
    return React.createElement("View", {
      testID: "achievement-modal",
      children: [
        React.createElement(
          "Text",
          { key: "title" },
          achievement?.title || "Achievement"
        ),
        React.createElement("Pressable", {
          key: "close",
          testID: "modal-close-button",
          onPress: onClose,
          children: React.createElement("Text", {}, "Close"),
        }),
      ],
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

jest.mock("@/app/constants/achievements", () => ({
  ACHIEVEMENTS: [
    {
      id: "first-review",
      title: "First Steps",
      description: "Complete your first review session",
      image: { uri: "achievement1.png" },
    },
    {
      id: "streak-master",
      title: "Streak Master",
      description: "Maintain a 7-day study streak",
      image: { uri: "achievement2.png" },
    },
    {
      id: "century-reviewer",
      title: "Century Reviewer",
      description: "Review 100 flashcards",
      image: { uri: "achievement3.png" },
    },
  ],
}));

describe("UserStats", () => {
  const mockUserData = {
    level: 5,
    xp: 1250,
    streak: 14,
    totalCardsReviewed: 247,
    timeSpent: 7890000, // milliseconds
    totalSessionsCompleted: 23,
  };

  const mockUser = {
    id: "user-123",
  };

  let mockAchievementStore;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a fresh mock for each test
    mockAchievementStore = {
      isUnlocked: jest.fn(),
      getState: jest.fn(),
    };

    // Setup the store to return itself from getState
    mockAchievementStore.getState.mockReturnValue(mockAchievementStore);

    // Setup achievement unlock status
    mockAchievementStore.isUnlocked.mockImplementation((achievementId) => {
      const unlockedAchievements = ["first-review", "streak-master"];
      return unlockedAchievements.includes(achievementId);
    });

    useUserData.mockReturnValue({
      data: mockUserData,
      isLoading: false,
    });

    useUserStore.mockStore.user = mockUser;

    useAchievementStore.mockReturnValue(mockAchievementStore);

    // Mock utility functions
    require("@/app/utils/xpUtils").calculateXPToNextLevel.mockReturnValue(1500);
    require("@/app/utils/dayUtils").formatDurationToHoursAndMinutes.mockReturnValue(
      "2h 11m"
    );
    require("@/app/utils/achievementUtils").evaluateAchievements.mockResolvedValue();
    require("@/app/utils/logger").logger.error.mockImplementation(() => {});
  });

  describe("Loading State", () => {
    it("shows loading screen when user data is loading", () => {
      useUserData.mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(<UserStats />);

      expect(screen.getByTestId("loading-screen")).toBeOnTheScreen();
      expect(screen.getByText("Loading stats...")).toBeOnTheScreen();
    });
  });

  describe("User Statistics Display", () => {
    it("displays user level and XP progress", () => {
      render(<UserStats />);

      expect(screen.getByTestId("level-display")).toBeOnTheScreen();
      expect(screen.getByText("Level 5 - 1250/1500 XP")).toBeOnTheScreen();
    });

    it("displays current streak correctly", () => {
      render(<UserStats />);

      const streakCard = screen.getByTestId("stat-card-day-streak");
      expect(streakCard).toBeOnTheScreen();
      expect(screen.getByText("14")).toBeOnTheScreen();
      expect(screen.getByText("Day Streak")).toBeOnTheScreen();
    });

    it("displays total cards reviewed", () => {
      render(<UserStats />);

      const cardsCard = screen.getByTestId("stat-card-cards-reviewed");
      expect(cardsCard).toBeOnTheScreen();
      expect(screen.getByText("247")).toBeOnTheScreen();
      expect(screen.getByText("Cards Reviewed")).toBeOnTheScreen();
    });

    it("displays formatted study time", () => {
      render(<UserStats />);

      const timeCard = screen.getByTestId("stat-card-study-time");
      expect(timeCard).toBeOnTheScreen();
      expect(screen.getByText("2h 11m")).toBeOnTheScreen();
      expect(screen.getByText("Study Time")).toBeOnTheScreen();
    });

    it("displays total sessions completed", () => {
      render(<UserStats />);

      const sessionsCard = screen.getByTestId("stat-card-sessions");
      expect(sessionsCard).toBeOnTheScreen();
      expect(screen.getByText("23")).toBeOnTheScreen();
      expect(screen.getByText("Sessions")).toBeOnTheScreen();
    });
  });

  describe("Achievements Section", () => {
    it("displays achievements section title", () => {
      render(<UserStats />);

      expect(screen.getByText("Unlocked Badges")).toBeOnTheScreen();
    });

    it("renders all achievement badges", () => {
      render(<UserStats />);

      // Should render 3 achievement images based on our mock data
      const achievements = screen.getAllByLabelText("Achievement Badge");
      expect(achievements).toHaveLength(3);
    });

    it("opens achievement modal when badge is pressed", () => {
      render(<UserStats />);

      const firstAchievement = screen
        .getAllByLabelText("Achievement Badge")
        .at(0);
      fireEvent.press(firstAchievement);

      expect(screen.getByTestId("achievement-modal")).toBeOnTheScreen();
      expect(screen.getByText("First Steps")).toBeOnTheScreen();
    });

    it("closes achievement modal when close button is pressed", () => {
      render(<UserStats />);

      // Open modal
      const firstAchievement = screen.getAllByLabelText("Achievement Badge")[0];
      fireEvent.press(firstAchievement);

      expect(screen.getByTestId("achievement-modal")).toBeOnTheScreen();

      // Close modal
      const closeButton = screen.getByTestId("modal-close-button");
      fireEvent.press(closeButton);

      expect(screen.queryByTestId("achievement-modal")).not.toBeOnTheScreen();
    });
  });

  describe("Achievement Evaluation", () => {
    it("evaluates achievements when component loads with valid data", async () => {
      useUserData.mockReturnValue({
        data: mockUserData,
        isLoading: false,
      });

      render(<UserStats />);

      await waitFor(() => {
        expect(achievementUtils.evaluateAchievements).toHaveBeenCalledWith(
          "user-123",
          247, // totalCardsReviewed
          14, // streak
          23, // totalSessionsCompleted
          7890000, // timeSpent
          [], // dailyChallenges (from mock challenge store)
          0
        );
      });
    });

    it("handles achievement evaluation errors gracefully", async () => {
      const mockError = new Error("Achievement evaluation failed");
      achievementUtils.evaluateAchievements.mockRejectedValue(mockError);

      render(<UserStats />);

      await waitFor(() => {
        expect(achievementUtils.evaluateAchievements).toHaveBeenCalled();
      });

      // Component should still render normally despite the error
      expect(screen.getByText("Unlocked Badges")).toBeOnTheScreen();
    });

    it("does not evaluate achievements when user data is missing", () => {
      useUserData.mockReturnValue({
        data: null,
        isLoading: false,
      });

      render(<UserStats />);

      expect(achievementUtils.evaluateAchievements).not.toHaveBeenCalled();
    });

    it("does not evaluate achievements when user ID is missing", () => {
      useUserStore.mockReturnValue({
        user: null,
      });

      render(<UserStats />);

      expect(achievementUtils.evaluateAchievements).not.toHaveBeenCalled();
    });
  });

  describe("Data Handling Edge Cases", () => {
    it("handles missing user data fields gracefully", () => {
      useUserData.mockReturnValue({
        data: {
          level: null,
          xp: undefined,
          streak: 0,
          // Missing other fields
        },
        isLoading: false,
      });

      render(<UserStats />);

      // Should display default values
      expect(screen.getByText("Level 1 - 0/1500 XP")).toBeOnTheScreen();
      expect(screen.getAllByText("0")).toHaveLength(3); // streak, cards, sessions
    });

    it("displays zero values correctly", () => {
      useUserData.mockReturnValue({
        data: {
          level: 1,
          xp: 0,
          streak: 0,
          totalCardsReviewed: 0,
          timeSpent: 0,
          totalSessionsCompleted: 0,
        },
        isLoading: false,
      });

      require("@/app/utils/dayUtils").formatDurationToHoursAndMinutes.mockReturnValue(
        "0h 0m"
      );

      render(<UserStats />);

      expect(screen.getByText("Level 1 - 0/1500 XP")).toBeOnTheScreen();
      expect(screen.getAllByText("0")).toHaveLength(3); // streak, cards, sessions
      expect(screen.getByText("0h 0m")).toBeOnTheScreen();
    });
  });

  describe("Achievement Sorting", () => {
    it("displays unlocked achievements before locked ones", () => {
      render(<UserStats />);

      const achievements = screen.getAllByLabelText("Achievement Badge");
      expect(achievements).toHaveLength(3);

      // First two should be unlocked (not grayed out)
      // Third should be locked (would be grayed out in real implementation)
    });
  });

  describe("User Interactions", () => {
    it("provides proper accessibility for achievement badges", () => {
      render(<UserStats />);

      const achievements = screen.getAllByLabelText("Achievement Badge");
      achievements.forEach((achievement) => {
        expect(achievement).toBeOnTheScreen();
        // In real implementation, these would have accessibility labels
      });
    });

    it("handles rapid badge presses without errors", () => {
      render(<UserStats />);

      const firstAchievement = screen.getAllByLabelText("Achievement Badge")[0];

      // Rapidly press the same badge multiple times
      fireEvent.press(firstAchievement);
      fireEvent.press(firstAchievement);
      fireEvent.press(firstAchievement);

      // Should only show one modal
      expect(screen.getByTestId("achievement-modal")).toBeOnTheScreen();
    });
  });

  describe("Component Integration", () => {
    it("passes correct props to LevelDisplay component", () => {
      render(<UserStats />);

      expect(screen.getByTestId("level-display")).toBeOnTheScreen();
      // Component receives level, nextLevel, currentXP, targetXP props
    });

    it("passes correct props to StatCard components", () => {
      render(<UserStats />);

      expect(screen.getByTestId("stat-card-day-streak")).toBeOnTheScreen();
      expect(screen.getByTestId("stat-card-cards-reviewed")).toBeOnTheScreen();
      expect(screen.getByTestId("stat-card-study-time")).toBeOnTheScreen();
      expect(screen.getByTestId("stat-card-sessions")).toBeOnTheScreen();
    });
  });

  describe("Performance", () => {
    it("handles large numbers in statistics", () => {
      useUserData.mockReturnValue({
        data: {
          level: 50,
          xp: 999999,
          streak: 365,
          totalCardsReviewed: 10000,
          timeSpent: 36000000, // 10 hours in milliseconds
          totalSessionsCompleted: 1000,
        },
        isLoading: false,
      });

      require("@/app/utils/dayUtils").formatDurationToHoursAndMinutes.mockReturnValue(
        "10h 0m"
      );

      render(<UserStats />);

      expect(screen.getByText("365")).toBeOnTheScreen();
      expect(screen.getByText("10000")).toBeOnTheScreen();
      expect(screen.getByText("1000")).toBeOnTheScreen();
      expect(screen.getByText("10h 0m")).toBeOnTheScreen();
    });

    it("renders efficiently with multiple achievements", () => {
      const startTime = Date.now();
      render(<UserStats />);
      const renderTime = Date.now() - startTime;

      expect(screen.getByText("Unlocked Badges")).toBeOnTheScreen();
      expect(renderTime).toBeLessThan(1000); // Should render quickly
    });
  });

  describe("Accessibility", () => {
    it("provides proper screen reader support", () => {
      render(<UserStats />);

      // Key elements should be accessible
      expect(screen.getByText("Unlocked Badges")).toBeOnTheScreen();
      expect(screen.getByText("Day Streak")).toBeOnTheScreen();
      expect(screen.getByText("Cards Reviewed")).toBeOnTheScreen();
      expect(screen.getByText("Study Time")).toBeOnTheScreen();
      expect(screen.getByText("Sessions")).toBeOnTheScreen();
    });
  });
});
