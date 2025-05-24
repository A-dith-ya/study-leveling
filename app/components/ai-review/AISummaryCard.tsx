import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import HighlightedAnswer from "./HighlightedAnswer";
import AIFeedback from "./AIFeedback";
import COLORS from "@/app/constants/colors";
import { AISummaryCardItem } from "@/app/types/reviewTypes";

export default function AISummaryCard({ item }: { item: AISummaryCardItem }) {
  return (
    <Animated.View entering={FadeInUp.delay(100)} style={styles.cardContainer}>
      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{item.question}</Text>
      </View>

      {/* User Answer */}
      {item.userAnswerSegments && item.userAnswerSegments.length > 0 && (
        <HighlightedAnswer
          label="Your Answer"
          segments={item.userAnswerSegments}
        />
      )}

      {/* Correct Answer */}
      {item.correctAnswerSegments && item.correctAnswerSegments.length > 0 && (
        <HighlightedAnswer
          label="Correct Answer"
          segments={item.correctAnswerSegments}
        />
      )}

      {/* AI Feedback */}
      {item.aiExplanation && <AIFeedback explanation={item.aiExplanation} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
  },
  questionContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
});
