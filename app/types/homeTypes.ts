export interface DashboardHeaderProps {
  level: number;
  currentXP: number;
  requiredXP: number;
  streakCount: number;
  coins: number;
}

export interface DeckCardProps {
  title: string;
  cardCount: number;
  onEdit: () => void;
  onPractice: () => void;
  onAIReview: () => void;
}

export interface DeckItem {
  title: string;
  flashcardCount: number;
  deckId: string;
}
