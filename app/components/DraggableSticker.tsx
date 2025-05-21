import React from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { PlacedSticker } from "../types/stickerTypes";
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  STICKER_SIZE,
  getImageFromId,
} from "../utils/stickerUtils";
import COLORS from "../constants/colors";

interface DraggableStickerProps {
  sticker: PlacedSticker;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<PlacedSticker>) => void;
  onDelete: () => void;
}

export const DraggableSticker: React.FC<DraggableStickerProps> = ({
  sticker,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}) => {
  const translateX = useSharedValue(sticker.x);
  const translateY = useSharedValue(sticker.y);
  const scale = useSharedValue(sticker.scale);
  const rotation = useSharedValue(sticker.rotation);
  const flipX = useSharedValue(sticker.flipX ? -1 : 1);
  const flipY = useSharedValue(sticker.flipY ? -1 : 1);

  // Calculate boundaries based on card dimensions and sticker size
  const minX = 0;
  const maxX = CARD_WIDTH - STICKER_SIZE;
  const minY = 0;
  const maxY = CARD_HEIGHT - STICKER_SIZE;

  // Pan gesture with boundaries
  const dragGesture = Gesture.Pan()
    .onUpdate((e) => {
      const newX = sticker.x + e.translationX;
      const newY = sticker.y + e.translationY;

      // Constrain X and Y values within boundaries
      translateX.value = Math.min(Math.max(newX, minX), maxX);
      translateY.value = Math.min(Math.max(newY, minY), maxY);
    })
    .onEnd(() => {
      runOnJS(onUpdate)({
        x: translateX.value,
        y: translateY.value,
      });
    });

  // Pinch gesture for scaling with boundaries
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      const newScale = sticker.scale * e.scale;
      // Calculate maximum allowed scale based on boundaries
      const maxScaleX = CARD_WIDTH / STICKER_SIZE;
      const maxScaleY = CARD_HEIGHT / STICKER_SIZE;
      const maxAllowedScale = Math.min(maxScaleX, maxScaleY, 2); // Cap at 2x or boundary limit

      if (newScale >= 0.5 && newScale <= maxAllowedScale) {
        scale.value = newScale;

        // Check if the scaled sticker would exceed boundaries
        const scaledWidth = STICKER_SIZE * newScale;
        const scaledHeight = STICKER_SIZE * newScale;

        if (translateX.value + scaledWidth > CARD_WIDTH) {
          translateX.value = CARD_WIDTH - scaledWidth;
        }
        if (translateY.value + scaledHeight > CARD_HEIGHT) {
          translateY.value = CARD_HEIGHT - scaledHeight;
        }
      }
    })
    .onEnd(() => {
      runOnJS(onUpdate)({
        scale: scale.value,
        x: translateX.value,
        y: translateY.value,
      });
    });

  const composed = Gesture.Simultaneous(dragGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
      { scaleX: flipX.value },
      { scaleY: flipY.value },
    ],
  }));

  const handleRotate = (direction: "left" | "right") => {
    const newRotation = rotation.value + (direction === "left" ? -90 : 90);
    rotation.value = withSpring(newRotation, { damping: 12 });
    onUpdate({ rotation: newRotation });
  };

  const handleFlip = (axis: "x" | "y") => {
    if (axis === "x") {
      const newFlipX = flipX.value * -1;
      flipX.value = withSpring(newFlipX, { damping: 12 });
      onUpdate({ flipX: newFlipX === -1 });
    } else {
      const newFlipY = flipY.value * -1;
      flipY.value = withSpring(newFlipY, { damping: 12 });
      onUpdate({ flipY: newFlipY === -1 });
    }
  };

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        style={[
          styles.stickerContainer,
          animatedStyle,
          isSelected && styles.selectedSticker,
        ]}
      >
        <Pressable onPress={onSelect}>
          <Image source={getImageFromId(sticker.id)} style={styles.sticker} />
        </Pressable>

        {isSelected && (
          <View style={styles.stickerControls}>
            <Pressable
              style={styles.controlButton}
              onPress={() => handleRotate("left")}
            >
              <Ionicons name="arrow-undo" size={20} color={COLORS.white} />
            </Pressable>
            <Pressable
              style={styles.controlButton}
              onPress={() => handleRotate("right")}
            >
              <Ionicons name="arrow-redo" size={20} color={COLORS.white} />
            </Pressable>
            <Pressable
              style={styles.controlButton}
              onPress={() => handleFlip("x")}
            >
              <Ionicons name="swap-horizontal" size={20} color={COLORS.white} />
            </Pressable>
            <Pressable
              style={styles.controlButton}
              onPress={() => handleFlip("y")}
            >
              <Ionicons name="swap-vertical" size={20} color={COLORS.white} />
            </Pressable>
            <Pressable
              style={[styles.controlButton, styles.deleteButton]}
              onPress={onDelete}
            >
              <Ionicons name="trash" size={20} color={COLORS.error} />
            </Pressable>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  stickerContainer: {
    position: "absolute",
    width: STICKER_SIZE,
    height: STICKER_SIZE,
  },
  sticker: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  selectedSticker: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 8,
  },
  stickerControls: {
    position: "absolute",
    bottom: -48,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
});
