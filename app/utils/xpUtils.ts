export const calculateXPToNextLevel = (level: number): number => {
  const baseXP = 100;
  const exponent = 1.3;
  return Math.round(baseXP * Math.pow(level, exponent));
};
