import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSequence,
  useSharedValue,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import HighlightedAnswer from "../components/ai-review/HighlightedAnswer";
import MicButton from "../components/ai-review/MicButton";
import AIFeedback from "../components/ai-review/AIFeedback";
import COLORS from "../constants/colors";

type DotStyleKey = "correctDot" | "incorrectDot" | "missingDot";

type AnswerSegment = {
  text: string;
  type: "correct" | "incorrect" | "missing" | "none";
};

const LegendItem = ({
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

export default function AIReview() {
  const [userInput, setUserInput] = useState("");
  const [isEvaluated, setIsEvaluated] = useState(false);
  const submitScale = useSharedValue(1);

  const handleSubmit = async () => {
    submitScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    setIsEvaluated(!isEvaluated);
  };

  const handleNextQuestion = () => {
    router.push("/(amain)/AIReview?questionId=next");
  };

  const handlePreviousQuestion = () => {
    router.push("/(amain)/AIReview?questionId=previous");
  };

  const submitButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: submitScale.value }],
  }));

  // Example data
  const question = "";
  const aiExplanation = "";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Question Section */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionLabel}>Question</Text>
        <Text style={styles.questionText}>{question}</Text>
      </View>

      {/* Legend Bar */}
      <View style={styles.legendBar}>
        <LegendItem type="correct" label="Correct" />
        <LegendItem type="incorrect" label="Incorrect" />
        <LegendItem type="missing" label="Missing" />
      </View>

      {/* Answer Input/Display Section */}
      {!isEvaluated && (
        <View style={styles.answerContainer}>
          <Text style={styles.sectionLabel}>Your Answer</Text>
          <TextInput
            style={styles.answerInput}
            value={userInput}
            onChangeText={setUserInput}
            multiline
            placeholder="Type your answer here..."
            placeholderTextColor={COLORS.darkGray}
          />
        </View>
      )}

      {/* Correct Answer Section (shown after evaluation) */}
      {isEvaluated && <></>}

      {/* Mic Button */}
      {!isEvaluated && <MicButton />}

      {/* AI Feedback Section */}
      {isEvaluated && <AIFeedback explanation={aiExplanation} />}

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable style={styles.navButton} onPress={handlePreviousQuestion}>
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </Pressable>
        <Animated.View style={[submitButtonStyle]}>
          <Pressable style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>
              {!isEvaluated ? "Submit" : "Try Again"}
            </Text>
          </Pressable>
        </Animated.View>
        <Pressable style={styles.navButton} onPress={handleNextQuestion}>
          <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  questionContainer: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  questionLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  legendBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
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
  answerContainer: {
    flex: 1,
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
  answerInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
    textAlignVertical: "top",
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  answerScrollView: {
    flex: 1,
  },
  answerContent: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  correctAnswerContainer: {
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
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
