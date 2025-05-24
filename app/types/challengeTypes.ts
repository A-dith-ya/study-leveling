import { DailyChallenge } from "@/app/stores/challengeStore";

export type ChestType = "bronze" | "silver" | "gold";

export interface Challenge {
  id: string;
  title: string;
  coinReward: number;
  xpReward: number;
  target: number;
  chestType: ChestType;
}

// Challenge components
export interface ChallengeCardProps {
  challenge: DailyChallenge;
  onClaim: () => void;
}
