import { Dimensions } from "react-native";
import {
  STICKER_SIZE,
  getImageFromId,
  formatTitle,
} from "@/app/utils/stickerUtils";

// Mock React Native Dimensions
jest.mock("react-native", () => ({
  Dimensions: {
    get: jest.fn().mockReturnValue({ width: 400, height: 800 }),
  },
}));

// Mock the cosmetics constants
jest.mock("@/app/constants/cosmetics", () => ({
  COSMETICS: [
    {
      id: "star-explorer",
      category: "STICKER",
      price: 100,
      image: "mocked-star-explorer-image",
    },
    {
      id: "rocket-blast",
      category: "STICKER",
      price: 300,
      image: "mocked-rocket-blast-image",
    },
    {
      id: "double-helix",
      category: "STICKER",
      price: 300,
      image: "mocked-double-helix-image",
    },
  ],
}));

describe("stickerUtils", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe("Constants", () => {
    test("CARD_WIDTH should be 80% of screen width", () => {
      const mockWidth = 400;
      (Dimensions.get as jest.Mock).mockReturnValue({
        width: mockWidth,
        height: 800,
      });

      // Re-import to get updated constants
      jest.resetModules();
      const { CARD_WIDTH } = require("@/app/utils/stickerUtils");

      expect(CARD_WIDTH).toBe(mockWidth * 0.8);
      expect(CARD_WIDTH).toBe(320);
    });

    test("CARD_HEIGHT should be 1.5 times CARD_WIDTH", () => {
      const mockWidth = 400;
      (Dimensions.get as jest.Mock).mockReturnValue({
        width: mockWidth,
        height: 800,
      });

      jest.resetModules();
      const { CARD_WIDTH, CARD_HEIGHT } = require("@/app/utils/stickerUtils");

      expect(CARD_HEIGHT).toBe(CARD_WIDTH * 1.5);
      expect(CARD_HEIGHT).toBe(480);
    });

    test("STICKER_SIZE should be 60", () => {
      expect(STICKER_SIZE).toBe(60);
    });
  });

  describe("getImageFromId", () => {
    test("should return image for valid cosmetic ID", () => {
      const result = getImageFromId("star-explorer");
      expect(result).toBe("mocked-star-explorer-image");
    });

    test("should return image for compound ID (with # separator)", () => {
      const result = getImageFromId("rocket-blast#variant1");
      expect(result).toBe("mocked-rocket-blast-image");
    });

    test("should return image for compound ID with multiple # separators", () => {
      const result = getImageFromId("double-helix#variant1#special");
      expect(result).toBe("mocked-double-helix-image");
    });

    test("should return undefined for non-existent cosmetic ID", () => {
      const result = getImageFromId("non-existent-id");
      expect(result).toBeUndefined();
    });

    test("should return undefined for non-existent compound ID", () => {
      const result = getImageFromId("non-existent-id#variant1");
      expect(result).toBeUndefined();
    });

    test("should handle empty string input", () => {
      const result = getImageFromId("");
      expect(result).toBeUndefined();
    });

    test("should handle ID that is only # separator", () => {
      const result = getImageFromId("#");
      expect(result).toBeUndefined();
    });

    test("should handle ID that starts with # separator", () => {
      const result = getImageFromId("#star-explorer");
      expect(result).toBeUndefined();
    });

    test("should handle ID that ends with # separator", () => {
      const result = getImageFromId("star-explorer#");
      expect(result).toBe("mocked-star-explorer-image");
    });

    test("should be case sensitive", () => {
      const result = getImageFromId("STAR-EXPLORER");
      expect(result).toBeUndefined();
    });
  });

  describe("formatTitle", () => {
    test("should format single word", () => {
      const result = formatTitle("hello");
      expect(result).toBe("Hello");
    });

    test("should format hyphenated words", () => {
      const result = formatTitle("star-explorer");
      expect(result).toBe("Star Explorer");
    });

    test("should format multiple hyphenated words", () => {
      const result = formatTitle("super-cool-rocket-blast");
      expect(result).toBe("Super Cool Rocket Blast");
    });

    test("should handle empty string", () => {
      const result = formatTitle("");
      expect(result).toBe("");
    });

    test("should handle single character", () => {
      const result = formatTitle("a");
      expect(result).toBe("A");
    });

    test("should handle single hyphen", () => {
      const result = formatTitle("-");
      expect(result).toBe(" ");
    });

    test("should handle string starting with hyphen", () => {
      const result = formatTitle("-hello");
      expect(result).toBe(" Hello");
    });

    test("should handle string ending with hyphen", () => {
      const result = formatTitle("hello-");
      expect(result).toBe("Hello ");
    });

    test("should handle multiple consecutive hyphens", () => {
      const result = formatTitle("hello--world");
      expect(result).toBe("Hello  World");
    });

    test("should handle mixed case input", () => {
      const result = formatTitle("hELLo-WoRLD");
      expect(result).toBe("HELLo WoRLD");
    });

    test("should handle numbers in input", () => {
      const result = formatTitle("item-123-special");
      expect(result).toBe("Item 123 Special");
    });

    test("should handle special characters (non-hyphen)", () => {
      const result = formatTitle("hello_world-test");
      expect(result).toBe("Hello_world Test");
    });

    test("should preserve whitespace within parts", () => {
      const result = formatTitle("hello world-test item");
      expect(result).toBe("Hello world Test item");
    });
  });
});
