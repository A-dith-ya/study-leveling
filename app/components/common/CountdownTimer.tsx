import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { getTimeUntilReset, formatResetTime } from "@/app/utils/challengeUtils";
import COLORS from "@/app/constants/colors";

interface CountdownTimerProps {
  title?: string;
  onReset?: () => void;
}

export default function CountdownTimer({
  title = "Next reset in:",
  onReset,
}: CountdownTimerProps) {
  const [resetTime, setResetTime] = useState({ hours: 0, minutes: 0 });

  // Animation values
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.6);
  const iconRotation = useSharedValue(0);

  useEffect(() => {
    const updateResetTime = () => {
      const { hours, minutes } = getTimeUntilReset();
      setResetTime({ hours, minutes });

      // Trigger callback when timer resets (both hours and minutes are 0)
      if (hours === 0 && minutes === 0 && onReset) {
        onReset();
      }
    };

    updateResetTime();
    const interval = setInterval(updateResetTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [onReset]);

  useEffect(() => {
    // Start subtle animations
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      true
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500 }),
        withTiming(0.4, { duration: 1500 })
      ),
      -1,
      true
    );

    iconRotation.value = withRepeat(
      withTiming(360, { duration: 20000 }),
      -1,
      false
    );
  }, []);

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: interpolate(glowOpacity.value, [0.4, 0.8], [0.1, 0.25]),
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${iconRotation.value}deg` }],
    };
  });

  // Calculate urgency (when less than 1 hour, show more urgency)
  const isUrgent = resetTime.hours === 0 && resetTime.minutes <= 60;
  const urgencyColor = isUrgent ? COLORS.secondary : COLORS.primary;

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <Animated.View
        style={[
          styles.timeContainer,
          glowAnimatedStyle,
          {
            backgroundColor: isUrgent
              ? COLORS.secondaryLight + "15"
              : COLORS.primaryLight + "15",
            borderColor: urgencyColor + "30",
          },
        ]}
      >
        <Animated.View style={iconAnimatedStyle}>
          <Ionicons name="time-outline" size={16} color={urgencyColor} />
        </Animated.View>

        <Text style={[styles.title, { color: urgencyColor }]}>{title}</Text>

        <Text style={[styles.timeText, { color: urgencyColor }]}>
          {formatResetTime(resetTime.hours, resetTime.minutes)}
        </Text>

        {isUrgent && (
          <View style={styles.urgencyBadge}>
            <Ionicons name="flash" size={10} color={COLORS.white} />
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 8,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  timeText: {
    fontSize: 16,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  urgencyBadge: {
    backgroundColor: COLORS.secondary,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
});
