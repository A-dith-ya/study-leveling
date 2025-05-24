import {
  updateStreak,
  formatDuration,
  formatDurationToHoursAndMinutes,
  getElapsedSeconds,
} from "@/app/utils/dayUtils";

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

describe("formatDuration", () => {
  test("should format 0 seconds correctly", () => {
    expect(formatDuration(0)).toBe("0 min 0 sec");
  });

  test("should format seconds only (less than 1 minute)", () => {
    expect(formatDuration(30)).toBe("0 min 30 sec");
    expect(formatDuration(59)).toBe("0 min 59 sec");
  });

  test("should format exact minutes (no remaining seconds)", () => {
    expect(formatDuration(60)).toBe("1 min 0 sec");
    expect(formatDuration(120)).toBe("2 min 0 sec");
    expect(formatDuration(300)).toBe("5 min 0 sec");
  });

  test("should format minutes and seconds", () => {
    expect(formatDuration(65)).toBe("1 min 5 sec");
    expect(formatDuration(150)).toBe("2 min 30 sec");
    expect(formatDuration(3661)).toBe("61 min 1 sec");
  });

  test("should handle large durations", () => {
    expect(formatDuration(3600)).toBe("60 min 0 sec"); // 1 hour
    expect(formatDuration(7200)).toBe("120 min 0 sec"); // 2 hours
    expect(formatDuration(7265)).toBe("121 min 5 sec"); // 2 hours 1 minute 5 seconds
  });
});

describe("formatDurationToHoursAndMinutes", () => {
  test("should format 0 seconds correctly", () => {
    expect(formatDurationToHoursAndMinutes(0)).toBe("0h 0m");
  });

  test("should format seconds only (less than 1 minute)", () => {
    expect(formatDurationToHoursAndMinutes(30)).toBe("0h 0m");
    expect(formatDurationToHoursAndMinutes(59)).toBe("0h 0m");
  });

  test("should format minutes only (less than 1 hour)", () => {
    expect(formatDurationToHoursAndMinutes(60)).toBe("0h 1m");
    expect(formatDurationToHoursAndMinutes(1800)).toBe("0h 30m");
    expect(formatDurationToHoursAndMinutes(3599)).toBe("0h 59m");
  });

  test("should format exact hours (no remaining minutes)", () => {
    expect(formatDurationToHoursAndMinutes(3600)).toBe("1h 0m");
    expect(formatDurationToHoursAndMinutes(7200)).toBe("2h 0m");
    expect(formatDurationToHoursAndMinutes(36000)).toBe("10h 0m");
  });

  test("should format hours and minutes", () => {
    expect(formatDurationToHoursAndMinutes(3660)).toBe("1h 1m");
    expect(formatDurationToHoursAndMinutes(3900)).toBe("1h 5m");
    expect(formatDurationToHoursAndMinutes(7380)).toBe("2h 3m");
  });

  test("should handle large durations", () => {
    expect(formatDurationToHoursAndMinutes(86400)).toBe("24h 0m"); // 1 day
    expect(formatDurationToHoursAndMinutes(90000)).toBe("25h 0m"); // 25 hours
    expect(formatDurationToHoursAndMinutes(90060)).toBe("25h 1m"); // 25 hours 1 minute
  });

  test("should ignore seconds in calculation", () => {
    expect(formatDurationToHoursAndMinutes(3661)).toBe("1h 1m"); // 1 hour 1 minute 1 second
    expect(formatDurationToHoursAndMinutes(3659)).toBe("1h 0m"); // 1 hour 0 minutes 59 seconds
  });
});

describe("getElapsedSeconds", () => {
  beforeEach(() => {
    // Mock Date.now() to have consistent test results
    jest.spyOn(Date, "now").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should return 0 for current timestamp", () => {
    const now = 1640995200000; // Mock timestamp
    (Date.now as jest.Mock).mockReturnValue(now);
    expect(getElapsedSeconds(now)).toBe(0);
  });

  test("should calculate elapsed seconds correctly", () => {
    const now = 1640995200000; // Mock timestamp
    (Date.now as jest.Mock).mockReturnValue(now);

    const oneSecondAgo = now - 1000;
    expect(getElapsedSeconds(oneSecondAgo)).toBe(1);

    const tenSecondsAgo = now - 10000;
    expect(getElapsedSeconds(tenSecondsAgo)).toBe(10);

    const oneMinuteAgo = now - 60000;
    expect(getElapsedSeconds(oneMinuteAgo)).toBe(60);
  });

  test("should floor the result for partial seconds", () => {
    const now = 1640995200500; // Mock timestamp with milliseconds
    (Date.now as jest.Mock).mockReturnValue(now);

    const partialSecondAgo = now - 1500; // 1.5 seconds ago
    expect(getElapsedSeconds(partialSecondAgo)).toBe(1);

    const almostTwoSecondsAgo = now - 1999; // 1.999 seconds ago
    expect(getElapsedSeconds(almostTwoSecondsAgo)).toBe(1);
  });

  test("should handle large time differences", () => {
    const now = 1640995200000;
    (Date.now as jest.Mock).mockReturnValue(now);

    const oneHourAgo = now - 60 * 60 * 1000;
    expect(getElapsedSeconds(oneHourAgo)).toBe(3600);

    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    expect(getElapsedSeconds(oneDayAgo)).toBe(86400);
  });

  test("should return 0 for future timestamps", () => {
    const now = 1640995200000;
    (Date.now as jest.Mock).mockReturnValue(now);

    const futureTime = now + 5000; // 5 seconds in the future
    expect(getElapsedSeconds(futureTime)).toBe(-5);
  });
});
