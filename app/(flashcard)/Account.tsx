import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthenticator } from "@aws-amplify/ui-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { updatePassword } from "aws-amplify/auth";

import EditHeader from "../components/common/EditHeader";
import useUserStore from "@/app/stores/userStore";
import useAchievementStore from "@/app/stores/achievementStore";
import useReviewStore from "@/app/stores/reviewStore";
import { zustandStorage } from "@/app/stores/mmkv";
import COLORS from "@/app/constants/colors";
import DeleteAccountModal from "@/app/components/auth/DeleteAccountModal";

export default function Account() {
  const { signOut } = useAuthenticator();
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleLogOut = () => {
    // Clear all storage and state
    zustandStorage.removeItem("user-storage");
    zustandStorage.removeItem("achievement-storage");

    useUserStore.getState().clearUser();
    useAchievementStore.getState().reset();
    useReviewStore.getState().reset();

    // Clear the query cache
    queryClient.clear();
    queryClient.invalidateQueries();

    signOut();
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const handleChangePassword = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      Alert.alert("Error", "Please fill in all password fields.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters long.");
      return;
    }

    setIsChangingPassword(true);

    try {
      await updatePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      Alert.alert("Success", "Your password has been changed successfully.", [
        {
          text: "OK",
          onPress: () => {
            setShowPasswordChange(false);
            setPasswordData({
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
          },
        },
      ]);
    } catch (error) {
      console.error("Error changing password:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to change password. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <EditHeader
        title="Account Settings"
        rightButtonText="Log Out"
        rightButtonIcon="log-out-outline"
        onRightButtonPress={handleLogOut}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={COLORS.darkGray} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>
                  {user?.email || "Not available"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Password Change Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>

          {!showPasswordChange ? (
            <Pressable
              style={styles.actionButton}
              onPress={() => setShowPasswordChange(true)}
            >
              <View style={styles.actionContent}>
                <Ionicons name="key-outline" size={24} color={COLORS.primary} />
                <Text style={styles.actionText}>Change Password</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.darkGray}
              />
            </Pressable>
          ) : (
            <View style={styles.passwordChangeContainer}>
              {/* Current Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <View style={styles.passwordInputWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    value={passwordData.currentPassword}
                    onChangeText={(text) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        currentPassword: text,
                      }))
                    }
                    secureTextEntry={!showPasswords.current}
                    placeholder="Enter current password"
                    placeholderTextColor={COLORS.darkGray}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => togglePasswordVisibility("current")}
                  >
                    <Ionicons
                      name={showPasswords.current ? "eye-off" : "eye"}
                      size={20}
                      color={COLORS.darkGray}
                    />
                  </Pressable>
                </View>
              </View>

              {/* New Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={styles.passwordInputWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    value={passwordData.newPassword}
                    onChangeText={(text) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: text,
                      }))
                    }
                    secureTextEntry={!showPasswords.new}
                    placeholder="Enter new password (min 6 characters)"
                    placeholderTextColor={COLORS.darkGray}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => togglePasswordVisibility("new")}
                  >
                    <Ionicons
                      name={showPasswords.new ? "eye-off" : "eye"}
                      size={20}
                      color={COLORS.darkGray}
                    />
                  </Pressable>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <View style={styles.passwordInputWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    value={passwordData.confirmPassword}
                    onChangeText={(text) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: text,
                      }))
                    }
                    secureTextEntry={!showPasswords.confirm}
                    placeholder="Confirm new password"
                    placeholderTextColor={COLORS.darkGray}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => togglePasswordVisibility("confirm")}
                  >
                    <Ionicons
                      name={showPasswords.confirm ? "eye-off" : "eye"}
                      size={20}
                      color={COLORS.darkGray}
                    />
                  </Pressable>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.passwordActionButtons}>
                <Pressable
                  style={[styles.passwordButton, styles.cancelPasswordButton]}
                  onPress={() => {
                    setShowPasswordChange(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  disabled={isChangingPassword}
                >
                  <Text style={styles.cancelPasswordButtonText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={[styles.passwordButton, styles.savePasswordButton]}
                  onPress={handleChangePassword}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={styles.savePasswordButtonText}>Save</Text>
                  )}
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Delete Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delete Account</Text>
          <Text style={styles.deleteWarning}>
            This action is permanent and cannot be undone. All your data will be
            erased.
          </Text>

          <Pressable style={styles.deleteButton} onPress={handleDeleteAccount}>
            <View style={styles.actionContent}>
              <Ionicons name="trash-outline" size={24} color={COLORS.white} />
              <Text style={styles.deleteButtonText}>Delete My Account</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>

      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
    fontWeight: "500",
  },
  passwordChangeContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
    fontWeight: "500",
  },
  passwordInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 48,
  },
  eyeButton: {
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  passwordActionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  passwordButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  cancelPasswordButton: {
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  savePasswordButton: {
    backgroundColor: COLORS.primary,
  },
  cancelPasswordButtonText: {
    fontSize: 16,
    color: COLORS.darkGray,
    fontWeight: "600",
  },
  savePasswordButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: "600",
  },
  deleteWarning: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 16,
    lineHeight: 20,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: "600",
    marginLeft: 12,
  },
});
