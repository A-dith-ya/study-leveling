import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { zustandStorage } from "./mmkv";
import { logger } from "../utils/logger";
import { COSMETICS } from "../constants/cosmetics";
import { fisherYatesShuffle } from "../utils/flashcardUtils";

interface CosmeticStore {
  // Map of stickers bought today
  boughtToday: Record<string, boolean>;

  // Available stickers in store
  available: typeof COSMETICS;

  // Methods
  markAsBoughtToday: (cosmeticId: string) => void;
  isBoughtToday: (cosmeticId: string) => boolean;

  // Initial setup and reset
  initializeStore: () => void;
}

const useCosmeticStore = create<CosmeticStore>()(
  persist(
    (set, get) => ({
      boughtToday: {},
      available: fisherYatesShuffle(COSMETICS, 8),

      markAsBoughtToday: (cosmeticId: string) => {
        set((state) => ({
          boughtToday: {
            ...state.boughtToday,
            [cosmeticId]: true,
          },
        }));
        logger.debug(`Marked ${cosmeticId} as bought today`);
      },

      isBoughtToday: (cosmeticId: string) =>
        get().boughtToday[cosmeticId] || false,

      initializeStore: () => {
        logger.debug("Initializing cosmetic store");
        set({
          boughtToday: {},
          available: fisherYatesShuffle(COSMETICS, 8),
        });
      },
    }),
    {
      name: "cosmetic-store",
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        boughtToday: state.boughtToday,
      }),
    }
  )
);

export default useCosmeticStore;
