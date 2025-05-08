import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  useSharedValue,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import COLORS from "../../constants/colors";
import { getChestImage, getChestStyle } from "../../utils/challengeUtils";
import { Challenge } from "../../constants/challenges";

interface ChallengeCardProps {
  challenge: Challenge;
  onClaim: () => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onClaim,
}) => {
  const buttonScale = useSharedValue(1);
  const cardScale = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleClaim = () => {
    buttonScale.value = withSequence(withSpring(1.1), withSpring(1));
    cardScale.value = withSequence(withSpring(1.02), withSpring(1));
    onClaim();
  };

  const progress = (challenge.progress / challenge.target) * 100;

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      <View style={styles.cardContent}>
        <Image
          source={getChestImage(challenge.chestType)}
          style={[styles.chestImage, getChestStyle(challenge.chestType)]}
        />
        <View style={styles.challengeInfo}>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <View style={styles.rewardsContainer}>
            <View style={styles.reward}>
              <Image
                source={require("../../../assets/images/coin.webp")}
                style={styles.coinIcon}
              />
              <Text style={styles.rewardText}>+{challenge.coinReward}</Text>
            </View>
            <Text style={styles.rewardText}>+{challenge.xpReward} XP</Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {challenge.progress}/{challenge.target}
            </Text>
          </View>
          {challenge.isCompleted && !challenge.isClaimed && (
            <Animated.View style={buttonStyle}>
              <Pressable style={styles.claimButton} onPress={handleClaim}>
                <Text style={styles.claimButtonText}>Claim</Text>
              </Pressable>
            </Animated.View>
          )}
          {challenge.isClaimed && (
            <Ionicons
              name="checkmark-circle"
              size={28}
              style={{ alignSelf: "center", marginTop: 8 }}
              color={COLORS.success}
            />
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    flexDirection: "row",
    gap: 16,
  },
  chestImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    borderRadius: 16,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  rewardsContainer: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  reward: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  coinIcon: {
    width: 35,
    height: 35,
    resizeMode: "contain",
  },
  rewardText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.lightGray,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "right",
  },
  claimButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 8,
  },
  claimButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ChallengeCard;
