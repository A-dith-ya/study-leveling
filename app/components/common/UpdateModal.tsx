import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/app/constants/colors";

interface UpdateModalProps {
  visible: boolean;
  currentVersion: string;
  storeVersion: string;
  releaseNotes?: string;
  onUpdate: () => void;
  onNotNow: () => void;
}

export default function UpdateModal({
  visible,
  currentVersion,
  storeVersion,
  releaseNotes,
  onUpdate,
  onNotNow,
}: UpdateModalProps) {
  const platformText = Platform.OS === "ios" ? "App Store" : "Play Store";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="download-outline"
                size={32}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.title}>App Update Available</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.subtitle}>
              Version {storeVersion} is now available in the {platformText}
            </Text>

            {releaseNotes && (
              <View style={styles.releaseNotesContainer}>
                <Text style={styles.releaseNotesTitle}>What's New:</Text>
                <Text style={styles.releaseNotes}>{releaseNotes}</Text>
              </View>
            )}

            <Text style={styles.currentVersion}>
              Current version: {currentVersion}
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.notNowButton} onPress={onNotNow}>
              <Text style={styles.notNowButtonText}>Not Now</Text>
            </Pressable>
            <Pressable style={styles.updateButton} onPress={onUpdate}>
              <Text style={styles.updateButtonText}>Update Now</Text>
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
  modal: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    backgroundColor: COLORS.primaryLight + "20",
    padding: 16,
    borderRadius: 50,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },
  content: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
  },
  releaseNotesContainer: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  releaseNotesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  releaseNotes: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  currentVersion: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "center",
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  notNowButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    alignItems: "center",
  },
  notNowButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.darkGray,
  },
  updateButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
});
