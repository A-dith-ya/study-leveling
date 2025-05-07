import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";

import { Achievement } from "../../constants/achievements";
import useAchievementStore from "../../stores/achievementStore";
import COLORS from "../../constants/colors";

const { width } = Dimensions.get("window");

interface AchievementModalProps {
  achievement: Achievement | null;
  visible: boolean;
  onClose: () => void;
}

export default function AchievementModal({
  achievement,
  visible,
  onClose,
}: AchievementModalProps) {
  const isUnlocked = useAchievementStore((state) => state.isUnlocked);

  if (!achievement) return null;
  const achievementUnlocked = isUnlocked(achievement.id);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
          <Image
            source={achievement.image}
            style={[
              styles.modalImage,
              !achievementUnlocked && styles.lockedImage,
            ]}
            resizeMode="contain"
          />
          <Text style={styles.modalTitle}>{achievement.title}</Text>
          <Text style={styles.modalDescription}>{achievement.description}</Text>
          {!achievementUnlocked && (
            <FontAwesome6 name="lock" size={24} color={COLORS.darkGray} />
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
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
