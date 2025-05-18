import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import COLORS from "../../constants/colors";

interface AIFeedbackProps {
  explanation: string;
}

export default function AIFeedback({ explanation }: AIFeedbackProps) {
  return (
    <View style={styles.aiFeedbackContainer}>
      <Text style={styles.sectionLabel}>AI Feedback</Text>
      <View style={styles.feedbackContent}>
        <ScrollView
          style={styles.feedbackScrollView}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.feedbackText}>{explanation}</Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  aiFeedbackContainer: {
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
    minHeight: 150,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  feedbackContent: {
    flex: 1,
  },
  feedbackScrollView: {
    flex: 1,
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
  },
});
