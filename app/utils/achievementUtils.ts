import { logger } from "./logger";
import useAchievementStore from "@/app/stores/achievementStore";
import { updateUserAchievements } from "@/app/services/userService";
import { AchievementTier } from "@/app/types/achievementTypes";
import dayjs from "dayjs";

const ACHIEVEMENT_TIERS: readonly AchievementTier[] = [
  // Deck builder (awarded after reviewing first card)
  { id: "deck-builder", threshold: 1, type: "flashcards" },
  // Flashcard mastery achievements
  { id: "flashcard-master-10", threshold: 10, type: "flashcards" },
  { id: "flashcard-master-100", threshold: 100, type: "flashcards" },
  { id: "flashcard-master-1000", threshold: 1000, type: "flashcards" },
  // Streak achievements
  { id: "streak-king-3", threshold: 3, type: "streak" },
  { id: "streak-king-10", threshold: 10, type: "streak" },
  { id: "streak-king-30", threshold: 30, type: "streak" },
  // Session achievements
  { id: "session-surfer-10", threshold: 10, type: "sessions" },
  { id: "session-surfer-50", threshold: 50, type: "sessions" },
  { id: "session-surfer-100", threshold: 100, type: "sessions" },
  // Time-based achievements (threshold in seconds)
  { id: "study-time-1", threshold: 3600, type: "time" }, // 1 hour = 3600 seconds
  { id: "study-time-5", threshold: 18000, type: "time" }, // 5 hours = 18000 seconds
  { id: "study-time-10", threshold: 36000, type: "time" }, // 10 hours = 36000 seconds
  // Challenge achievement
  { id: "challenge-champ", threshold: 1, type: "challenges" },
  // Night owl achievement
  { id: "night-owl", threshold: 1, type: "night-owl" },
  // Customizer achievement
  { id: "customizer", threshold: 0, type: "customizer" },
] as const;

/**
 * Evaluates and unlocks achievements based on user stats
 * @param userId User ID to check achievements for
 * @param totalCards Total number of cards reviewed
 * @param currentStreak Current streak count (optional)
 * @param totalSessions Total number of completed sessions (optional)
 * @param timeSpent Total time spent studying in seconds (optional)
 * @param dailyChallenges Array of daily challenges for challenge achievements (optional)
 * @param decorationsCount Number of decorations applied to flashcards (optional)
 */
export async function evaluateAchievements(
  userId: string,
  totalCards: number,
  currentStreak?: number,
  totalSessions?: number,
  timeSpent?: number,
  dailyChallenges?: Array<{ isCompleted: boolean; isClaimed: boolean }>,
  decorationsCount?: number
): Promise<string[]> {
  try {
    if (!userId) {
      throw new Error("User ID is required to evaluate achievements");
    }

    const achievementStore = useAchievementStore.getState();

    // Find achievements that should be unlocked based on type and threshold
    const achievementsToUnlock = ACHIEVEMENT_TIERS.filter((tier) => {
      if (tier.type === "flashcards") {
        return (
          totalCards >= tier.threshold && !achievementStore.isUnlocked(tier.id)
        );
      } else if (tier.type === "streak" && currentStreak !== undefined) {
        return (
          currentStreak >= tier.threshold &&
          !achievementStore.isUnlocked(tier.id)
        );
      } else if (tier.type === "sessions" && totalSessions !== undefined) {
        return (
          totalSessions >= tier.threshold &&
          !achievementStore.isUnlocked(tier.id)
        );
      } else if (tier.type === "time" && timeSpent !== undefined) {
        return (
          timeSpent >= tier.threshold && !achievementStore.isUnlocked(tier.id)
        );
      } else if (tier.type === "challenges" && dailyChallenges !== undefined) {
        // Check if all daily challenges are completed and claimed
        const allChallengesClaimed =
          dailyChallenges.length > 0 &&
          dailyChallenges.every(
            (challenge) => challenge.isCompleted && challenge.isClaimed
          );
        return allChallengesClaimed && !achievementStore.isUnlocked(tier.id);
      } else if (tier.type === "night-owl") {
        const currentHour = dayjs().hour();
        return (
          currentHour >= 0 &&
          currentHour < 5 &&
          !achievementStore.isUnlocked(tier.id)
        );
      } else if (tier.type === "customizer" && decorationsCount !== undefined) {
        return (
          decorationsCount > tier.threshold &&
          !achievementStore.isUnlocked(tier.id)
        );
      }
      return false;
    }).map((tier) => tier.id);

    if (achievementsToUnlock.length === 0) {
      return [];
    }

    // Update achievements in database
    await updateUserAchievements(userId, [
      ...new Set([
        ...achievementStore.getUnlockedAchievements(),
        ...achievementsToUnlock,
      ]),
    ]);

    // Update local store
    achievementsToUnlock.forEach((id) => achievementStore.unlock(id));

    logger.debug("Unlocked achievements", { achievementsToUnlock });
    return achievementsToUnlock;
  } catch (error) {
    logger.error("Failed to evaluate achievements", error);
    return [];
  }
}
