import { v4 as uuidv4 } from "uuid";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Platform, Alert } from "react-native";

import { Flashcard, UploadedFile } from "@/app/types/flashcardTypes";
import { logger } from "@/app/utils/logger";
import { router } from "expo-router";

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

export const MAX_TOTAL_CHARACTERS = 10000;
const ALLOWED_TYPES = [".txt", ".md", ".csv"];

export const validateFile = (
  file: DocumentPicker.DocumentPickerAsset
): string | null => {
  // Check file type
  const fileExtension = file.name
    .toLowerCase()
    .substring(file.name.lastIndexOf("."));
  if (!ALLOWED_TYPES.includes(fileExtension)) {
    return `File type ${fileExtension} is not allowed. Only .txt, .md, and .csv files are supported.`;
  }

  return null;
};

export const validateTotalLimits = (files: UploadedFile[]): string[] => {
  const errors: string[] = [];

  // Check total characters (if content is loaded)
  const totalCharacters = files.reduce(
    (sum, file) => sum + (file.content?.length || 0),
    0
  );
  if (totalCharacters > MAX_TOTAL_CHARACTERS) {
    errors.push(
      `Total content exceeds ${MAX_TOTAL_CHARACTERS.toLocaleString()} characters limit. Current total: ${totalCharacters.toLocaleString()}`
    );
  }

  return errors;
};

export const readFileContent = async (
  file: DocumentPicker.DocumentPickerAsset
): Promise<string> => {
  try {
    if (Platform.OS === "web") {
      // For web platform, use fetch to read the file
      const response = await fetch(file.uri);
      const content = await response.text();
      return content;
    } else {
      // For mobile platforms, use FileSystem
      const content = await FileSystem.readAsStringAsync(file.uri);
      return content;
    }
  } catch (error) {
    logger.error("Error reading file content:", error);
    throw new Error(`Failed to read content from "${file.name}"`);
  }
};

// Web-specific file upload handler using HTML5 File API
export const pickFilesWeb = (): Promise<{
  canceled: boolean;
  assets?: File[];
}> => {
  return new Promise((resolve) => {
    if (Platform.OS !== "web") {
      resolve({ canceled: true });
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".txt,.md,.csv,text/plain,text/markdown,text/csv";

    input.onchange = (event) => {
      const files = Array.from((event.target as HTMLInputElement).files || []);
      if (files.length === 0) {
        resolve({ canceled: true });
      } else {
        resolve({ canceled: false, assets: files });
      }
    };

    input.oncancel = () => {
      resolve({ canceled: true });
    };

    input.click();
  });
};

// Read web file content
export const readWebFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      resolve(content);
    };

    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`));
    };

    reader.readAsText(file);
  });
};

// Validate web file
export const validateWebFile = (file: File): string | null => {
  // Check file type
  const fileName = file.name.toLowerCase();
  const allowedExtensions = [".txt", ".md", ".csv"];
  const hasValidExtension = allowedExtensions.some((ext) =>
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    const fileExtension = fileName.substring(fileName.lastIndexOf("."));
    return `File type ${fileExtension} is not allowed. Only .txt, .md, and .csv files are supported.`;
  }

  return null;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const getTotalCharacters = (files: UploadedFile[]) => {
  return files.reduce((sum, file) => sum + (file.content?.length || 0), 0);
};

export const handleExit = (reset?: () => void) => {
  Alert.alert(
    "Exit Review",
    "Your progress will not be saved.",
    [
      {
        text: "Continue Review",
        style: "cancel",
      },
      {
        text: "Go to Dashboard",
        style: "destructive",
        onPress: () => {
          if (typeof reset === "function") {
            reset();
          }
          router.replace("/(amain)");
        },
      },
    ],
    { cancelable: true }
  );
};
