import { v4 as uuidv4 } from "uuid";

import { Flashcard } from "../types/flashcardTypes";

export const fisherYatesShuffle = <T>(array: T[], count?: number): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result.slice(0, count ?? array.length);
};

export const createNewFlashcard = (currentLength: number): Flashcard => ({
  id: uuidv4(),
  front: "",
  back: "",
  order: currentLength,
});

export const updateFlashcardField = (
  flashcards: Flashcard[],
  id: string,
  field: "front" | "back",
  value: string
): Flashcard[] => {
  return flashcards.map((card) =>
    card.id === id ? { ...card, [field]: value } : card
  );
};

export const deleteFlashcardAndReorder = (
  flashcards: Flashcard[],
  id: string
): { updatedFlashcards: Flashcard[]; deletedCardIndex: number } => {
  const deletedCardIndex = flashcards.findIndex((card) => card.id === id);
  const updatedFlashcards = flashcards
    .filter((card) => card.id !== id)
    .map((card) => ({
      ...card,
      order: card.order > deletedCardIndex ? card.order - 1 : card.order,
    }));
  return { updatedFlashcards, deletedCardIndex };
};

export const moveFlashcard = (
  flashcards: Flashcard[],
  index: number,
  direction: "up" | "down"
): Flashcard[] => {
  const newIndex = direction === "up" ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= flashcards.length) return flashcards;

  const newFlashcards = [...flashcards];
  const movedCard = newFlashcards[index];
  const replacedCard = newFlashcards[newIndex];

  // Swap orders
  const tempOrder = movedCard.order;
  movedCard.order = replacedCard.order;
  replacedCard.order = tempOrder;

  // Swap positions in array
  newFlashcards[index] = replacedCard;
  newFlashcards[newIndex] = movedCard;

  // Sort array by order to maintain consistency
  return newFlashcards.sort((a, b) => a.order - b.order);
};

export const validateFlashcards = (
  deckTitle: string,
  flashcards: Flashcard[]
): { isValid: boolean; errorMessage?: string } => {
  if (!deckTitle.trim()) {
    return { isValid: false, errorMessage: "Please enter a deck title" };
  }

  if (deckTitle.length < 3) {
    return {
      isValid: false,
      errorMessage: "Deck title must be at least 3 characters long",
    };
  }

  if (deckTitle.length > 100) {
    return {
      isValid: false,
      errorMessage: "Deck title must be less than 100 characters",
    };
  }

  if (flashcards.length < 3) {
    return {
      isValid: false,
      errorMessage: "Please have at least 3 flashcards",
    };
  }

  const emptyCards = flashcards.filter(
    (card) => !card.front.trim() || !card.back.trim()
  );
  if (emptyCards.length > 0) {
    return {
      isValid: false,
      errorMessage: "Please fill in all flashcard content",
    };
  }

  const tooLongCards = flashcards.filter(
    (card) => card.front.length > 500 || card.back.length > 500
  );
  if (tooLongCards.length > 0) {
    return {
      isValid: false,
      errorMessage: "Flashcard content must be less than 500 characters",
    };
  }

  return { isValid: true };
};
