import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView, StyleSheet, Pressable, Text, View } from "react-native";
import {
  useSharedValue,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, router } from "expo-router";

import { getDeckById } from "../services/deckService";
import { fisherYatesShuffle } from "../utils/flashcardUtils";
import { calculateXPForSession } from "../utils/xpUtils";
import { getElapsedSeconds } from "../utils/dayUtils";
import ReviewHeader from "../components/flashcard/ReviewHeader";
import FlashcardDisplay from "../components/flashcard/FlashcardDisplay";
import ReviewControls from "../components/flashcard/ReviewControls";
import LoadingScreen from "../components/common/LoadingScreen";
import COLORS from "../constants/colors";

/**
 * FlashcardReview Component
 * Handles the review session for a deck of flashcards, including:
 * - Card navigation (next/previous)
 * - Card marking for review
 * - Shuffle functionality
 * - Review mode for marked cards
 */
export default function FlashcardReview() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);
  const startTimeRef = useRef(Date.now());

  // Marked cards tracking
  const [markedCards, setMarkedCards] = useState<Set<number>>(new Set());
  const [isReviewingMarked, setIsReviewingMarked] = useState(false);

  // Array of indices representing the current order of cards
  const [remainingCards, setRemainingCards] = useState<number[]>([]);
  const { deckId } = useLocalSearchParams();

  const { data: deckData, isLoading } = useQuery({
    queryKey: ["deck", deckId],
    queryFn: () => getDeckById(deckId as string),
    enabled: !!deckId,
  });

  useEffect(() => {
    if (deckData) {
      setRemainingCards([...Array(deckData.flashcards?.length).keys()]);
    }
  }, [deckData]);

  const flipAnimation = useSharedValue(0);
  const scaleAnimation = useSharedValue(1);

  const handleFlip = () => {
    const toValue = isFlipped ? 0 : 1;
    flipAnimation.value = withTiming(toValue, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    setIsFlipped(!isFlipped);
  };

  // Mark current card for review and handle end-of-deck transition
  const handleMark = () => {
    const currentCardIndex = remainingCards[currentIndex];

    setMarkedCards((prev) => {
      const newSet = new Set([...prev, currentCardIndex]);

      // If this is the last card, transition to reviewing marked cards
      if (currentIndex === remainingCards.length - 1) {
        setIsReviewingMarked(true);
        // When transitioning to review mode, apply shuffle if enabled
        const markedArray = [...newSet];
        const newRemaining = shuffleMode
          ? fisherYatesShuffle(markedArray)
          : markedArray;
        setRemainingCards(newRemaining);
        setCurrentIndex(0);
        // Reset shuffle mode when starting review
        setShuffleMode(false);
        return new Set();
      }

      return newSet;
    });

    if (currentIndex < remainingCards.length - 1) {
      handleNext();
    }
  };

  // Navigate to next card with animation
  const handleNext = () => {
    if (currentIndex < remainingCards.length - 1) {
      scaleAnimation.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      setCurrentIndex((prev) => prev + 1);
      if (isFlipped) handleFlip();
    } else if (markedCards.size > 0) {
      // Transition to reviewing marked cards if any exist
      setIsReviewingMarked(true);
      setRemainingCards([...markedCards]);
      setCurrentIndex(0);
      setMarkedCards(new Set());
    }
  };

  // Navigate to previous card with animation
  const handlePrevious = () => {
    if (currentIndex > 0) {
      scaleAnimation.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      setCurrentIndex((prev) => prev - 1);
      if (isFlipped) handleFlip();
    }
  };

  const shuffleCards = () => {
    setRemainingCards((prev) => {
      if (!shuffleMode) {
        const shuffled = fisherYatesShuffle([...prev]);
        return shuffled;
      } else {
        // When turning shuffle off, restore original order
        return [...Array(deckData?.flashcards?.length).keys()];
      }
    });
    setShuffleMode(!shuffleMode);
  };

  // Get current card data and determine if we're on the last card
  const currentCard = deckData?.flashcards?.[remainingCards[currentIndex]];
  const isLastCard =
    currentIndex === remainingCards.length - 1 && markedCards.size === 0;

  // When navigating away, you can calculate total time with:
  // const totalTimeInSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);

  if (isLoading) return <LoadingScreen message="Loading flashcards..." />;

  return (
    <SafeAreaView style={styles.container}>
      <ReviewHeader
        currentIndex={currentIndex}
        totalCards={remainingCards.length}
        isReviewingMarked={isReviewingMarked}
        shuffleMode={shuffleMode}
        onToggleShuffle={shuffleCards}
      />

      <FlashcardDisplay
        front={currentCard?.front ?? ""}
        back={currentCard?.back ?? ""}
        onFlip={handleFlip}
        flipAnimation={flipAnimation}
        scaleAnimation={scaleAnimation}
      />

      <ReviewControls
        onPrevious={handlePrevious}
        onNext={handleNext}
        onMark={handleMark}
        isFirstCard={currentIndex === 0}
        isLastCard={isLastCard}
      />

      {isLastCard && (
        <Pressable
          style={styles.submitButton}
          onPress={() => {
            router.push(
              `/(flashcard)/FlashcardReward?deckId=${deckId}&totalCards=${deckData?.flashcards?.length}&duration=${getElapsedSeconds(
                startTimeRef.current
              )}&xpEarned=${calculateXPForSession(
                deckData?.flashcards?.length ?? 0,
                getElapsedSeconds(startTimeRef.current)
              )}`
            );
          }}
        >
          <Text style={styles.submitButtonText}>Complete Review</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
  },
});
