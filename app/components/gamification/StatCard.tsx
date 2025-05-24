import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import COLORS from "@/app/constants/colors";
import { StatCardProps } from "@/app/types/achievementTypes";

export default function StatCard({
  icon,
  value,
  label,
  color = COLORS.primary,
}: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <FontAwesome6 name={icon} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    minWidth: (Dimensions.get("window").width - 48) / 2,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
});
