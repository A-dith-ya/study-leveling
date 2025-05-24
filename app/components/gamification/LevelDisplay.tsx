// components/LevelProgress.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import COLORS from "@/app/constants/colors";
import { LevelProgressProps } from "@/app/types/achievementTypes";

export default function LevelProgress({
  level,
  nextLevel,
  currentXP,
  targetXP,
}: LevelProgressProps) {
  // Animation value
  const progressWidth = useSharedValue(0);
  const progressPercentage = currentXP / targetXP;

  useEffect(() => {
    // Animate progress bar
    progressWidth.value = withTiming(progressPercentage, { duration: 1000 });
  }, []);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  return (
    <View style={styles.levelContainer}>
      <View style={styles.levelHeader}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelNumber}>{level}</Text>
        </View>
        <View style={styles.levelInfo}>
          <Text style={styles.currentLevel}>Level {level}</Text>
          <View style={styles.progressContainer}>
            <Animated.View style={[styles.progressBar, progressBarStyle]} />
          </View>
          <View style={styles.levelDetails}>
            <Text style={styles.nextLevel}>Level {nextLevel}</Text>
            <Text style={styles.xpText}>
              {currentXP} / {targetXP} XP
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  levelContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  levelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  levelBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryDark,
    justifyContent: "center",
    alignItems: "center",
  },
  levelNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.white,
  },
  levelInfo: {
    flex: 1,
  },
  currentLevel: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  progressContainer: {
    height: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 4,
  },
  levelDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextLevel: {
    fontSize: 16,
    color: COLORS.text,
  },
  xpText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "600",
  },
});
