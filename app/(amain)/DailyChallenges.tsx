import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ChallengeCard from "../components/challenges/ChallengeCard";
import useChallengeStore from "../stores/challengeStore";
import { getTimeUntilReset, formatResetTime } from "../utils/challengeUtils";
import COLORS from "../constants/colors";

export default function DailyChallenges() {
  const { dailyChallenges, claimReward } = useChallengeStore();
  const [resetTime, setResetTime] = React.useState({ hours: 0, minutes: 0 });

  useEffect(() => {
    const updateResetTime = () => {
      const { hours, minutes } = getTimeUntilReset();
      setResetTime({ hours, minutes });
    };

    updateResetTime();
    const interval = setInterval(updateResetTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Challenges</Text>
        <Text style={styles.resetTimer}>
          Next reset in: {formatResetTime(resetTime.hours, resetTime.minutes)}
        </Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {dailyChallenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onClaim={() => claimReward(challenge.id)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  resetTimer: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
});
