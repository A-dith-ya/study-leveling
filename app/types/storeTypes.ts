export interface Cosmetic {
  id: string;
  category: "STICKER";
  price: number;
  image: any;
}

export interface StickerCardProps {
  sticker: Omit<Cosmetic, "image">;
  isBoughtToday: boolean;
  hasEnoughCoins: boolean;
  onBuy: (stickerId: string) => void;
}

export interface CoinBalanceProps {
  coins: number;
  prevCoins?: number;
}
