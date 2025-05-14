import React, { useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetView,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

import EditHeader from "../components/common/EditHeader";
import { DraggableSticker } from "../components/DraggableSticker";
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  STICKER_SIZE,
  getImageFromId,
} from "../utils/stickerUtils";
import { Sticker, PlacedSticker } from "../types/stickerTypes";
import COLORS from "../constants/colors";

export default function FlashcardDecoration() {
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(
    null
  );
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);

  // Bottom sheet ref and snap points
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = ["37%", "60%", "80%"]; // Single, comfortable height for viewing stickers

  // Callbacks
  const handleSheetChanges = useCallback((index: number) => {}, []);

  const showStickerPalette = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(1);
  }, []);

  // Example sticker collection
  const availableStickers: Sticker[] = [
    {
      id: "session-surfer-100",
      name: "Star",
      category: "Sticker",
      count: 3,
    },
    {
      id: "streak-king-10",
      name: "Sparkle",
      category: "Sticker",
      count: 5,
    },
    // Add more stickers
  ];

  const getUsedStickerCount = (stickerId: string) => {
    return placedStickers.filter((s) => s.id.startsWith(`${stickerId}#`))
      .length;
  };

  const handleAddSticker = (sticker: Sticker) => {
    const usedCount = getUsedStickerCount(sticker.id);
    if (usedCount >= sticker.count) return; // Don't add if all stickers are used

    const uniqueId = `${sticker.id}#${usedCount + 1}`; // Using # as separator
    const newSticker: PlacedSticker = {
      ...sticker,
      id: uniqueId,
      x: (CARD_WIDTH - STICKER_SIZE) / 2,
      y: (CARD_HEIGHT - STICKER_SIZE) / 2,
      scale: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
    };
    setPlacedStickers([...placedStickers, newSticker]);
    setSelectedStickerId(uniqueId);
    bottomSheetRef.current?.close();
  };

  const handleUpdateSticker = (id: string, updates: Partial<PlacedSticker>) => {
    setPlacedStickers(
      placedStickers.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleDeleteSticker = (id: string) => {
    setPlacedStickers(placedStickers.filter((s) => s.id !== id));
    setSelectedStickerId(null);
  };

  const handleSave = () => {};

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <EditHeader
          title="Decorate Flashcard"
          rightButtonText="Save"
          rightButtonIcon="save"
          onRightButtonPress={handleSave}
        />

        {/* Canvas Area */}
        <View style={styles.canvas}>
          <View style={styles.flashcard}>
            <Text style={styles.cardText}>
              What is the powerhouse of the cell?
            </Text>
            {placedStickers.map((sticker) => (
              <DraggableSticker
                key={sticker.id}
                sticker={sticker}
                isSelected={selectedStickerId === sticker.id}
                onSelect={() => setSelectedStickerId(sticker.id)}
                onUpdate={(updates) => handleUpdateSticker(sticker.id, updates)}
                onDelete={() => handleDeleteSticker(sticker.id)}
              />
            ))}
          </View>
        </View>

        {/* Add Sticker Button */}
        <View style={styles.addButtonContainer}>
          <Pressable style={styles.addButton} onPress={showStickerPalette}>
            <Ionicons name="add-circle" size={24} color={COLORS.white} />
            <Text style={styles.addButtonText}>Add Sticker</Text>
          </Pressable>
        </View>

        {/* Sticker Palette Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          enablePanDownToClose
          backgroundStyle={styles.bottomSheetBackground}
          handleIndicatorStyle={styles.bottomSheetIndicator}
        >
          <BottomSheetView style={styles.paletteHeader}>
            <Text style={styles.paletteTitle}>Choose a Sticker</Text>
          </BottomSheetView>
          <BottomSheetScrollView>
            {availableStickers.map((sticker) => (
              <Pressable
                key={sticker.id}
                style={[
                  styles.stickerItem,
                  getUsedStickerCount(sticker.id) >= sticker.count &&
                    styles.disabledStickerItem,
                ]}
                onPress={() => handleAddSticker(sticker)}
                disabled={getUsedStickerCount(sticker.id) >= sticker.count}
              >
                <Image
                  source={getImageFromId(sticker.id)}
                  style={styles.stickerPreview}
                />
                <Text style={styles.stickerName}>{sticker.name}</Text>
                <Text style={styles.stickerCount}>
                  {getUsedStickerCount(sticker.id)}/{sticker.count}
                </Text>
              </Pressable>
            ))}
          </BottomSheetScrollView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  canvas: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  flashcard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardText: {
    position: "absolute",
    width: "100%",
    top: "50%",
    alignSelf: "center",
    fontSize: 18,
    color: COLORS.text,
    textAlign: "center",
    zIndex: -1, // Make text appear behind stickers
  },
  addButtonContainer: {
    padding: 16,
    alignItems: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSheetBackground: {
    backgroundColor: COLORS.white,
  },
  bottomSheetIndicator: {
    backgroundColor: COLORS.lightGray,
    width: 40,
  },
  paletteHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  paletteTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  stickerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    gap: 12,
  },
  stickerPreview: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  stickerName: {
    fontSize: 16,
    color: COLORS.text,
  },
  stickerCount: {
    fontSize: 14,
    color: COLORS.secondary,
    marginLeft: "auto",
    paddingRight: 8,
  },
  disabledStickerItem: {
    opacity: 0.5,
  },
});
