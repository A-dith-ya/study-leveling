import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { zustandStorage } from "@/app/stores/mmkv";
import dayjs from "dayjs";

import { CHALLENGES } from "@/app/constants/challenges";
import { Challenge } from "@/app/types/challengeTypes";
import { logger } from "@/app/utils/logger";

export interface DynamicChallengeData {
  progress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  lastUpdated: string;
}

export interface DailyChallenge extends Challenge, DynamicChallengeData {}

interface ChallengeStore {
  dailyChallenges: DailyChallenge[];
  hasInitialized: boolean;
  initializeDailyChallenges: () => void;
  updateProgress: (challengeId: string, progress: number) => void;
  claimReward: (challengeId: string) => void;
  shouldResetChallenges: () => boolean;
  reset: () => void;
}

const getRandomChallenges = (count: number): DailyChallenge[] => {
  const shuffled = [...CHALLENGES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((challenge) => ({
    ...challenge,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    lastUpdated: dayjs().toISOString(),
  }));
};

const useChallengeStore = create<ChallengeStore>()(
  persist(
    (set, get) => ({
      dailyChallenges: [],
      hasInitialized: false,

      initializeDailyChallenges: () => {
        logger.debug("Initializing daily challenges");
        set({
          dailyChallenges: getRandomChallenges(3),
          hasInitialized: true,
        });
      },

      updateProgress: (challengeId: string, progress: number) => {
        set((state) => ({
          dailyChallenges: state.dailyChallenges.map((challenge) =>
            challenge.id === challengeId
              ? {
                  ...challenge,
                  progress: Math.min(progress, challenge.target),
                  isCompleted: progress >= challenge.target,
                }
              : challenge
          ),
        }));
      },

      claimReward: (challengeId: string) => {
        set((state) => ({
          dailyChallenges: state.dailyChallenges.map((challenge) =>
            challenge.id === challengeId && challenge.isCompleted
              ? { ...challenge, isClaimed: true }
              : challenge
          ),
        }));
      },

      shouldResetChallenges: () => {
        const { dailyChallenges } = get();
        if (dailyChallenges.length === 0) return true;

        const lastUpdate = dayjs(dailyChallenges[0].lastUpdated);
        return !lastUpdate.isSame(dayjs(), "day");
      },

      reset: () => {
        set({
          dailyChallenges: [],
          hasInitialized: false,
        });
      },
    }),
    {
      name: "challenge-storage",
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        dailyChallenges: state.dailyChallenges,
        hasInitialized: state.hasInitialized,
      }),
    }
  )
);

export default useChallengeStore;
