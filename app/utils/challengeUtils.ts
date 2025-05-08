import { ChestType } from "../constants/challenges";

export const getChestImage = (type: ChestType) => {
  switch (type) {
    case "gold":
      return require("../../assets/images/challenges/gold-chest.webp");
    case "silver":
      return require("../../assets/images/challenges/silver-chest.webp");
    default:
      return require("../../assets/images/challenges/bronze-chest.webp");
  }
};

export const getChestStyle = (type: ChestType) => {
  switch (type) {
    case "bronze":
      return { backgroundColor: "#F3E1D4" };
    case "silver":
      return { backgroundColor: "#E0E8F0" };
    case "gold":
      return { backgroundColor: "#FEF2D8", transform: [{ scaleX: -1 }] };
  }
};
