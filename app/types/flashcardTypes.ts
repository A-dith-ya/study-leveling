// Add and Edit Flashcard components
export interface FlashcardItemProps {
  front: string;
  back: string;
  onChangeFront: (text: string) => void;
  onChangeBack: (text: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  order: number;
}
