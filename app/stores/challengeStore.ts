import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { zustandStorage } from "./mmkv";
import { Challenge, CHALLENGES } from "../constants/challenges";
import { logger } from "../utils/logger";
import dayjs from "dayjs";

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
    }),
    {
      name: "challenge-storage5",
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        dailyChallenges: state.dailyChallenges,
        hasInitialized: state.hasInitialized,
      }),
    }
  )
);

export default useChallengeStore;
