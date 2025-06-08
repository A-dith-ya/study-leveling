import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/app/constants/colors";

interface CodeRedemptionModalProps {
  visible: boolean;
  onClose: () => void;
  onCodeRedeemed: (coins: number) => void;
}

// Predefined codes and their coin rewards
const REDEMPTION_CODES: Record<string, number> = {
  FAMILY: 1000,
  DEV: 5000,
};

export default function CodeRedemptionModal({
  visible,
  onClose,
  onCodeRedeemed,
}: CodeRedemptionModalProps) {
  const [code, setCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [error, setError] = useState("");

  const resetModal = () => {
    setCode("");
    setError("");
    setIsRedeeming(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleRedeemCode = async () => {
    setIsRedeeming(true);
    setError(""); // Clear any previous errors

    try {
      const upperCode = code.trim().toUpperCase();

      // Check for predefined codes
      const coinReward = REDEMPTION_CODES[upperCode];
      if (coinReward) {
        onCodeRedeemed(coinReward);
        handleClose();
      } else {
        setError("The code you entered is not valid.");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="gift-outline" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Redeem Code</Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.darkGray} />
            </Pressable>
          </View>

          <View style={styles.content}>
            <Text style={styles.subtitle}>
              Enter a redemption code to get free coins!
            </Text>

            <TextInput
              style={styles.codeInput}
              value={code}
              onChangeText={setCode}
              placeholder="Enter your code here..."
              placeholderTextColor={COLORS.darkGray}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.actions}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={isRedeeming}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.redeemButton]}
                onPress={handleRedeemCode}
                disabled={isRedeeming || !code.trim()}
              >
                {isRedeeming ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.redeemButtonText}>Redeem</Text>
                )}
              </Pressable>
            </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  iconContainer: {
    backgroundColor: COLORS.primaryLight + "20",
    padding: 12,
    borderRadius: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    alignItems: "stretch",
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  codeInput: {
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    textAlign: "center",
    backgroundColor: COLORS.background,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.darkGray,
  },
  redeemButton: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  redeemButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
});
