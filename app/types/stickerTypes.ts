import { Ionicons } from "@expo/vector-icons";
import { Href } from "expo-router";

export interface Sticker {
  cosmeticId: string;
  category: "STICKER";
  count: number;
}

export interface PlacedSticker {
  id: string; // This will be cosmeticId#count format
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
}

// Sticker components
export interface EditHeaderProps {
  title: string;
  rightButtonText: string;
  rightButtonIcon: keyof typeof Ionicons.glyphMap;
  onRightButtonPress: () => void;
  showBackButton?: boolean;
  backButtonDestination?: Href;
}

export interface DraggableStickerProps {
  sticker: PlacedSticker;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<PlacedSticker>) => void;
  onDelete: () => void;
}
