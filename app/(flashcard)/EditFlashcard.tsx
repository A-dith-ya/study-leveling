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
import { v4 as uuidv4 } from "uuid";
import type { Schema } from "@/amplify/data/resource";

import FlashcardItem from "@/app/components/flashcard/FlashcardItem";
import FileUploadModal from "@/app/components/flashcard/FileUploadModal";
import LoadingScreen from "@/app/components/common/LoadingScreen";
import EditHeader from "@/app/components/common/EditHeader";
import { useDeck, useUpdateDeck } from "@/app/hooks/useDeck";
import { useGenerateFlashcards } from "@/app/services/generateService";
import COLORS from "@/app/constants/colors";
import {
  createNewFlashcard,
  updateFlashcardField,
  deleteFlashcardAndReorder,
  moveFlashcard,
  validateFlashcards,
} from "@/app/utils/flashcardUtils";
import { Flashcard, UploadedFile } from "@/app/types/flashcardTypes";
import { logger } from "@/app/utils/logger";

export default function EditFlashcard() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [deckTitle, setDeckTitle] = useState("");
  const [showFileUpload, setShowFileUpload] = useState(false);
  const router = useRouter();
  const { deckId } = useLocalSearchParams();
  const [deletedFlashcardIds, setDeletedFlashcardIds] = useState<string[]>([]);

  const { data: deckData, isLoading } = useDeck(deckId as string);
  const updateDeckMutation = useUpdateDeck();
  const generateFlashcardsMutation = useGenerateFlashcards();

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

  const handleAIGeneration = async (files: UploadedFile[]) => {
    try {
      const aiGeneratedCards: Schema["generateFlashcardsResponse"]["type"][] =
        await generateFlashcardsMutation.mutateAsync(
          files.map((file) => file.content || "").join("\n")
        );

      const generatedFlashcards: Flashcard[] = aiGeneratedCards.map(
        (card, index) => ({
          id: uuidv4(),
          front: card.question,
          back: card.answer,
          order: flashcards.length + index,
        })
      );

      setFlashcards((prev) => [...prev, ...generatedFlashcards]);
      setShowFileUpload(false);
    } catch (error) {
      logger.error("AI generation error:", error);
      Alert.alert("Error", "Failed to generate flashcards. Please try again.");
    }
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

      <View style={styles.buttonContainer}>
        <Pressable
          style={[
            styles.button,
            updateDeckMutation.isPending && styles.buttonDisabled,
          ]}
          onPress={handleSave}
          disabled={updateDeckMutation.isPending}
        >
          {updateDeckMutation.isPending ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="save-outline" size={24} color={COLORS.white} />
              <Text style={styles.buttonText}>Save Changes</Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => setShowFileUpload(true)}
        >
          <Ionicons name="sparkles" size={24} color={COLORS.white} />
          <Text style={styles.buttonText}>AI Generate</Text>
        </Pressable>
      </View>

      <FileUploadModal
        visible={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onGenerate={handleAIGeneration}
        isGenerating={generateFlashcardsMutation.isPending}
      />
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
  titleInput: {
    backgroundColor: COLORS.white,
    padding: 16,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    color: COLORS.text,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  button: {
    width: "40%",
    alignSelf: "center",
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primaryDark,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
