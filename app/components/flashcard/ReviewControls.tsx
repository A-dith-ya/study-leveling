import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";

interface ReviewControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  onMark: () => void;
  isFirstCard: boolean;
  isLastCard: boolean;
}

export default function ReviewControls({
  onPrevious,
  onNext,
  onMark,
  isFirstCard,
  isLastCard,
}: ReviewControlsProps) {
  return (
    <View style={styles.controls}>
      <Pressable
        style={[styles.navButton, isFirstCard && styles.navButtonDisabled]}
        onPress={onPrevious}
        disabled={isFirstCard}
      >
        <Ionicons
          name="chevron-back"
          size={24}
          color={isFirstCard ? COLORS.darkGray : COLORS.primary}
        />
      </Pressable>

      {!isLastCard && (
        <Pressable style={styles.markButton} onPress={onMark}>
          <Ionicons name="bookmark-outline" size={20} color={COLORS.white} />
          <Text style={styles.markButtonText}>Mark</Text>
        </Pressable>
      )}

      <Pressable
        style={[styles.navButton, isLastCard && styles.navButtonDisabled]}
        onPress={onNext}
        disabled={isLastCard}
      >
        <Ionicons
          name="chevron-forward"
          size={24}
          color={isLastCard ? COLORS.darkGray : COLORS.primary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navButtonDisabled: {
    backgroundColor: COLORS.lightGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  markButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
