import React from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";

import HighlightedAnswer from "../components/ai-review/HighlightedAnswer";
import AIFeedback from "../components/ai-review/AIFeedback";
import LoadingScreen from "../components/common/LoadingScreen";
import { useReviewStore } from "../stores/reviewStore";
import { useDeck } from "../hooks/useDeck";
import COLORS from "../constants/colors";

interface FlashcardSummaryItem {
  id: string;
  question: string;
  userAnswer?: string;
  correctAnswer?: string;
  aiExplanation?: string;
  userAnswerSegments?: Array<{
    text: string;
    type: "correct" | "incorrect" | "missing" | "none";
  }>;
  correctAnswerSegments?: Array<{
    text: string;
    type: "correct" | "incorrect" | "missing" | "none";
  }>;
}

const FlashcardSummaryCard = React.memo(
  ({ item }: { item: FlashcardSummaryItem }) => {
    return (
      <Animated.View
        entering={FadeInUp.delay(100)}
        style={styles.cardContainer}
      >
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
        {item.correctAnswerSegments &&
          item.correctAnswerSegments.length > 0 && (
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
);

export default function AISummary() {
  const { deckId, evaluations, userAnswers, hasEvaluation } = useReviewStore();
  const { data: deckData, isLoading } = useDeck(deckId as string);

  const handleRetry = () => {
    router.replace({
      pathname: "/(flashcard)/AIReview",
      params: { deckId },
    });
  };

  const handleBackToDashboard = () => {
    router.replace("/(amain)");
  };

  if (isLoading || !deckData) {
    return <LoadingScreen message="Loading summary..." />;
  }

  // Filter flashcards to only include evaluated ones
  const flashcardSummaries: FlashcardSummaryItem[] = deckData.flashcards
    .filter((flashcard) => hasEvaluation(flashcard.flashcardId))
    .map((flashcard) => {
      const evaluation = evaluations[flashcard.flashcardId];
      return {
        id: flashcard.flashcardId,
        question: flashcard.front,
        userAnswer: userAnswers[flashcard.flashcardId],
        correctAnswer: flashcard.back,
        aiExplanation: evaluation?.aiExplanation,
        userAnswerSegments: evaluation?.userAnswerSegments,
        correctAnswerSegments: evaluation?.correctAnswerSegments,
      };
    });

  const evaluatedCount = flashcardSummaries.length;
  const totalCount = deckData.flashcards.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Review Summary</Text>
        <Text style={styles.subtitle}>
          {evaluatedCount} of {totalCount} Cards Reviewed
        </Text>
      </View>

      {/* Empty State */}
      {evaluatedCount === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No cards have been reviewed yet.</Text>
          <Pressable
            style={[styles.button, styles.primaryButton, styles.emptyButton]}
            onPress={handleRetry}
          >
            <Text style={styles.primaryButtonText}>Start Review</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* Flashcard List */}
          <FlashList
            data={flashcardSummaries}
            renderItem={({ item }) => <FlashcardSummaryCard item={item} />}
            estimatedItemSize={400}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />

          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            <Pressable
              style={[styles.button, styles.primaryButton]}
              onPress={handleRetry}
            >
              <Ionicons name="refresh-outline" size={20} color={COLORS.white} />
              <Text style={styles.primaryButtonText}>Retry Session</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={handleBackToDashboard}
            >
              <Ionicons name="home-outline" size={20} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Dashboard</Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  listContainer: {
    padding: 16,
  },
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
  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 16,
    textAlign: "center",
  },
  emptyButton: {
    maxWidth: 200,
  },
});
