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
  onPress: () => void;
}

export interface CoinPackModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseSuccess: (coins: number) => void;
}

export interface CoinPackInfo {
  identifier: string;
  coinAmount: number;
  title: string;
}
