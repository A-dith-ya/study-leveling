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
import { SafeAreaView } from "react-native-safe-area-context";

import FlashcardItem from "../components/flashcard/FlashcardItem";
import LoadingScreen from "../components/common/LoadingScreen";
import EditHeader from "../components/common/EditHeader";
import { useDeck, useUpdateDeck } from "../hooks/useDeck";
import COLORS from "../constants/colors";
import {
  Flashcard,
  createNewFlashcard,
  updateFlashcardField,
  deleteFlashcardAndReorder,
  moveFlashcard,
  validateFlashcards,
} from "../utils/flashcardUtils";

export default function EditFlashcard() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [deckTitle, setDeckTitle] = useState("");
  const router = useRouter();
  const { deckId } = useLocalSearchParams();
  const [deletedFlashcardIds, setDeletedFlashcardIds] = useState<string[]>([]);

  const { data: deckData, isLoading } = useDeck(deckId as string);
  const updateDeckMutation = useUpdateDeck();

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
    setDeletedFlashcardIds([...deletedFlashcardIds, id]);
  };

  const handleMoveFlashcard = (index: number, direction: "up" | "down") => {
    setFlashcards(moveFlashcard(flashcards, index, direction));
  };

  const addFlashcard = () => {
    setFlashcards([...flashcards, createNewFlashcard(flashcards.length)]);
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

  const handleSave = async () => {
    const validation = validateFlashcards(deckTitle, flashcards);
    if (!validation.isValid) {
      Alert.alert("Error", validation.errorMessage);
      return;
    }

    updateDeckMutation.mutate(
      {
        deckId: deckId as string,
        title: deckTitle,
        flashcards,
        deletedFlashcardIds,
      },
      {
        onSuccess: () => {
          router.dismissTo("/(amain)");
        },
        onError: (error) => {
          console.error("Error updating deck:", error);
          Alert.alert("Error", "Failed to update deck. Please try again.");
        },
      }
    );
  };

  if (isLoading) return <LoadingScreen message="Loading flashcards..." />;

  return (
    <SafeAreaView style={styles.container}>
      <EditHeader
        title="Edit Flashcards"
        rightButtonText="Add Card"
        rightButtonIcon="add-circle"
        onRightButtonPress={addFlashcard}
      />

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
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
});
