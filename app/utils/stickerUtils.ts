import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");
export const CARD_WIDTH = width * 0.8;
export const CARD_HEIGHT = CARD_WIDTH * 1.5;
export const STICKER_SIZE = 60;

export const getImageFromId = (id: string) => {
  const baseId = id.split("#")[0]; // Using # as separator for compound key
  const imageMap: { [key: string]: any } = {
    "session-surfer-100": require("@/assets/images/achievements/session-surfer-100.webp"),
    "streak-king-10": require("@/assets/images/achievements/streak-king-10.webp"),
  };
  return imageMap[baseId];
};
