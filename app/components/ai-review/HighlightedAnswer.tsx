import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import HighlightedText from "./HighlightedText";
import COLORS from "../../constants/colors";

interface HighlightedAnswerProps {
  label: string;
  segments: Array<{
    text: string;
    type: "correct" | "incorrect" | "missing" | "none";
  }>;
}

export default function HighlightedAnswer({
  label,
  segments,
}: HighlightedAnswerProps) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.answerContent}>
        {segments.map((segment, index) => (
          <HighlightedText
            key={`${segment.text}-${index}`}
            text={segment.text}
            type={segment.type}
          />
        ))}
      </View>
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
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  answerContent: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
