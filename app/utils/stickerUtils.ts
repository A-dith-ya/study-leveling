import { Dimensions } from "react-native";
import { COSMETICS } from "@/app/constants/cosmetics";

const { width } = Dimensions.get("window");
export const CARD_WIDTH = width * 0.8;
export const CARD_HEIGHT = CARD_WIDTH * 1.5;
export const STICKER_SIZE = 60;

export const getImageFromId = (id: string) => {
  const baseId = id.split("#")[0]; // Using # as separator for compound key
  const cosmetic = COSMETICS.find((c) => c.id === baseId);
  return cosmetic?.image;
};

export function formatTitle(input: string): string {
  return input
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
