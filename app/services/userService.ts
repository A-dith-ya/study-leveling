import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { logger } from "../utils/logger";

const client = generateClient<Schema>();

export async function getUserById(userId: string) {
  try {
    const { data: user, errors } = await client.models.User.get(
      {
        userId: userId,
      },
      {
        selectionSet: [
          "xp",
          "level",
          "streak",
          "timeSpent",
          "totalCardsReviewed",
          "totalSessionsCompleted",
          "updatedAt",
        ],
      }
    );

    if (errors) {
      logger.error("getUserById", errors);
      throw new Error("Error fetching user");
    }

    logger.debug("getUserById", user);
    return user;
  } catch (error) {
    logger.error("getUserById", error);
    throw error;
  }
}

export async function getAchievementsByUserId(userId: string) {
  try {
    const { data: achievements, errors } = await client.models.User.get(
      {
        userId: userId,
      },
      {
        selectionSet: ["unlockedAchievements"],
      }
    );

    if (errors) {
      logger.error("getAchievementsByUserId", errors);
      throw new Error("Error fetching achievements");
    }

    logger.debug("getAchievementsByUserId", achievements);
    return achievements;
  } catch (error) {
    logger.error("getAchievementsByUserId", error);
    throw error;
  }
}

export async function updateUserSessionStats(
  userId: string,
  xp: number,
  level: number,
  streak: number,
  timeSpent: number,
  totalCardsReviewed: number,
  totalSessionsCompleted: number
) {
  try {
    const { data: user, errors } = await client.models.User.update(
      {
        userId: userId,
        xp: xp,
        level: level,
        streak: streak,
        timeSpent: timeSpent,
        totalCardsReviewed: totalCardsReviewed,
        totalSessionsCompleted: totalSessionsCompleted,
      },
      {
        selectionSet: [
          "xp",
          "timeSpent",
          "totalCardsReviewed",
          "totalSessionsCompleted",
        ],
      }
    );

    if (errors) {
      logger.error("updateUserSessionStats", errors);
      throw new Error("Error updating user session stats");
    }

    logger.debug("updateUserSessionStats", user);
    return user;
  } catch (error) {
    logger.error("updateUserSessionStats", error);
    throw error;
  }
}
