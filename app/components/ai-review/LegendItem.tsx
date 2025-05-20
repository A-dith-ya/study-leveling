import { View, Text, StyleSheet } from "react-native";
import COLORS from "@/app/constants/colors";

type DotStyleKey = "correctDot" | "incorrectDot" | "missingDot";

export const LegendItem = ({
  type,
  label,
}: {
  type: "correct" | "incorrect" | "missing";
  label: string;
}) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, styles[`${type}Dot` as DotStyleKey]]} />
    <Text style={styles.legendLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  correctDot: {
    backgroundColor: "#4CAF50",
  },
  incorrectDot: {
    backgroundColor: "#F44336",
  },
  missingDot: {
    backgroundColor: "#FFC107",
  },
  legendLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
});
