import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  useSharedValue,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

import LevelDisplay from "@/app/components/gamification/LevelDisplay";
import StatCard from "@/app/components/gamification/StatCard";
import AchievementModal from "@/app/components/gamification/AchievementModal";
import LoadingScreen from "@/app/components/common/LoadingScreen";
import useAchievementStore from "@/app/stores/achievementStore";
import useUserStore from "@/app/stores/userStore";
import { useUserData } from "@/app/hooks/useUser";
import { calculateXPToNextLevel } from "@/app/utils/xpUtils";
import { formatDurationToHoursAndMinutes } from "@/app/utils/dayUtils";
import { ACHIEVEMENTS } from "@/app/constants/achievements";
import { evaluateAchievements } from "@/app/utils/achievementUtils";
import { logger } from "@/app/utils/logger";
import COLORS from "@/app/constants/colors";
import { Achievement } from "@/app/types/achievementTypes";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function UserStats() {
  const { data: userData, isLoading } = useUserData();
  const user = useUserStore((state) => state.user);

  // Animation values
  const statsScale = useSharedValue(0.8);
  const achievementsOpacity = useSharedValue(0);
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Animate stats cards
    statsScale.value = withSpring(1, { damping: 12 });
    // Animate achievements
    achievementsOpacity.value = withTiming(1, { duration: 800 });

    // Check for achievements when screen loads
    if (userData && user?.id) {
      evaluateAchievements(
        user.id,
        userData.totalCardsReviewed || 0,
        userData.streak || 0,
        userData.totalSessionsCompleted || 0,
        userData.timeSpent || 0
      ).catch((error: Error) =>
        logger.error("Failed to evaluate achievements", error)
      );
    }
  }, [userData, user?.id]);

  const statsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: statsScale.value }],
    opacity: interpolate(
      statsScale.value,
      [0.8, 1],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const achievementsStyle = useAnimatedStyle(() => ({
    opacity: achievementsOpacity.value,
    transform: [
      {
        translateY: interpolate(
          achievementsOpacity.value,
          [0, 1],
          [20, 0],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const handleBadgePress = (badge: Achievement) => {
    setSelectedAchievement(badge);
    setModalVisible(true);
  };

  const sortedAchievements = React.useMemo(() => {
    return [...ACHIEVEMENTS].sort((a, b) => {
      const aUnlocked = useAchievementStore.getState().isUnlocked(a.id);
      const bUnlocked = useAchievementStore.getState().isUnlocked(b.id);
      return bUnlocked === aUnlocked ? 0 : bUnlocked ? 1 : -1;
    });
  }, []);

  if (isLoading) return <LoadingScreen message="Loading stats..." />;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Your Progress</Text>
        {/* Level and XP Progress */}
        <LevelDisplay
          level={userData?.level || 1}
          nextLevel={(userData?.level || 1) + 1}
          currentXP={userData?.xp || 0}
          targetXP={calculateXPToNextLevel(userData?.level || 1)}
        />

        {/* Stats Grid */}
        <Animated.View style={[styles.statsGrid, statsStyle]}>
          <StatCard
            icon="fire"
            value={(userData?.streak || 0).toString()}
            label="Day Streak"
            color={COLORS.secondary}
          />
          <StatCard
            icon="layer-group"
            value={(userData?.totalCardsReviewed || 0).toString()}
            label="Cards Reviewed"
          />
          <StatCard
            icon="clock"
            value={formatDurationToHoursAndMinutes(userData?.timeSpent || 0)}
            label="Study Time"
          />
          <StatCard
            icon="check-circle"
            value={(userData?.totalSessionsCompleted || 0).toString()}
            label="Sessions"
            color={COLORS.secondary}
          />
        </Animated.View>

        {/* Achievements */}
        <Animated.View style={[styles.achievementsSection, achievementsStyle]}>
          <Text style={styles.sectionTitle}>Unlocked Badges</Text>
          <View style={styles.achievementsGrid}>
            {sortedAchievements.map((badge) => {
              const scale = useSharedValue(1);
              const isUnlocked = useAchievementStore((state) =>
                state.isUnlocked(badge.id)
              );

              const animatedStyle = useAnimatedStyle(() => ({
                transform: [{ scale: scale.value }],
              }));

              const handlePress = () => {
                scale.value = withSequence(
                  withTiming(0.9, { duration: 100 }),
                  withSpring(1, { damping: 12 })
                );
                handleBadgePress(badge);
              };

              return (
                <AnimatedPressable
                  key={badge.id}
                  style={[animatedStyle]}
                  onPress={handlePress}
                >
                  <Image
                    key={
                      isUnlocked ? `${badge.id}-unlocked` : `${badge.id}-locked`
                    }
                    source={badge.image}
                    style={[
                      styles.achievementImage,
                      !isUnlocked && styles.lockedImage,
                    ]}
                    resizeMode="contain"
                    accessibilityLabel="Achievement Badge"
                  />
                </AnimatedPressable>
              );
            })}
          </View>
        </Animated.View>

        <AchievementModal
          achievement={selectedAchievement}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  achievementsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 16,
  },
  achievementImage: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  lockedImage: {
    opacity: 0.5,
    tintColor: COLORS.darkGray,
  },
});
