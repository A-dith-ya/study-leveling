import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Flashcard } from "@/app/types/flashcardTypes";
import { logger } from "@/app/utils/logger";

const client = generateClient<Schema>();

export async function getDecksByUserId(userId: string) {
  try {
    const { data: decks, errors: decksErrors } = await client.models.Deck.list({
      filter: { userId: { eq: userId } },
      selectionSet: ["deckId", "title", "flashcardCount", "createdAt"],
    });

    if (decksErrors) {
      logger.error("Error fetching decks:", decksErrors);
      throw new Error("Error fetching decks");
    }
    logger.debug("Get decks", decks);

    return decks;
  } catch (error) {
    logger.error("Error fetching decks:", error);
    throw error;
  }
}

export async function getDeckById(deckId: string) {
  try {
    const { data: deck, errors: deckErrors } = await client.models.Deck.get(
      {
        deckId,
      },
      {
        selectionSet: [
          "deckId",
          "title",
          "flashcardCount",
          "createdAt",
          "flashcards.flashcardId",
          "flashcards.front",
          "flashcards.back",
          "flashcards.order",
        ],
      }
    );

    if (deckErrors) {
      logger.error("Error fetching deck:", deckErrors);
      throw new Error("Error fetching deck");
    }
    logger.debug("Edit deck", deck);

    deck?.flashcards.sort((a: any, b: any) => a.order - b.order);

    return deck;
  } catch (error) {
    logger.error("Fetching deck:", error);
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
    const { data: result, errors: flashcardErrors } =
      await client.queries.batchCreateFlashcard({
        deckId,
        title,
        userId,
        flashcards: flashcards.map((card) => ({
          flashcardId: card.id,
          front: card.front,
          back: card.back,
          order: card.order,
        })),
      });

    if (flashcardErrors) {
      logger.error("Error creating flashcards:", flashcardErrors);
      throw new Error("Error creating flashcards");
    }
    logger.debug("Created flashcards", result);

    return result;
  } catch (error) {
    logger.error("Error creating deck:", error);
    throw error;
  }
}

export async function updateDeck(
  userId: string,
  deckId: string,
  title: string,
  flashcards: Flashcard[],
  deletedFlashcardIds: string[]
) {
  try {
    const { data: result, errors } = await client.queries.batchUpdateFlashcard({
      deckId,
      title,
      userId,
      flashcards: flashcards.map((card) => ({
        flashcardId: card.id,
        front: card.front,
        back: card.back,
        order: card.order,
      })),
      deletedFlashcardIds,
    });

    if (errors) {
      logger.error("Error updating deck and flashcards:", errors);
      throw new Error("Error updating deck and flashcards");
    }
    logger.debug("Updated deck and flashcards", result);

    return result;
  } catch (error) {
    logger.error("Error updating deck:", error);
    throw error;
  }
}
