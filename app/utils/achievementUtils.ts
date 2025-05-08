import { logger } from "./logger";
import useAchievementStore from "../stores/achievementStore";
import { updateUserAchievements } from "../services/userService";

interface AchievementTier {
  readonly id: string;
  readonly threshold: number;
  readonly type: "flashcards" | "streak" | "sessions";
}

const ACHIEVEMENT_TIERS: readonly AchievementTier[] = [
  // Flashcard mastery achievements
  { id: "flashcard-master-10", threshold: 10, type: "flashcards" },
  { id: "flashcard-master-100", threshold: 100, type: "flashcards" },
  { id: "flashcard-master-1000", threshold: 1000, type: "flashcards" },
  // Streak achievements
  { id: "streak-king-10", threshold: 10, type: "streak" },
  { id: "streak-king-30", threshold: 30, type: "streak" },
  // Session achievements
  { id: "session-surfer-10", threshold: 10, type: "sessions" },
  { id: "session-surfer-50", threshold: 50, type: "sessions" },
  { id: "session-surfer-100", threshold: 100, type: "sessions" },
] as const;

/**
 * Evaluates and unlocks achievements based on user stats
 * @param userId User ID to check achievements for
 * @param totalCards Total number of cards reviewed
 * @param currentStreak Current streak count (optional)
 * @param totalSessions Total number of completed sessions (optional)
 */
export async function evaluateAchievements(
  userId: string,
  totalCards: number,
  currentStreak?: number,
  totalSessions?: number
): Promise<string[]> {
  try {
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
      }
      return false;
    }).map((tier) => tier.id);

    if (achievementsToUnlock.length === 0) {
      return [];
    }

    // Update achievements in database
    await updateUserAchievements(userId, achievementsToUnlock);

    // Update local store
    achievementsToUnlock.forEach((id) => achievementStore.unlock(id));

    logger.debug("Unlocked achievements", { achievementsToUnlock });
    return achievementsToUnlock;
  } catch (error) {
    logger.error("Failed to evaluate achievements", error);
    return [];
  }
}
