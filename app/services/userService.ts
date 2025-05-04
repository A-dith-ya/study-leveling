import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export async function getUserById(userId: string) {
  const user = await client.models.User.get(
    {
      userId: userId,
    },
    {
      selectionSet: ["xp", "level", "streak"],
    }
  );
  console.log("user", user);
  return user;
}
