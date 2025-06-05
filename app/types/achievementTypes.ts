export interface Achievement {
  id: string;
  title: string;
  description: string;
  image: any;
}

export interface AchievementTier {
  readonly id: string;
  readonly threshold: number;
  readonly type:
    | "flashcards"
    | "streak"
    | "sessions"
    | "time"
    | "challenges"
    | "night-owl"
    | "customizer";
}

// UserStats component
export interface LevelProgressProps {
  level: number;
  nextLevel: number;
  currentXP: number;
  targetXP: number;
}

export interface StatCardProps {
  icon: string;
  value: string;
  label: string;
  color?: string;
}

export interface AchievementModalProps {
  achievement: Achievement | null;
  visible: boolean;
  onClose: () => void;
}
