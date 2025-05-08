import { logger } from "./logger";
import useAchievementStore from "../stores/achievementStore";
import { updateUserAchievements } from "../services/userService";

interface AchievementTier {
  readonly id: string;
  readonly threshold: number;
  readonly type: "flashcards";
}

const MASTERY_TIERS: readonly AchievementTier[] = [
  { id: "flashcard-master-10", threshold: 10, type: "flashcards" },
  { id: "flashcard-master-100", threshold: 100, type: "flashcards" },
  { id: "flashcard-master-1000", threshold: 1000, type: "flashcards" },
] as const;

/**
 * Evaluates and unlocks achievements based on user stats
 * @param userId User ID to check achievements for
 * @param totalCards Total number of cards reviewed
 */
export async function evaluateAchievements(
  userId: string,
  totalCards: number
): Promise<string[]> {
  try {
    const achievementStore = useAchievementStore.getState();

    // Find achievements that should be unlocked
    const achievementsToUnlock = MASTERY_TIERS.filter(
      (tier) =>
        totalCards >= tier.threshold && !achievementStore.isUnlocked(tier.id)
    ).map((tier) => tier.id);

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
