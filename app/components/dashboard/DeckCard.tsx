import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";

import COLORS from "@/app/constants/colors";
import { DeckCardProps } from "@/app/types/homeTypes";

export default function DeckCard({
  title,
  cardCount,
  onEdit,
  onPractice,
  onAIReview,
}: DeckCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.cardBadge}>
            <FontAwesome6 name="layer-group" size={12} color={COLORS.primary} />
            <Text style={styles.cardCount}>{cardCount} cards</Text>
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.practiceButton]}
            onPress={onPractice}
            accessibilityRole="button"
            accessibilityLabel="Practice deck"
          >
            <FontAwesome6 name="play" size={16} color={COLORS.white} />
            <Text style={styles.buttonText}>Practice</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.reviewButton]}
            onPress={onAIReview}
            accessibilityRole="button"
            accessibilityLabel="AI review"
          >
            <FontAwesome6 name="robot" size={16} color={COLORS.white} />
            <Text style={styles.buttonText}>AI Review</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel="Edit deck"
          >
            <FontAwesome6 name="pen" size={16} color={COLORS.white} />
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    padding: 12,
    marginHorizontal: 16,
    borderColor: COLORS.black,
    borderWidth: 0.2,
  },
  header: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    lineHeight: 24,
    flex: 1,
  },
  cardBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  cardCount: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  editButton: {
    backgroundColor: COLORS.primaryDark,
  },
  practiceButton: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    gap: 8,
  },
  reviewButton: {
    backgroundColor: COLORS.primaryLight,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
