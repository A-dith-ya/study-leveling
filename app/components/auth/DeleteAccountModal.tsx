import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { deleteUser } from "aws-amplify/auth";
import { useQueryClient } from "@tanstack/react-query";
import { generateClient } from "aws-amplify/api";

import type { Schema } from "@/amplify/data/resource";
import useUserStore from "@/app/stores/userStore";
import useAchievementStore from "@/app/stores/achievementStore";
import useReviewStore from "@/app/stores/reviewStore";
import useCosmeticStore from "@/app/stores/cosmeticStore";
import useChallengeStore from "@/app/stores/challengeStore";
import { zustandStorage } from "@/app/stores/mmkv";
import COLORS from "@/app/constants/colors";
import { logger } from "@/app/utils/logger";

const client = generateClient<Schema>();

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteAccountModal({
  visible,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      // Call the delete user Lambda function
      const response = await client.queries.deleteUser({});

      if (!response) {
        throw new Error("Failed to delete account");
      }

      // Clear all local storage and state
      zustandStorage.removeItem("user-storage");
      zustandStorage.removeItem("achievement-storage");
      zustandStorage.removeItem("review-storage");
      zustandStorage.removeItem("cosmetic-storage");
      zustandStorage.removeItem("challenge-storage");

      useUserStore.getState().clearUser();
      useAchievementStore.getState().reset();
      useReviewStore.getState().reset();
      useCosmeticStore.getState().reset();
      useChallengeStore.getState().reset();

      // Clear the query cache
      queryClient.clear();
      queryClient.invalidateQueries();

      logger.info("Account deleted successfully");

      // Deletes and signs out the user
      await deleteUser();

      onConfirm();
    } catch (error) {
      logger.error("Error deleting account", error);
      Alert.alert(
        "Error",
        "Failed to delete account. Please try again or contact support.",
        [{ text: "OK" }]
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="warning" size={48} color={COLORS.error} />
          </View>

          <Text style={styles.title}>Delete Account</Text>

          <Text style={styles.message}>
            This action is permanent and will erase all your data including:
          </Text>

          <View style={styles.dataList}>
            <View style={styles.dataItem}>
              <Ionicons name="checkmark" size={16} color={COLORS.error} />
              <Text style={styles.dataText}>All flashcard decks</Text>
            </View>
            <View style={styles.dataItem}>
              <Ionicons name="checkmark" size={16} color={COLORS.error} />
              <Text style={styles.dataText}>Study progress and statistics</Text>
            </View>
            <View style={styles.dataItem}>
              <Ionicons name="checkmark" size={16} color={COLORS.error} />
              <Text style={styles.dataText}>Achievements and rewards</Text>
            </View>
            <View style={styles.dataItem}>
              <Ionicons name="checkmark" size={16} color={COLORS.error} />
              <Text style={styles.dataText}>Account information</Text>
            </View>
          </View>

          <Text style={styles.warning}>
            This action cannot be undone. Are you sure you want to continue?
          </Text>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isDeleting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.deleteButton]}
              onPress={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="trash" size={20} color={COLORS.white} />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  dataList: {
    alignSelf: "stretch",
    marginBottom: 16,
  },
  dataItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dataText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginLeft: 8,
    flex: 1,
  },
  warning: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.darkGray,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  deleteButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: "600",
    marginLeft: 8,
  },
});
