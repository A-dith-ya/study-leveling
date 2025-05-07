export const calculateXPToNextLevel = (level: number): number => {
  const baseXP = 100;
  const exponent = 1.3;
  return Math.round(baseXP * Math.pow(level, exponent));
};

export const calculateXPForSession = (
  totalCards: number,
  duration: number
): number => {
  const xpPerCard = 1.2;
  const xpPerMinute = 2;

  const cardXP = totalCards * xpPerCard;
  const timeXP = (duration / 60) * xpPerMinute;

  return Math.min(Math.round(cardXP + timeXP), 100);
};

export const getLevelFromXP = (
  accumulatedXP: number,
  currentLevel: number
): { level: number; xp: number } => {
  const xpToNext = calculateXPToNextLevel(currentLevel);

  if (accumulatedXP >= xpToNext) {
    return {
      level: currentLevel + 1,
      xp: accumulatedXP - xpToNext,
    };
  }

  return {
    level: currentLevel,
    xp: accumulatedXP,
  };
};
