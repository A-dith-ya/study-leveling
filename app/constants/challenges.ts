export type ChestType = "bronze" | "silver" | "gold";

export interface Challenge {
  id: string;
  title: string;
  coinReward: number;
  xpReward: number;
  target: number;
  chestType: ChestType;
}

export const CHALLENGES: Challenge[] = [
  {
    id: "reward-10",
    title: "Study 10 Flashcards",
    target: 10,
    coinReward: 2,
    xpReward: 10,
    chestType: "bronze",
  },
  {
    id: "reward-20",
    title: "Study 20 Flashcards",
    target: 20,
    coinReward: 5,
    xpReward: 25,
    chestType: "silver",
  },
  {
    id: "reward-30",
    title: "Study 30 Flashcards",
    target: 30,
    coinReward: 10,
    xpReward: 50,
    chestType: "gold",
  },
  {
    id: "session-1",
    title: "Complete 1 Study Session",
    coinReward: 2,
    xpReward: 10,
    target: 1,
    chestType: "bronze",
  },
  {
    id: "session-3",
    title: "Complete 3 Study Sessions",
    coinReward: 5,
    xpReward: 25,
    target: 3,
    chestType: "silver",
  },
  {
    id: "session-5",
    title: "Complete 5 Study Sessions",
    coinReward: 10,
    xpReward: 50,
    target: 5,
    chestType: "gold",
  },
];
