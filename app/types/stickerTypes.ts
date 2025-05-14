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
