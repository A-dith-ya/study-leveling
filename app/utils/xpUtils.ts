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
