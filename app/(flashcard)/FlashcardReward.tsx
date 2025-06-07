import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Platform,
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
import { Ionicons } from "@expo/vector-icons";

import COLORS from "@/app/constants/colors";
import { useUserData, useUpdateUserSessionStats } from "@/app/hooks/useUser";
import { getLevelFromXP } from "@/app/utils/xpUtils";
import { updateStreak, formatDuration } from "@/app/utils/dayUtils";
import {
  updateFlashcardChallenges,
  updateSessionChallenges,
  updateTimeChallenges,
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
      updateTimeChallenges(Number(duration));
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.card, containerStyle]}>
        <View style={styles.header}>
          {/* Trophy icon for celebration */}
          <View style={styles.iconContainer}>
            <Ionicons name="trophy" size={48} color={COLORS.secondary} />
          </View>
          <Text style={styles.title}>Great Job!</Text>
          <Text style={styles.subtitle}>Session summary</Text>

          {/* XP badge with bolt icon */}
          <View style={styles.xpBadge}>
            <Ionicons name="flash" size={20} color={COLORS.white} />
            <Animated.Text style={[styles.xpText]}>
              +{xpEarned} XP
            </Animated.Text>
          </View>
        </View>

        <Animated.View style={[styles.statsContainer, statsStyle]}>
          <View style={styles.statItem}>
            <View style={styles.statLabelContainer}>
              <Ionicons name="time-outline" size={20} color={COLORS.primary} />
              <Text style={styles.statLabel}>Time Spent</Text>
            </View>
            <Text style={styles.statValue}>
              {formatDuration(Number(duration))}
            </Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statLabelContainer}>
              <Ionicons
                name="layers-outline"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.statLabel}>Cards Reviewed</Text>
            </View>
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
            <Ionicons name="home" size={20} color={COLORS.white} />
            <Text style={styles.buttonText}>Dashboard</Text>
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
            <Ionicons name="refresh" size={20} color={COLORS.secondary} />
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Practice Again
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
  iconContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 15,
    marginBottom: 16,
    shadowColor: COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    shadowColor: COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  xpText: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
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
  statLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderBottomWidth: Platform.OS === "ios" ? 2 : 0,
    borderBottomColor: COLORS.primaryDark,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondaryDark,
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
