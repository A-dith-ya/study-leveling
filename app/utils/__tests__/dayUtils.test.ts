import { updateStreak } from "@/app/utils/dayUtils";

// Rule 1: If updatedAt is today
// Rule 2: If updatedAt is yesterday
// Rule 3: If updatedAt is more than one day ago
// ┌────────────┬────────┬────────┬────────┐
// │ Condition  │ Rule 1 │ Rule 2 │ Rule 3 │
// ├────────────┼────────┼────────┼────────┤
// │ diffDays   │   0    │   1    │    2   │
// ├────────────┼────────┼────────┼────────┤
// │ Streak     │   T    │        │        │
// │ Streak++   │        │   T    │        │
// │   1        │        │        │   T    │
// └────────────┴────────┴────────┴────────┘
describe("updateStreak", () => {
  // Rule 1: Same day update
  test("should maintain current streak when updated on the same day", () => {
    const today = new Date();
    const currentStreak = 5;
    expect(updateStreak(today, currentStreak)).toBe(currentStreak);
  });

  // Rule 2: Yesterday update
  test("should increment streak when updated yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const currentStreak = 5;
    expect(updateStreak(yesterday, currentStreak)).toBe(currentStreak + 1);
  });

  // Rule 3: More than one day ago
  test("should reset streak to 1 when updated more than one day ago", () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const currentStreak = 5;
    expect(updateStreak(twoDaysAgo, currentStreak)).toBe(1);
  });
});
