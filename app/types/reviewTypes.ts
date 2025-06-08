import { PlacedSticker } from "@/app/types/stickerTypes";

export interface AnswerSegment {
  text: string;
  type: "correct" | "incorrect" | "missing" | "none";
}

export interface SegmentResult extends AnswerSegment {
  index: number;
}

// FlashcardReview components
export interface ReviewHeaderProps {
  currentIndex: number;
  totalCards: number;
  isReviewingMarked: boolean;
  shuffleMode: boolean;
  onToggleShuffle: () => void;
  onExit: () => void;
}

export interface FlashcardDisplayProps {
  front: string;
  back: string;
  onFlip: () => void;
  flipAnimation: any;
  scaleAnimation: any;
  decorations?: PlacedSticker[];
}

export interface ReviewControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  onMark: () => void;
  onComplete: () => void;
  isFirstCard: boolean;
  isLastCard: boolean;
}

// AIReview components
export interface HighlightedAnswerProps {
  label: string;
  segments: Array<{
    text: string;
    type: "correct" | "incorrect" | "missing" | "none";
  }>;
}

export type DotStyleKey = "correctDot" | "incorrectDot" | "missingDot";

export interface AIFeedbackProps {
  explanation: string;
}

export interface MicButtonProps {
  onTranscriptChange: (transcript: string) => void;
  currentText?: string;
}

// AISummary components
export interface AISummaryCardItem {
  id: string;
  question: string;
  userAnswer?: string;
  correctAnswer?: string;
  aiExplanation?: string;
  userAnswerSegments?: Array<{
    text: string;
    type: "correct" | "incorrect" | "missing" | "none";
  }>;
  correctAnswerSegments?: Array<{
    text: string;
    type: "correct" | "incorrect" | "missing" | "none";
  }>;
}
