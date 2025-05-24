import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

import {
  MAX_TOTAL_CHARACTERS,
  validateFile,
  validateTotalLimits,
  readFileContent,
  formatFileSize,
  getTotalCharacters,
} from "@/app/utils/flashcardUtils";
import { UploadedFile, FileUploadModalProps } from "@/app/types/flashcardTypes";
import COLORS from "@/app/constants/colors";
import { logger } from "@/app/utils/logger";

export default function FileUploadModal({
  visible,
  onClose,
  onGenerate,
  isGenerating = false,
}: FileUploadModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/plain", "text/markdown", "text/csv"],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const newFiles: UploadedFile[] = [];
      const fileErrors: string[] = [];

      for (const file of result.assets) {
        const validationError = validateFile(file);
        if (validationError) {
          fileErrors.push(validationError);
          continue;
        }

        try {
          const content = await readFileContent(file);
          newFiles.push({
            name: file.name,
            uri: file.uri,
            size: file.size || content.length,
            type: file.mimeType || "text/plain",
            content,
          });
        } catch (error) {
          fileErrors.push(
            `Failed to read "${file.name}": ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }

      if (fileErrors.length > 0) {
        Alert.alert("File Upload Errors", fileErrors.join("\n\n"));
      }

      if (newFiles.length > 0) {
        const updatedFiles = [...uploadedFiles, ...newFiles];
        const totalErrors = validateTotalLimits(updatedFiles);

        setUploadedFiles(updatedFiles);
        setErrors(totalErrors);
      }
    } catch (error) {
      logger.error("Error uploading files:", error);
      Alert.alert("Upload Error", "Failed to upload files. Please try again.");
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updatedFiles);
    setErrors(validateTotalLimits(updatedFiles));
  };

  const handleGenerate = () => {
    if (uploadedFiles.length === 0) {
      Alert.alert(
        "No Files",
        "Please upload at least one file to generate flashcards."
      );
      return;
    }

    if (errors.length > 0) {
      Alert.alert(
        "Validation Errors",
        "Please fix the errors before generating  flashcards."
      );
      return;
    }

    onGenerate(uploadedFiles);
  };

  const handleClose = () => {
    setUploadedFiles([]);
    setErrors([]);
    onClose();
  };

  const canGenerate =
    uploadedFiles.length > 0 && errors.length === 0 && !isGenerating;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Upload Files for AI Generation</Text>
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.darkGray} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Upload Requirements:</Text>
            <Text style={styles.infoText}>
              • Allowed types: .txt, .md, .csv
            </Text>
            <Text style={styles.infoText}>
              • Maximum {MAX_TOTAL_CHARACTERS.toLocaleString()} characters
              combined
            </Text>
          </View>

          <Pressable style={styles.uploadButton} onPress={handleFileUpload}>
            <Ionicons
              name="cloud-upload-outline"
              size={32}
              color={COLORS.primary}
            />
            <Text style={styles.uploadButtonText}>Upload Files</Text>
            <Text style={styles.uploadButtonSubtext}>
              Tap to select files from your device
            </Text>
          </Pressable>

          {errors.length > 0 && (
            <View style={styles.errorContainer}>
              {errors.map((error, index) => (
                <View key={index} style={styles.errorItem}>
                  <Ionicons name="warning" size={16} color="#FF3B30" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ))}
            </View>
          )}

          {uploadedFiles.length > 0 && (
            <View style={styles.filesSection}>
              <View style={styles.filesSectionHeader}>
                <Text style={styles.filesSectionTitle}>
                  Uploaded Files ({uploadedFiles.length})
                </Text>
                <Text style={styles.totalStats}>
                  {getTotalCharacters(uploadedFiles).toLocaleString()} chars
                </Text>
              </View>

              {uploadedFiles.map((file, index) => (
                <View key={index} style={styles.fileItem}>
                  <View style={styles.fileInfo}>
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color={COLORS.primary}
                    />
                    <View style={styles.fileDetails}>
                      <Text style={styles.fileName} numberOfLines={1}>
                        {file.name}
                      </Text>
                      <Text style={styles.fileSize}>
                        {formatFileSize(file.size)} •{" "}
                        {file.content?.length.toLocaleString() || 0} chars
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => removeFile(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[
              styles.generateButton,
              !canGenerate && styles.generateButtonDisabled,
            ]}
            onPress={handleGenerate}
            disabled={!canGenerate}
          >
            {isGenerating ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color={COLORS.white} />
                <Text style={styles.generateButtonText}>
                  Generate Flashcards
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  infoSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  uploadButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 32,
    alignItems: "center",
    marginBottom: 16,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginTop: 8,
  },
  uploadButtonSubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    marginLeft: 8,
    flex: 1,
  },
  filesSection: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
  },
  filesSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  filesSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  totalStats: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  fileItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
  },
  fileSize: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  generateButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
