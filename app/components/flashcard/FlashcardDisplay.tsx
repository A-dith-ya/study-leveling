import React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  STICKER_SIZE,
  getImageFromId,
} from "../../utils/stickerUtils";
import COLORS from "../../constants/colors";
import { PlacedSticker } from "../../types/stickerTypes";

interface FlashcardDisplayProps {
  front: string;
  back: string;
  onFlip: () => void;
  flipAnimation: any;
  scaleAnimation: any;
  decorations?: PlacedSticker[];
}

export default function FlashcardDisplay({
  front,
  back,
  onFlip,
  flipAnimation,
  scaleAnimation,
  decorations = [],
}: FlashcardDisplayProps) {
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(flipAnimation.value, [0, 1], [0, 180]);
    return {
      transform: [
        { scale: scaleAnimation.value },
        { perspective: 1000 },
        { rotateY: `${rotateValue}deg` },
      ],
      backfaceVisibility: "hidden",
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(flipAnimation.value, [0, 1], [180, 360]);
    return {
      transform: [
        { scale: scaleAnimation.value },
        { perspective: 1000 },
        { rotateY: `${rotateValue}deg` },
      ],
      backfaceVisibility: "hidden",
    };
  });

  const renderDecorations = (decorations: PlacedSticker[]) => {
    return decorations.map((sticker) => (
      <View
        key={sticker.id}
        style={[
          styles.stickerContainer,
          {
            transform: [
              { translateX: sticker.x },
              { translateY: sticker.y },
              { scale: sticker.scale },
              { rotate: `${sticker.rotation}deg` },
              { scaleX: sticker.flipX ? -1 : 1 },
              { scaleY: sticker.flipY ? -1 : 1 },
            ],
          },
        ]}
      >
        <Image source={getImageFromId(sticker.id)} style={styles.sticker} />
      </View>
    ));
  };

  return (
    <View style={styles.cardContainer}>
      <Pressable onPress={onFlip} style={styles.cardWrapper}>
        <Animated.View style={[styles.card, frontAnimatedStyle]}>
          <Text style={styles.cardText}>{front}</Text>
          <View style={styles.decorationContainer}>
            {renderDecorations(decorations)}
          </View>
        </Animated.View>
        <Animated.View
          style={[styles.card, styles.cardBack, backAnimatedStyle]}
        >
          <Text style={styles.cardText}>{back}</Text>
          <View style={styles.decorationContainer}>
            {renderDecorations(decorations)}
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  cardBack: {
    backgroundColor: COLORS.white,
  },
  cardText: {
    fontSize: 20,
    color: COLORS.text,
    textAlign: "center",
  },
  decorationContainer: {
    ...StyleSheet.absoluteFillObject,
  },
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
});
