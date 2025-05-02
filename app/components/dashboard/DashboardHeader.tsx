import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import COLORS from "../../constants/colors";

interface DashboardHeaderProps {
  level: number;
  currentXP: number;
  requiredXP: number;
  streakCount: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  level,
  currentXP,
  requiredXP,
  streakCount,
}) => {
  const progress = (currentXP / requiredXP) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.levelContainer}>
        <Text style={styles.levelText}>Level {level}</Text>
        <View style={styles.streakContainer}>
          <FontAwesome6 name="fire" size={40} color={COLORS.secondaryLight} />
          <Text style={styles.streakCountText}>{streakCount}</Text>
        </View>
      </View>

      <View style={styles.progressBackground}>
        <View style={[styles.progressFill, { width: `${progress}%` }]}>
          <Text style={styles.xpText}>
            {currentXP} / {requiredXP} XP
          </Text>
        </View>
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
    justifyContent: "center",
  },
  xpText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakCountText: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: "bold",
  },
});

export default DashboardHeader;
