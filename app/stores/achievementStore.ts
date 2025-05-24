import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { zustandStorage } from "./mmkv";
import { getAchievementsByUserId } from "@/app/services/userService";
import { logger } from "@/app/utils/logger";

interface AchievementStore {
  unlocked: Record<string, boolean>;
  hasInitialized: boolean;
  fetchAchievements: (userId: string) => Promise<void>;
  unlock: (achievementId: string) => void;
  isUnlocked: (achievementId: string) => boolean;
}

const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      unlocked: {},
      hasInitialized: false,
      fetchAchievements: async (userId: string) => {
        const achievements = await getAchievementsByUserId(userId);
        logger.debug("Initializing achievements", achievements);
        achievements?.unlockedAchievements?.forEach((achievementId) => {
          if (achievementId) {
            get().unlock(achievementId);
          }
        });
        set({ hasInitialized: true });
      },
      unlock: (id: string) =>
        set((state) => ({
          unlocked: {
            ...state.unlocked,
            [id]: true,
          },
        })),
      isUnlocked: (id: string) => get().unlocked[id] || false,
      reset: () => set({ unlocked: {} }),
    }),
    {
      name: "achievement-storage",
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        unlocked: state.unlocked,
        hasInitialized: state.hasInitialized,
      }),
    }
  )
);

export default useAchievementStore;
