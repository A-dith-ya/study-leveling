// Helper for animating a number (like coins)
export const animateValue = (
  startValue: number,
  endValue: number,
  duration: number,
  callback: (value: number) => void
) => {
  let startTimestamp: number | null = null;
  const step = (timestamp: number) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const elapsed = timestamp - startTimestamp;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function - easeOutQuart for bouncy effect
    const easeProgress = 1 - Math.pow(1 - progress, 4);

    const currentValue = Math.floor(
      startValue + (endValue - startValue) * easeProgress
    );
    callback(currentValue);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};
