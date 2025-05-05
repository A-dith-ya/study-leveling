import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import type { Flashcard } from "../(flashcard)/index";

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

export async function createDeck(
  userId: string,
  deckId: string,
  title: string,
  flashcards: Flashcard[]
) {
  try {
    // Create the deck first
    const deck = await client.models.Deck.create({
      deckId,
      title,
      userId,
      flashcardCount: flashcards.length,
    });
    console.log("deck", deck);

    const { data: flashcardData, errors } =
      await client.mutations.BatchCreateFlashcard({
        deckId,
        // title,
        // userId,
        flashcards: flashcards.map((card) => ({
          flashcardId: card.id,
          front: card.front,
          back: card.back,
          order: card.order,
        })),
      });
    console.log("flashcardData", flashcardData);

    return deck;
  } catch (error) {
    console.error("Error creating deck:", error);
    throw error;
  }
}
