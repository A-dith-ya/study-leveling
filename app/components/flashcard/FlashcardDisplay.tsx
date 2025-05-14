import React from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import { CARD_WIDTH, CARD_HEIGHT } from "../../utils/stickerUtils";
import COLORS from "../../constants/colors";

interface FlashcardDisplayProps {
  front: string;
  back: string;
  onFlip: () => void;
  flipAnimation: any;
  scaleAnimation: any;
}

export default function FlashcardDisplay({
  front,
  back,
  onFlip,
  flipAnimation,
  scaleAnimation,
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

  return (
    <View style={styles.cardContainer}>
      <Pressable onPress={onFlip} style={styles.cardWrapper}>
        <Animated.View style={[styles.card, frontAnimatedStyle]}>
          <Text style={styles.cardText}>{front}</Text>
        </Animated.View>
        <Animated.View
          style={[styles.card, styles.cardBack, backAnimatedStyle]}
        >
          <Text style={styles.cardText}>{back}</Text>
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
    padding: 24,
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
});
