import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import { CommonActions } from "@react-navigation/native";

import FlashcardReward from "../FlashcardReward";
import { useUserData, useUpdateUserSessionStats } from "../../hooks/useUser";
import * as xpUtils from "../../utils/xpUtils";
import * as dayUtils from "../../utils/dayUtils";
import * as challengeUtils from "../../utils/challengeUtils";

// Mock dependencies
jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  router: {
    replace: jest.fn(),
  },
  useNavigation: jest.fn(),
}));

jest.mock("../../hooks/useUser", () => ({
  useUserData: jest.fn(),
  useUpdateUserSessionStats: jest.fn(),
}));

jest.mock("../../utils/xpUtils", () => ({
  getLevelFromXP: jest.fn(),
}));

jest.mock("../../utils/dayUtils", () => ({
  updateStreak: jest.fn(),
  formatDuration: jest.fn(),
}));

jest.mock("../../utils/challengeUtils", () => ({
  updateFlashcardChallenges: jest.fn(),
  updateSessionChallenges: jest.fn(),
}));

jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  
  // Add any missing mocks
  Reanimated.default.createAnimatedComponent = (component) => component;
  
  return {
    ...Reanimated,
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withSpring: jest.fn((value) => value),
    withTiming: jest.fn((value) => value),
    withSequence: jest.fn((value) => value),
    interpolate: jest.fn(),
  };
});

describe("FlashcardReward", () => {
  const mockNavigation = {
    dispatch: jest.fn(),
  };

  const mockUpdateStats = {
    mutate: jest.fn(),
  };

  const mockUserData = {
    id: "user-1",
    xp: 100,
    level: 2,
    streak: 5,
    timeSpent: 300000,
    totalCardsReviewed: 50,
    totalSessionsCompleted: 10,
    updatedAt: new Date().toISOString(),
  };

  const mockParams = {
    totalCards: "15",
    duration: "300000",
    xpEarned: "75",
    deckId: "deck-1",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    useLocalSearchParams.mockReturnValue(mockParams);
    useNavigation.mockReturnValue(mockNavigation);
    useUserData.mockReturnValue({ data: mockUserData });
    useUpdateUserSessionStats.mockReturnValue(mockUpdateStats);
    
    xpUtils.getLevelFromXP.mockReturnValue({ level: 3, xp: 175 });
    dayUtils.updateStreak.mockReturnValue(6);
    dayUtils.formatDuration.mockReturnValue("5m 0s");
  });

  describe("Rendering", () => {
    it("renders the reward screen with correct title and subtitle", () => {
      render(<FlashcardReward />);

      expect(screen.getByText("Great Job!")).toBeTruthy();
      expect(screen.getByText("Session summary")).toBeTruthy();
    });

    it("displays the XP earned", () => {
      render(<FlashcardReward />);

      expect(screen.getByText("+75 XP")).toBeTruthy();
    });

    it("displays session statistics", () => {
      render(<FlashcardReward />);

      expect(screen.getByText("Time Spent")).toBeTruthy();
      expect(screen.getByText("5m 0s")).toBeTruthy();
      expect(screen.getByText("Cards Reviewed")).toBeTruthy();
      expect(screen.getByText("15")).toBeTruthy();
    });

    it("renders navigation buttons", () => {
      render(<FlashcardReward />);

      expect(screen.getByRole("button", { name: /back to dashboard/i })).toBeTruthy();
      expect(screen.getByRole("button", { name: /retry deck/i })).toBeTruthy();
    });
  });

  describe("User Data Integration", () => {
    it("calls stats update with correct values when user data exists", async () => {
      render(<FlashcardReward />);

      await waitFor(() => {
        expect(xpUtils.getLevelFromXP).toHaveBeenCalledWith(175, 2);
        expect(dayUtils.updateStreak).toHaveBeenCalledWith(
          new Date(mockUserData.updatedAt),
          5
        );
        expect(mockUpdateStats.mutate).toHaveBeenCalledWith({
          xp: 175,
          level: 3,
          streak: 6,
          timeSpent: 600000,
          totalCardsReviewed: 65,
          totalSessionsCompleted: 11,
        });
      });
    });

    it("updates challenge progress", async () => {
      render(<FlashcardReward />);

      await waitFor(() => {
        expect(challengeUtils.updateFlashcardChallenges).toHaveBeenCalledWith(15);
        expect(challengeUtils.updateSessionChallenges).toHaveBeenCalledWith(1);
      });
    });

    it("handles missing user data gracefully", () => {
      useUserData.mockReturnValue({ data: null });

      render(<FlashcardReward />);

      expect(mockUpdateStats.mutate).not.toHaveBeenCalled();
      expect(challengeUtils.updateFlashcardChallenges).not.toHaveBeenCalled();
    });

    it("handles incomplete user data", () => {
      const incompleteUserData = {
        id: "user-1",
        xp: undefined,
        level: undefined,
        streak: undefined,
        timeSpent: undefined,
        totalCardsReviewed: undefined,
        totalSessionsCompleted: undefined,
        updatedAt: new Date().toISOString(),
      };

      useUserData.mockReturnValue({ data: incompleteUserData });
      xpUtils.getLevelFromXP.mockReturnValue({ level: 1, xp: 75 });
      dayUtils.updateStreak.mockReturnValue(1);

      render(<FlashcardReward />);

      expect(xpUtils.getLevelFromXP).toHaveBeenCalledWith(75, 1);
      expect(mockUpdateStats.mutate).toHaveBeenCalledWith({
        xp: 75,
        level: 1,
        streak: 1,
        timeSpent: 300000,
        totalCardsReviewed: 15,
        totalSessionsCompleted: 1,
      });
    });
  });

  describe("Navigation", () => {
    it("navigates to dashboard when back button is pressed", () => {
      render(<FlashcardReward />);

      const backButton = screen.getByRole("button", { name: /back to dashboard/i });
      fireEvent.press(backButton);

      expect(router.replace).toHaveBeenCalledWith("/(amain)");
    });

    it("dispatches reset navigation when retry button is pressed", () => {
      render(<FlashcardReward />);

      const retryButton = screen.getByRole("button", { name: /retry deck/i });
      fireEvent.press(retryButton);

      expect(mockNavigation.dispatch).toHaveBeenCalledWith(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "FlashcardReview", params: { deckId: "deck-1" } }],
        })
      );
    });
  });

  describe("Data Formatting", () => {
    it("formats duration correctly", () => {
      dayUtils.formatDuration.mockReturnValue("2m 30s");
      
      render(<FlashcardReward />);

      expect(dayUtils.formatDuration).toHaveBeenCalledWith(300000);
      expect(screen.getByText("2m 30s")).toBeTruthy();
    });

    it("handles different XP values", () => {
      useLocalSearchParams.mockReturnValue({
        ...mockParams,
        xpEarned: "150",
      });

      render(<FlashcardReward />);

      expect(screen.getByText("+150 XP")).toBeTruthy();
    });

    it("handles different card counts", () => {
      useLocalSearchParams.mockReturnValue({
        ...mockParams,
        totalCards: "25",
      });

      render(<FlashcardReward />);

      expect(screen.getByText("25")).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    it("handles missing search params", () => {
      useLocalSearchParams.mockReturnValue({});

      render(<FlashcardReward />);

      expect(screen.getByText("+ XP")).toBeTruthy();
      expect(dayUtils.formatDuration).toHaveBeenCalledWith(NaN);
    });

    it("handles zero values in params", () => {
      useLocalSearchParams.mockReturnValue({
        totalCards: "0",
        duration: "0",
        xpEarned: "0",
        deckId: "deck-1",
      });

      render(<FlashcardReward />);

      expect(screen.getByText("+0 XP")).toBeTruthy();
      expect(screen.getByText("0")).toBeTruthy();
    });

    it("handles string conversion for numeric params", () => {
      useLocalSearchParams.mockReturnValue({
        totalCards: "abc",
        duration: "xyz",
        xpEarned: "invalid",
        deckId: "deck-1",
      });

      render(<FlashcardReward />);

      expect(screen.getByText("+invalid XP")).toBeTruthy();
      expect(dayUtils.formatDuration).toHaveBeenCalledWith(NaN);
      expect(challengeUtils.updateFlashcardChallenges).toHaveBeenCalledWith(NaN);
    });
  });

  describe("Accessibility", () => {
    it("has accessible button labels", () => {
      render(<FlashcardReward />);

      const dashboardButton = screen.getByRole("button", {
        name: /back to dashboard/i,
      });
      const retryButton = screen.getByRole("button", { name: /retry deck/i });

      expect(dashboardButton).toBeTruthy();
      expect(retryButton).toBeTruthy();
    });

    it("has proper text labels for statistics", () => {
      render(<FlashcardReward />);

      expect(screen.getByText("Time Spent")).toBeTruthy();
      expect(screen.getByText("Cards Reviewed")).toBeTruthy();
    });
  });

  describe("Animation Integration", () => {
    it("initializes animation values", () => {
      const mockUseSharedValue = require("react-native-reanimated").useSharedValue;
      
      render(<FlashcardReward />);

      expect(mockUseSharedValue).toHaveBeenCalledWith(0.3);
      expect(mockUseSharedValue).toHaveBeenCalledWith(0);
      expect(mockUseSharedValue).toHaveBeenCalledWith(50);
    });

    it("creates animated styles", () => {
      const mockUseAnimatedStyle = require("react-native-reanimated").useAnimatedStyle;
      
      render(<FlashcardReward />);

      expect(mockUseAnimatedStyle).toHaveBeenCalled();
    });
  });

  describe("Performance", () => {
    it("only runs effects once on mount", () => {
      const { rerender } = render(<FlashcardReward />);
      
      expect(mockUpdateStats.mutate).toHaveBeenCalledTimes(1);
      
      rerender(<FlashcardReward />);
      
      // Should not be called again on rerender
      expect(mockUpdateStats.mutate).toHaveBeenCalledTimes(1);
    });

    it("memoizes expensive calculations", () => {
      render(<FlashcardReward />);

      expect(xpUtils.getLevelFromXP).toHaveBeenCalledTimes(1);
      expect(dayUtils.updateStreak).toHaveBeenCalledTimes(1);
    });
  });
});