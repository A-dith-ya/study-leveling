import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSequence,
  useSharedValue,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import HighlightedAnswer from "@/app/components/ai-review/HighlightedAnswer";
import { LegendItem } from "@/app/components/ai-review/LegendItem";
import MicButton from "@/app/components/ai-review/MicButton";
import AIFeedback from "@/app/components/ai-review/AIFeedback";
import LoadingScreen from "@/app/components/common/LoadingScreen";
import { useReviewStore } from "@/app/stores/reviewStore";
import { useAIReview } from "@/app/services/reviewService";
import {
  sanitizeInput,
  createUserAnswerSegments,
  createCorrectAnswerSegments,
} from "@/app/utils/reviewUtils";
import { useDeck } from "@/app/hooks/useDeck";
import COLORS from "@/app/constants/colors";
import { logger } from "@/app/utils/logger";

export default function AIReview() {
  const [userInput, setUserInput] = useState("");
  const [isEvaluated, setIsEvaluated] = useState(false);
  const submitScale = useSharedValue(1);
  const { deckId: routeDeckId } = useLocalSearchParams();

  const {
    initReview,
    deckId,
    currentFlashcardIndex,
    userAnswers,
    evaluations,
    setUserAnswer,
    setEvaluation,
    hasEvaluation,
    goToNextCard,
    goToPreviousCard,
  } = useReviewStore();

  const { data: deckData, isLoading } = useDeck(deckId as string);
  const aiReview = useAIReview();

  const handleSubmit = async () => {
    submitScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    if (isEvaluated) {
      setIsEvaluated(false);
      return;
    }

    const sanitizedUserInput = sanitizeInput(userInput);
    if (!question || !correctAnswer || !sanitizedUserInput) {
      return;
    }

    try {
      const response = await aiReview.mutateAsync({
        question: question,
        correctAnswer: correctAnswer,
        userAnswer: sanitizedUserInput,
      });

      setEvaluation(deckData?.flashcards?.[currentFlashcardIndex].flashcardId, {
        userAnswerSegments: createUserAnswerSegments(
          sanitizedUserInput,
          response
        ),
        correctAnswerSegments: createCorrectAnswerSegments(
          correctAnswer,
          response
        ),
        aiExplanation: response.aiExplanation,
      });

      setIsEvaluated(true);
    } catch (error) {}
  };

  const handleNextQuestion = () => {
    if (
      deckData?.flashcards?.length &&
      currentFlashcardIndex === deckData?.flashcards?.length - 1
    ) {
      router.push("/(flashcard)/AISummary");
      return;
    }

    const flashcardId =
      deckData?.flashcards?.[currentFlashcardIndex].flashcardId;

    if (flashcardId) {
      setUserAnswer(flashcardId, userInput);
    }
    goToNextCard();
    router.push("/(flashcard)/AIReview");
    logger.logDivider();
  };

  const handlePreviousQuestion = () => {
    const flashcardId =
      deckData?.flashcards?.[currentFlashcardIndex].flashcardId;

    if (flashcardId) {
      setUserAnswer(flashcardId, userInput);
    }
    goToPreviousCard();
    router.push("/(flashcard)/AIReview");
    logger.logDivider();
  };

  const submitButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: submitScale.value }],
  }));

  const question = deckData?.flashcards?.[currentFlashcardIndex]?.front;
  const correctAnswer = deckData?.flashcards?.[currentFlashcardIndex]?.back;
  const flashcardId =
    deckData?.flashcards?.[currentFlashcardIndex]?.flashcardId;
  const currentEvaluation = flashcardId ? evaluations[flashcardId] : undefined;
  const aiExplanation = currentEvaluation?.aiExplanation;

  useEffect(() => {
    if (!deckId && routeDeckId) {
      initReview(routeDeckId as string);
    }
  }, [deckId, routeDeckId]);

  useEffect(() => {
    if (flashcardId) {
      setIsEvaluated(hasEvaluation(flashcardId));
      setUserInput(userAnswers[flashcardId] || "");
    }
  }, [deckData?.flashcards, flashcardId]);

  if (isLoading) return <LoadingScreen message="Loading questions..." />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {/* Question Section */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionLabel}>
            Question {currentFlashcardIndex + 1}
          </Text>
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
        {isEvaluated &&
          currentEvaluation?.userAnswerSegments &&
          currentEvaluation?.correctAnswerSegments && (
            <>
              <HighlightedAnswer
                label="Your Answer"
                segments={currentEvaluation.userAnswerSegments}
              />
              <HighlightedAnswer
                label="Correct Answer"
                segments={currentEvaluation.correctAnswerSegments}
              />
            </>
          )}

        {/* Mic Button */}
        {!isEvaluated && <MicButton onTranscriptChange={setUserInput} />}

        {/* AI Feedback Section */}
        {isEvaluated && aiExplanation && (
          <AIFeedback explanation={aiExplanation} />
        )}
      </View>
      {/* Controls */}
      <View style={styles.controls}>
        <Pressable
          style={styles.navButton}
          onPress={handlePreviousQuestion}
          disabled={aiReview.isPending}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </Pressable>
        <Animated.View style={[submitButtonStyle]}>
          <Pressable
            style={styles.submitButton}
            onPress={handleSubmit}
            accessibilityRole="button"
          >
            {aiReview.isPending ? (
              <ActivityIndicator
                color={COLORS.white}
                testID="activity-indicator"
              />
            ) : (
              <Text style={styles.submitButtonText}>
                {!isEvaluated ? "Submit" : "Try Again"}
              </Text>
            )}
          </Pressable>
        </Animated.View>
        <Pressable
          style={styles.navButton}
          onPress={handleNextQuestion}
          disabled={aiReview.isPending}
        >
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
