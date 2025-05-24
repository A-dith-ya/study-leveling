import React from "react";
import { Text, ScrollView, StyleSheet } from "react-native";
import COLORS from "@/app/constants/colors";
import { HighlightedAnswerProps } from "@/app/types/reviewTypes";

export default function HighlightedAnswer({
  label,
  segments,
}: HighlightedAnswerProps) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Text>
        {segments.map((segment, index) => (
          <Text
            key={`${segment.text}-${index}`}
            style={[styles.highlightedText, styles[`${segment.type}Text`]]}
          >
            {segment.text}
          </Text>
        ))}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 200,
    flexGrow: 0,
    flexShrink: 1,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  highlightedText: {
    fontSize: 16,
    lineHeight: 24,
  },
  correctText: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    color: "#4CAF50",
  },
  incorrectText: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    color: "#F44336",
  },
  missingText: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    color: "#FFC107",
  },
  noneText: {
    color: COLORS.text,
  },
});
