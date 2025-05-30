import dayjs from "dayjs";
import { ChestType } from "@/app/types/challengeTypes";
import useChallengeStore from "@/app/stores/challengeStore";

export const getChestImage = (type: ChestType) => {
  switch (type) {
    case "gold":
      return require("../../assets/images/challenges/gold-chest.webp");
    case "silver":
      return require("../../assets/images/challenges/silver-chest.webp");
    default:
      return require("../../assets/images/challenges/bronze-chest.webp");
  }
};

export const getChestStyle = (type: ChestType) => {
  switch (type) {
    case "bronze":
      return { backgroundColor: "#F3E1D4" };
    case "silver":
      return { backgroundColor: "#E0E8F0" };
    case "gold":
      return { backgroundColor: "#FEF2D8", transform: [{ scaleX: -1 }] };
    default:
      return {};
  }
};

/**
 * Gets the time remaining until the next challenge reset in hours and minutes
 */
export const getTimeUntilReset = (): { hours: number; minutes: number } => {
  const now = dayjs();
  const tomorrow = now.add(1, "day").startOf("day");
  const diff = tomorrow.diff(now, "minute");

  return {
    hours: Math.floor(diff / 60),
    minutes: diff % 60,
  };
};

/**
 * Formats the reset time into a readable string
 */
export const formatResetTime = (hours: number, minutes: number): string => {
  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
};

/**
 * Updates progress for flashcard-related challenges
 * @param cardsStudied Number of flashcards studied in this session
 */
export const updateFlashcardChallenges = (cardsStudied: number) => {
  const { dailyChallenges, updateProgress } = useChallengeStore.getState();

  dailyChallenges.forEach((challenge) => {
    if (challenge.id.startsWith("reward-")) {
      const currentProgress = challenge.progress;
      updateProgress(challenge.id, currentProgress + cardsStudied);
    }
  });
};

/**
 * Updates progress for study session challenges
 * @param sessionsCompleted Number of sessions completed (typically 1)
 */
export const updateSessionChallenges = (sessionsCompleted: number = 1) => {
  const { dailyChallenges, updateProgress } = useChallengeStore.getState();

  dailyChallenges.forEach((challenge) => {
    if (challenge.id.startsWith("session-")) {
      const currentProgress = challenge.progress;
      updateProgress(challenge.id, currentProgress + sessionsCompleted);
    }
  });
};

/**
 * Updates progress for time-based challenges
 * @param timeSpentSeconds Time spent studying in seconds
 */
export const updateTimeChallenges = (timeSpentSeconds: number) => {
  const { dailyChallenges, updateProgress } = useChallengeStore.getState();

  dailyChallenges.forEach((challenge) => {
    if (challenge.id.startsWith("study-") && challenge.id.includes("min")) {
      const currentProgress = challenge.progress;
      updateProgress(challenge.id, currentProgress + timeSpentSeconds);
    }
  });
};
