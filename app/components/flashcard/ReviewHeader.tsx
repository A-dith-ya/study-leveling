import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import COLORS from "@/app/constants/colors";
import { ReviewHeaderProps } from "@/app/types/reviewTypes";

export default function ReviewHeader({
  currentIndex,
  totalCards,
  isReviewingMarked,
  shuffleMode,
  onToggleShuffle,
}: ReviewHeaderProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming((currentIndex + 1) / totalCards, {
      duration: 300,
    });
  }, [currentIndex, totalCards]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  return (
    <View style={styles.header}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {totalCards}
          {isReviewingMarked && " (Reviewing Marked)"}
        </Text>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, animatedStyle]} />
        </View>
      </View>
      <Pressable
        style={[styles.shuffleButton, shuffleMode && styles.shuffleActive]}
        onPress={onToggleShuffle}
      >
        <Ionicons
          name="shuffle"
          size={24}
          color={shuffleMode ? COLORS.white : COLORS.primary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  progressContainer: {
    flex: 1,
    marginRight: 16,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  progressBar: {
    height: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
  },
  shuffleButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  shuffleActive: {
    backgroundColor: COLORS.primary,
  },
});
