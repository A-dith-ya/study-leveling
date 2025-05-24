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

// File Upload Modal
export interface UploadedFile {
  name: string;
  uri: string;
  size: number;
  type: string;
  content?: string;
}

export interface FileUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onGenerate: (files: UploadedFile[]) => void;
  isGenerating?: boolean;
}
