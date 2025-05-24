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
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { v4 as uuidv4 } from "uuid";

import FlashcardItem from "@/app/components/flashcard/FlashcardItem";
import { useCreateDeck } from "@/app/hooks/useDeck";
import COLORS from "@/app/constants/colors";
import {
  createNewFlashcard,
  updateFlashcardField,
  deleteFlashcardAndReorder,
  moveFlashcard,
  validateFlashcards,
} from "@/app/utils/flashcardUtils";
import { Flashcard } from "@/app/types/flashcardTypes";

export default function CreateFlashcard() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [deckTitle, setDeckTitle] = useState("");
  const router = useRouter();
  const createDeckMutation = useCreateDeck();

  const addFlashcard = () => {
    setFlashcards([...flashcards, createNewFlashcard(flashcards.length)]);
  };

  const updateFlashcard = (
    id: string,
    field: "front" | "back",
    value: string
  ) => {
    setFlashcards(updateFlashcardField(flashcards, id, field, value));
  };

  const deleteFlashcard = (id: string) => {
    const { updatedFlashcards } = deleteFlashcardAndReorder(flashcards, id);
    setFlashcards(updatedFlashcards);
  };

  const handleMoveFlashcard = (index: number, direction: "up" | "down") => {
    setFlashcards(moveFlashcard(flashcards, index, direction));
  };

  const renderItem = ({ item, index }: { item: Flashcard; index: number }) => (
    <FlashcardItem
      key={item.id}
      front={item.front}
      back={item.back}
      onChangeFront={(text) => updateFlashcard(item.id, "front", text)}
      onChangeBack={(text) => updateFlashcard(item.id, "back", text)}
      onMoveUp={() => handleMoveFlashcard(index, "up")}
      onMoveDown={() => handleMoveFlashcard(index, "down")}
      onDelete={() => deleteFlashcard(item.id)}
      isFirst={index === 0}
      isLast={index === flashcards.length - 1}
    />
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        Tap the "Add Card" button to create your first flashcard
      </Text>
    </View>
  );

  const handleSave = async () => {
    const validation = validateFlashcards(deckTitle, flashcards);
    if (!validation.isValid) {
      Alert.alert("Error", validation.errorMessage);
      return;
    }

    const deckId = uuidv4();
    createDeckMutation.mutate(
      {
        deckId,
        title: deckTitle,
        flashcards,
      },
      {
        onSuccess: () => {
          router.dismissTo("/(amain)");
        },
        onError: (error) => {
          console.error("Error saving deck:", error);
          Alert.alert("Error", "Failed to create deck. Please try again.");
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.dismissTo("/(amain)")}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </Pressable>
          <Text style={styles.title}>Create Flashcards</Text>
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
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={styles.listContentContainer}
        />
      </View>

      <Pressable
        style={[
          styles.saveAllButton,
          createDeckMutation.isPending && styles.saveButtonDisabled,
        ]}
        onPress={handleSave}
        disabled={createDeckMutation.isPending}
      >
        {createDeckMutation.isPending ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <>
            <Ionicons name="save-outline" size={24} color={COLORS.white} />
            <Text style={styles.saveAllButtonText}>Save All</Text>
          </>
        )}
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  listContentContainer: {
    paddingVertical: 8,
    paddingBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    marginTop: 100,
  },
  emptyStateText: {
    textAlign: "center",
    color: COLORS.darkGray,
    fontSize: 16,
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
});
