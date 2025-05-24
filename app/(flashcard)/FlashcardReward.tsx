import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  useSharedValue,
  interpolate,
} from "react-native-reanimated";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import { CommonActions } from "@react-navigation/native";

import COLORS from "@/app/constants/colors";
import { useUserData, useUpdateUserSessionStats } from "@/app/hooks/useUser";
import { getLevelFromXP } from "@/app/utils/xpUtils";
import { updateStreak, formatDuration } from "@/app/utils/dayUtils";
import {
  updateFlashcardChallenges,
  updateSessionChallenges,
} from "@/app/utils/challengeUtils";

const { width } = Dimensions.get("window");

export default function FlashcardReward() {
  const { totalCards, duration, xpEarned, deckId } = useLocalSearchParams();
  const { data: userData } = useUserData();
  const updateStats = useUpdateUserSessionStats();
  const navigation = useNavigation();

  // Animation values
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const statsStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: interpolate(translateY.value, [50, 0], [0, 1]),
    };
  });

  useEffect(() => {
    // Entrance animations
    scale.value = withSpring(1, { damping: 12 });
    opacity.value = withTiming(1, { duration: 600 });
    translateY.value = withSequence(withTiming(0, { duration: 800 }));

    if (userData) {
      const { level, xp } = getLevelFromXP(
        (userData.xp ?? 0) + Number(xpEarned),
        userData.level ?? 1
      );

      // Update user stats
      updateStats.mutate({
        xp,
        level,
        streak: updateStreak(
          new Date(userData.updatedAt),
          userData.streak ?? 0
        ),
        timeSpent: (userData.timeSpent ?? 0) + Number(duration),
        totalCardsReviewed:
          (userData.totalCardsReviewed ?? 0) + Number(totalCards),
        totalSessionsCompleted: (userData.totalSessionsCompleted ?? 0) + 1,
      });

      // Update challenge progress
      updateFlashcardChallenges(Number(totalCards));
      updateSessionChallenges(1);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.card, containerStyle]}>
        <View style={styles.header}>
          <Text style={styles.title}>Great Job!</Text>
          <Text style={styles.subtitle}>Session summary</Text>
          <Animated.Text style={[styles.xpText]}>+{xpEarned} XP</Animated.Text>
        </View>

        <Animated.View style={[styles.statsContainer, statsStyle]}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Time Spent</Text>
            <Text style={styles.statValue}>
              {formatDuration(Number(duration))}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Cards Reviewed</Text>
            <Text style={styles.statValue}>{totalCards}</Text>
          </View>
        </Animated.View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => {
              router.replace("/(amain)");
            }}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Back to Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => {
              // router.replace and useEffect don't fully reset the screen state
              // Use navigation to force unmount and fresh mount of the previous screen
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: "FlashcardReview", params: { deckId } }],
                })
              );
            }}
            accessibilityRole="button"
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Retry Deck
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    width: width - 40,
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  xpText: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.secondary,
    marginVertical: 16,
  },
  statsContainer: {
    marginBottom: 32,
  },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  statLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
  },
  secondaryButtonText: {
    color: COLORS.secondary,
  },
});
