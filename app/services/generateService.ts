import { generateClient } from "aws-amplify/api";
import { useMutation } from "@tanstack/react-query";
import type { Schema } from "@/amplify/data/resource";
import { logger } from "@/app/utils/logger";

const client = generateClient<Schema>();

async function generateFlashcardsFromNotes(
  notes: string
): Promise<Schema["generateFlashcardsResponse"]["type"][]> {
  try {
    const response = await client.queries.generateFlashcards({
      notes: notes,
    });

    if (!response.data) {
      throw new Error("No response from AI flashcard generation");
    }

    // Filter out null/undefined values and ensure type safety
    const filteredData = response.data.filter(
      (item): item is NonNullable<typeof item> => item != null
    );

    return filteredData;
  } catch (error) {
    logger.error("Error generating flashcards", {
      error,
      notes,
    });
    throw error;
  }
}

export function useGenerateFlashcards() {
  return useMutation({
    mutationFn: generateFlashcardsFromNotes,
    mutationKey: ["generateFlashcards"],
  });
}
