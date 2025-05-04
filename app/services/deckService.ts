import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export async function getDecksByUserId(userId: string) {
  try {
    const decks = await client.models.Deck.list({
      filter: { userId: { eq: userId } },
      selectionSet: ["deckId", "title", "createdAt"],
    });
    console.log("decks", decks);

    return decks;
  } catch (error) {
    console.error("Error fetching decks:", error);
    throw error;
  }
}
