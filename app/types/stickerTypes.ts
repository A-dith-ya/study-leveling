export interface Sticker {
  id: string;
  name: string;
  category: string;
  count: number;
}

export interface PlacedSticker extends Sticker {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
}
