import React, { useState } from "react";
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

import LevelDisplay from "../components/gamification/LevelDisplay";
import StatCard from "../components/gamification/StatCard";
import AchievementModal from "../components/gamification/AchievementModal";
import { ACHIEVEMENTS, Achievement } from "../constants/achievements";
import useAchievementStore from "../stores/achievementStore";
import COLORS from "../constants/colors";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function UserStats() {
  // Animation values
  const statsScale = useSharedValue(0.8);
  const achievementsOpacity = useSharedValue(0);
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  React.useEffect(() => {
    // Animate stats cards
    statsScale.value = withSpring(1, { damping: 12 });
    // Animate achievements
    achievementsOpacity.value = withTiming(1, { duration: 800 });
  }, []);

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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Level and XP Progress */}
        <LevelDisplay
          level={5}
          nextLevel={6}
          currentXP={4000}
          targetXP={5050}
        />

        {/* Stats Grid */}
        <Animated.View style={[styles.statsGrid, statsStyle]}>
          <StatCard
            icon="fire"
            value="8"
            label="Day Streak"
            color={COLORS.secondary}
          />
          <StatCard icon="layer-group" value="540" label="Cards Reviewed" />
          <StatCard icon="clock" value="4h 30m" label="Study Time" />
          <StatCard
            icon="check-circle"
            value="75"
            label="Sessions"
            color={COLORS.secondary}
          />
        </Animated.View>

        {/* Achievements */}
        <Animated.View style={[styles.achievementsSection, achievementsStyle]}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {ACHIEVEMENTS.map((badge) => {
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
                    source={badge.image}
                    style={[
                      styles.achievementImage,
                      !isUnlocked && styles.lockedImage,
                    ]}
                    resizeMode="contain"
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
