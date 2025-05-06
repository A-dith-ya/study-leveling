import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";

import FlashcardItem from "../components/flashcard/FlashcardItem";
import { getDeckById, updateDeck } from "../services/deckService";
import useUserStore from "../stores/userStore";
import COLORS from "../constants/colors";
import { Flashcard } from "./index";

export default function EditFlashcard() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [deckTitle, setDeckTitle] = useState("");
  const router = useRouter();
  const { user } = useUserStore();
  const queryClient = useQueryClient();
  const { deckId } = useLocalSearchParams();
  const [deletedFlashcardIds, setDeletedFlashcardIds] = useState<string[]>([]);

  // Fetch existing deck data
  const { data: deckData, isLoading } = useQuery({
    queryKey: ["deck", deckId],
    queryFn: () => getDeckById(deckId as string),
    enabled: !!deckId,
  });

  useEffect(() => {
    if (deckData) {
      setDeckTitle(deckData?.title || "");
      setFlashcards(
        deckData?.flashcards?.map((card) => ({
          id: card.flashcardId,
          front: card.front,
          back: card.back,
          order: card.order,
        })) || []
      );
    }
  }, [deckData]);

  const updateDeckMutation = useMutation({
    mutationFn: ({
      userId,
      deckId,
      title,
      cards,
      deletedFlashcardIds,
    }: {
      userId: string;
      deckId: string;
      title: string;
      cards: Flashcard[];
      deletedFlashcardIds: string[];
    }) => updateDeck(userId, deckId, title, cards, deletedFlashcardIds),
    onSuccess: () => {
      // Invalidate and refetch decks query
      queryClient.invalidateQueries({ queryKey: ["decks", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      router.dismissTo("/(amain)");
    },
    onError: (error) => {
      console.error("Error updating deck:", error);
      Alert.alert("Error", "Failed to update deck. Please try again.");
    },
  });

  const updateFlashcard = (
    id: string,
    field: "front" | "back",
    value: string
  ) => {
    setFlashcards(
      flashcards.map((card) =>
        card.id === id ? { ...card, [field]: value } : card
      )
    );
  };

  const deleteFlashcard = (id: string) => {
    const deletedCardIndex = flashcards.findIndex((card) => card.id === id);
    const updatedFlashcards = flashcards
      .filter((card) => card.id !== id)
      .map((card, index) => ({
        ...card,
        order: card.order > deletedCardIndex ? card.order - 1 : card.order,
      }));
    setFlashcards(updatedFlashcards);
    setDeletedFlashcardIds([...deletedFlashcardIds, id]);
  };

  const moveFlashcard = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= flashcards.length) return;

    const newFlashcards = [...flashcards];
    const movedCard = newFlashcards[index];
    const replacedCard = newFlashcards[newIndex];

    // Swap orders
    const tempOrder = movedCard.order;
    movedCard.order = replacedCard.order;
    replacedCard.order = tempOrder;

    // Swap positions in array
    newFlashcards[index] = replacedCard;
    newFlashcards[newIndex] = movedCard;

    // Sort array by order to maintain consistency
    newFlashcards.sort((a, b) => a.order - b.order);

    setFlashcards(newFlashcards);
  };

  const addFlashcard = () => {
    const newFlashcard: Flashcard = {
      id: uuidv4(),
      front: "",
      back: "",
      order: flashcards.length, // New cards are added at the end
    };
    setFlashcards([...flashcards, newFlashcard]);
  };

  const renderItem = ({ item, index }: { item: Flashcard; index: number }) => (
    <FlashcardItem
      key={item.id}
      front={item.front}
      back={item.back}
      onChangeFront={(text) => updateFlashcard(item.id, "front", text)}
      onChangeBack={(text) => updateFlashcard(item.id, "back", text)}
      onMoveUp={() => moveFlashcard(index, "up")}
      onMoveDown={() => moveFlashcard(index, "down")}
      onDelete={() => deleteFlashcard(item.id)}
      isFirst={index === 0}
      isLast={index === flashcards.length - 1}
    />
  );

  const handleSave = async () => {
    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to update the deck");
      return;
    }

    if (!deckTitle.trim()) {
      Alert.alert("Error", "Please enter a deck title");
      return;
    }

    if (flashcards.length < 3) {
      Alert.alert("Error", "Please have at least 3 flashcards");
      return;
    }

    // Validate all flashcards have content
    const emptyCards = flashcards.filter(
      (card) => !card.front.trim() || !card.back.trim()
    );
    if (emptyCards.length > 0) {
      Alert.alert("Error", "Please fill in all flashcard content");
      return;
    }

    updateDeckMutation.mutate({
      userId: user.id,
      deckId: deckId as string,
      title: deckTitle,
      cards: flashcards,
      deletedFlashcardIds,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.dismissTo("/(amain)")}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </Pressable>
          <Text style={styles.title}>Edit Flashcards</Text>
        </View>
        <Pressable onPress={addFlashcard} style={styles.addButton}>
          <Ionicons name="add-circle" size={24} color={COLORS.primary} />
          <Text style={styles.addButtonText}>Add Card</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <TextInput
          style={styles.titleInput}
          placeholder="Enter deck title"
          value={deckTitle}
          onChangeText={setDeckTitle}
          placeholderTextColor={COLORS.darkGray}
        />
        <FlashList
          data={flashcards}
          renderItem={renderItem}
          estimatedItemSize={150}
          contentContainerStyle={styles.listContentContainer}
        />
      </View>

      <Pressable
        style={[
          styles.saveAllButton,
          updateDeckMutation.isPending && styles.saveButtonDisabled,
        ]}
        onPress={handleSave}
        disabled={updateDeckMutation.isPending}
      >
        {updateDeckMutation.isPending ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <>
            <Ionicons name="save-outline" size={24} color={COLORS.white} />
            <Text style={styles.saveAllButtonText}>Save Changes</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  listContentContainer: {
    paddingVertical: 8,
    paddingBottom: 16,
  },
  saveAllButton: {
    width: "50%",
    alignSelf: "center",
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
  },
  saveAllButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  titleInput: {
    backgroundColor: COLORS.white,
    padding: 16,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    color: COLORS.text,
    textAlign: "center",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  addButtonText: {
    marginLeft: 4,
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "500",
  },
});
