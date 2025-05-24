import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useUserStore from "@/app/stores/userStore";
import {
  getDecksByUserId,
  getDeckById,
  createDeck,
  updateDeck,
} from "@/app/services/deckService";
import { Flashcard } from "../types/flashcardTypes";

export function useDecks() {
  const user = useUserStore((state) => state.user);

  return useQuery({
    queryKey: ["decks", user?.id],
    queryFn: () => getDecksByUserId(user?.id || ""),
    enabled: !!user?.id,
  });
}

export function useDeck(deckId: string) {
  return useQuery({
    queryKey: ["deck", deckId],
    queryFn: () => getDeckById(deckId),
    enabled: !!deckId,
  });
}

export function useCreateDeck() {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);

  return useMutation({
    mutationFn: async ({
      deckId,
      title,
      flashcards,
    }: {
      deckId: string;
      title: string;
      flashcards: Flashcard[];
    }) => createDeck(user?.id || "", deckId, title, flashcards),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks", user?.id] });
    },
  });
}

export function useUpdateDeck() {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);

  return useMutation({
    mutationFn: async ({
      deckId,
      title,
      flashcards,
      deletedFlashcardIds,
    }: {
      deckId: string;
      title: string;
      flashcards: Flashcard[];
      deletedFlashcardIds: string[];
    }) =>
      updateDeck(
        user?.id || "",
        deckId,
        title,
        flashcards,
        deletedFlashcardIds
      ),
    onSuccess: (updatedDeck, variables) => {
      queryClient.invalidateQueries({ queryKey: ["decks", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["deck", variables.deckId] });
    },
  });
}
