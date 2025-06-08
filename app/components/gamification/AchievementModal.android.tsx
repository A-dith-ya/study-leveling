import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";

import useAchievementStore from "@/app/stores/achievementStore";
import COLORS from "@/app/constants/colors";
import { AchievementModalProps } from "@/app/types/achievementTypes";

const { width } = Dimensions.get("window");

export default function AchievementModal({
  achievement,
  visible,
  onClose,
}: AchievementModalProps) {
  const isUnlocked = useAchievementStore((state) => state.isUnlocked);

  if (!achievement || !visible) return null;
  const achievementUnlocked = isUnlocked(achievement.id);

  return (
    <View style={styles.modalOverlay}>
      <Pressable style={styles.overlayBackground} onPress={onClose} />
      <View style={styles.modalContent}>
        <Image
          source={achievement.image}
          style={[
            styles.modalImage,
            !achievementUnlocked && styles.lockedImage,
          ]}
          resizeMode="contain"
          accessibilityLabel="Achievement Badge"
        />
        <Text style={styles.modalTitle}>{achievement.title}</Text>
        <Text style={styles.modalDescription}>{achievement.description}</Text>
        {!achievementUnlocked && (
          <FontAwesome6 name="lock" size={24} color={COLORS.darkGray} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
  },
  overlayBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: width * 0.8,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalImage: {
    width: 144,
    height: 144,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 16,
  },
  lockedImage: {
    opacity: 0.5,
    tintColor: COLORS.darkGray,
  },
});
