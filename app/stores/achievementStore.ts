import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { zustandStorage } from "./mmkv";

interface AchievementStore {
  unlocked: Record<string, boolean>;
  unlock: (achievementId: string) => void;
  isUnlocked: (achievementId: string) => boolean;
}

const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      unlocked: {},
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
      }),
    }
  )
);

export default useAchievementStore;
