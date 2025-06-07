import React from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import LoadingScreen from "@/app/components/common/LoadingScreen";
import AISummaryCard from "@/app/components/ai-review/AISummaryCard";
import { useReviewStore } from "@/app/stores/reviewStore";
import { useDeck } from "@/app/hooks/useDeck";
import COLORS from "@/app/constants/colors";
import { AISummaryCardItem } from "@/app/types/reviewTypes";

export default function AISummary() {
  const {
    deckId,
    evaluations,
    userAnswers,
    setCurrentFlashcardIndex,
    hasEvaluation,
    reset,
  } = useReviewStore();
  const { data: deckData, isLoading } = useDeck(deckId as string);

  const handleRetry = () => {
    setCurrentFlashcardIndex(0);

    router.replace({
      pathname: "/(flashcard)/AIReview",
      params: { deckId },
    });
  };

  const handleBackToDashboard = () => {
    reset();
    router.replace("/(amain)");
  };

  if (isLoading || !deckData) {
    return <LoadingScreen message="Loading summary..." />;
  }

  // Filter flashcards to only include evaluated ones
  const flashcardSummaries: AISummaryCardItem[] = deckData.flashcards
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
        </View>
      ) : (
        <>
          {/* Flashcard List */}
          <FlashList
            data={flashcardSummaries}
            renderItem={({ item }) => <AISummaryCard item={item} />}
            estimatedItemSize={400}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={handleRetry}
        >
          <Ionicons name="refresh-outline" size={20} color={COLORS.white} />
          <Text style={styles.primaryButtonText}>Practice Again</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={handleBackToDashboard}
        >
          <Ionicons name="home-outline" size={20} color={COLORS.primary} />
          <Text style={styles.secondaryButtonText}>Dashboard</Text>
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
    borderBottomWidth: Platform.OS === "ios" ? 2 : 0,
    borderBottomColor: COLORS.primaryDark,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderBottomWidth: Platform.OS === "ios" ? 2 : 0,
    borderBottomColor: COLORS.primaryDark,
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
