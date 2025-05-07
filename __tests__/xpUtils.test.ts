import {
  calculateXPToNextLevel,
  calculateXPForSession,
  getLevelFromXP,
} from "../app/utils/xpUtils";

describe("calculateXPForSession", () => {
  test("should cap XP at 100", () => {
    expect(calculateXPForSession(100, 100)).toBe(100);
  });
});

describe("getLevelFromXP", () => {
  // Enough XP to level up
  test("should level up and deduct XP when accumulated XP is enough for next level", () => {
    const currentLevel = 1;
    const xpToNext = calculateXPToNextLevel(currentLevel);
    const accumulatedXP = xpToNext + 50; // More than enough XP to level up

    const result = getLevelFromXP(accumulatedXP, currentLevel);

    expect(result.level).toBe(currentLevel + 1);
    expect(result.xp).toBe(50); // Should deduct xpToNext from accumulatedXP
  });

  // Not enough XP to level up
  test("should maintain current level and XP when not enough XP for next level", () => {
    const currentLevel = 1;
    const xpToNext = calculateXPToNextLevel(currentLevel);
    const accumulatedXP = xpToNext - 10; // Less than required XP

    const result = getLevelFromXP(accumulatedXP, currentLevel);

    expect(result.level).toBe(currentLevel);
    expect(result.xp).toBe(accumulatedXP);
  });

  // Edge case: Exactly enough XP to level up
  test("should level up when XP exactly matches required amount", () => {
    const currentLevel = 1;
    const xpToNext = calculateXPToNextLevel(currentLevel);
    const accumulatedXP = xpToNext; // Exactly enough XP

    const result = getLevelFromXP(accumulatedXP, currentLevel);

    expect(result.level).toBe(currentLevel + 1);
    expect(result.xp).toBe(0); // Should have 0 XP after leveling up
  });
});
