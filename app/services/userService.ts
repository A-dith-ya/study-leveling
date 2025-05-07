import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { logger } from "../utils/logger";

const client = generateClient<Schema>();

export async function getUserById(userId: string) {
  const user = await client.models.User.get(
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
      ],
    }
  );

  logger.debug("getUserById", user);
  return user;
}

export async function updateUserSessionStats(
  userId: string,
  xpEarned: number,
  timeSpent: number,
  totalCardsReviewed: number,
  totalSessionsCompleted: number
) {
  const user = await client.models.User.update(
    {
      userId: userId,
      xp: xpEarned,
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

  logger.debug("updateUserSessionStats", user);
  return user;
}
