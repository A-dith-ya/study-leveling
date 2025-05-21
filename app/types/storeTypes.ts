import { ImageSourcePropType } from "react-native";

export interface Cosmetic {
  id: string;
  category: "STICKER";
  price: number;
  image: ImageSourcePropType;
}

export interface StickerCardProps {
  sticker: Cosmetic;
  isBoughtToday: boolean;
  hasEnoughCoins: boolean;
  onBuy: (stickerId: string) => void;
}

export interface CoinBalanceProps {
  coins: number;
  prevCoins?: number;
}
