import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import COLORS from "../../constants/colors";

interface DashboardHeaderProps {
  level: number;
  currentXP: number;
  requiredXP: number;
  streakCount: number;
  coins: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  level,
  currentXP,
  requiredXP,
  streakCount,
  coins,
}) => {
  const progress = (currentXP / requiredXP) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.levelContainer}>
        <Text style={styles.levelText}>Level {level}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <FontAwesome6 name="fire" size={40} color={COLORS.secondaryLight} />
            <Text style={styles.statText}>{streakCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Image
              source={require("../../../assets/images/coin.webp")}
              style={styles.coinImage}
            />
            <Text style={styles.statText}>{coins}</Text>
          </View>
        </View>
      </View>

      <View style={styles.progressBackground}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
        <Text style={styles.xpText}>
          {currentXP} / {requiredXP} XP
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryDark,
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
    margin: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  levelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  levelText: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.white,
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
    borderWidth: 1,
    padding: 8,
    borderRadius: 16,
  },
  progressBackground: {
    height: 32,
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.success,
    borderRadius: 16,
  },
  xpText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    position: "absolute",
    left: 0,
    right: 0,
    top: 5,
    textAlignVertical: "center",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: "bold",
  },
  coinImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginRight: -8,
  },
});

export default DashboardHeader;
