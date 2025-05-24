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
          "coins",
          "ownedCosmetics.*",
          "decorations.*",
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

/**
 * Updates user's unlocked achievements in the database
 */
export async function updateUserAchievements(
  userId: string,
  achievements: string[]
) {
  try {
    const { errors } = await client.models.User.update(
      {
        userId,
        unlockedAchievements: achievements,
      },
      {
        selectionSet: ["unlockedAchievements"],
      }
    );

    if (errors) {
      logger.error("updateUserAchievements", errors);
      throw new Error("Error updating achievements");
    }

    logger.debug("updateUserAchievements", { userId, achievements });
  } catch (error) {
    logger.error("updateUserAchievements", error);
    throw error;
  }
}

/**
 * Updates user's coins and XP in the database
 */
export async function updateUserRewards(
  userId: string,
  coins: number,
  xp: number
) {
  try {
    const { data: user, errors } = await client.models.User.update(
      {
        userId,
        coins,
        xp,
      },
      {
        selectionSet: ["coins", "xp"],
      }
    );

    if (errors) {
      logger.error("updateUserRewards", errors);
      throw new Error("Error updating user rewards");
    }

    logger.debug("updateUserRewards", user);
    return user;
  } catch (error) {
    logger.error("updateUserRewards", error);
    throw error;
  }
}

export async function updateUserOwnedCosmetics(
  userId: string,
  coins: number,
  ownedCosmetics: Schema["User"]["type"]["ownedCosmetics"]
) {
  try {
    const { data: user, errors } = await client.models.User.update(
      {
        userId,
        coins,
        ownedCosmetics,
      },
      {
        selectionSet: ["coins", "ownedCosmetics.*"],
      }
    );

    if (errors) {
      logger.error("updateUserOwnedCosmetics", errors);
      throw new Error("Error updating owned cosmetics");
    }

    logger.debug("updateUserOwnedCosmetics", user);
    return user;
  } catch (error) {
    logger.error("updateUserOwnedCosmetics", error);
    throw error;
  }
}

export async function updateUserDecorations(
  userId: string,
  decorations: Schema["User"]["type"]["decorations"]
) {
  try {
    const { data: user, errors } = await client.models.User.update(
      {
        userId,
        decorations,
      },
      {
        selectionSet: ["decorations.*"],
      }
    );

    if (errors) {
      logger.error("updateUserDecorations", errors);
      throw new Error("Error updating decorations");
    }

    logger.debug("updateUserDecorations", user);
    return user;
  } catch (error) {
    logger.error("updateUserDecorations", error);
    throw error;
  }
}
