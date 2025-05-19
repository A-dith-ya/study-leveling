import { create } from "zustand";
import { AnswerSegment } from "../types/reviewTypes";

interface ReviewState {
  deckId: string | null;
  currentFlashcardIndex: number;
  userAnswers: Record<string, string>; // flashcardId -> user answer
  evaluations: Record<
    string,
    {
      userAnswerSegments: AnswerSegment[];
      correctAnswerSegments: AnswerSegment[];
      aiExplanation: string;
    }
  >;
}

interface ReviewActions {
  initReview: (deckId: string) => void;
  setCurrentFlashcardIndex: (index: number) => void;
  setUserAnswer: (flashcardId: string, answer: string) => void;
  setEvaluation: (
    flashcardId: string,
    evaluation: ReviewState["evaluations"][string]
  ) => void;
  reset: () => void;
  goToNextCard: () => void;
  goToPreviousCard: () => void;
  hasEvaluation: (flashcardId: string) => boolean;
}

const initialState: ReviewState = {
  deckId: null,
  currentFlashcardIndex: 0,
  userAnswers: {},
  evaluations: {},
};

export const useReviewStore = create<ReviewState & ReviewActions>(
  (set, get) => ({
    ...initialState,

    initReview: (deckId) =>
      set({
        deckId,
        currentFlashcardIndex: 0,
        userAnswers: {},
        evaluations: {},
      }),

    setCurrentFlashcardIndex: (index) => set({ currentFlashcardIndex: index }),

    setUserAnswer: (flashcardId, answer) =>
      set((state) => ({
        userAnswers: { ...state.userAnswers, [flashcardId]: answer },
      })),

    setEvaluation: (flashcardId, evaluation) =>
      set((state) => ({
        evaluations: { ...state.evaluations, [flashcardId]: evaluation },
      })),

    reset: () => set(initialState),

    goToNextCard: () =>
      set((state) => ({
        currentFlashcardIndex: state.currentFlashcardIndex + 1,
      })),

    goToPreviousCard: () =>
      set((state) => ({
        currentFlashcardIndex: Math.max(0, state.currentFlashcardIndex - 1),
      })),

    hasEvaluation: (flashcardId: string) => {
      const state = get();
      return Boolean(state.evaluations[flashcardId]);
    },
  })
);
