export const updateStreak = (updatedAt: Date, currentStreak: number) => {
  const now = new Date();
  const lastUpdate = new Date(updatedAt);

  // Reset hours to compare dates only
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastUpdateDate = new Date(
    lastUpdate.getFullYear(),
    lastUpdate.getMonth(),
    lastUpdate.getDate()
  );

  // Calculate difference in days
  const diffTime = today.getTime() - lastUpdateDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Same day, return current streak
    return currentStreak;
  } else if (diffDays === 1) {
    // Yesterday, increment streak
    return currentStreak + 1;
  } else {
    // More than a day ago, reset streak to 1
    return 1;
  }
};

// Format duration into minutes and seconds
export const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes} min ${remainingSeconds} sec`;
};

// Format duration into hours and minutes
export const formatDurationToHoursAndMinutes = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const getElapsedSeconds = (start: number): number =>
  Math.floor((Date.now() - start) / 1000);
