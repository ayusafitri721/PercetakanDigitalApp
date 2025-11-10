// src/screens/customer/components/UploadFileCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

interface UploadedFile {
  uri: string;
  name: string;
  type: string;
  size: number;
}

interface UploadFileCardProps {
  file: UploadedFile | null;
  onPick: () => void;
  onRemove: () => void;
  title?: string;
  icon?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

export default function UploadFileCard({
  file,
  onPick,
  onRemove,
  title = 'Pilih Gambar',
  icon = '🖼️',
}: UploadFileCardProps) {
  if (file) {
    return (
      <View style={styles.uploadedCard}>
        <View style={styles.uploadedContent}>
          <Image
            source={{ uri: file.uri }}
            style={styles.preview}
            resizeMode="cover"
          />
          <View style={styles.fileDetails}>
            <Text style={styles.fileName} numberOfLines={1}>
              {file.name}
            </Text>
            <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <Text style={styles.removeButtonText}>🗑️ Hapus</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.uploadButton} onPress={onPick}>
      <Text style={styles.uploadIcon}>{icon}</Text>
      <Text style={styles.uploadText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  uploadButton: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 40,
    alignItems: 'center',
  },
  uploadIcon: { fontSize: 48, marginBottom: 12 },
  uploadText: { fontSize: 16, fontWeight: '600', color: '#4F46E5' },
  uploadedCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  uploadedContent: { flexDirection: 'row', marginBottom: 12 },
  preview: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  fileDetails: { flex: 1, justifyContent: 'center' },
  fileName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  fileSize: { fontSize: 13, color: '#6B7280' },
  removeButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  removeButtonText: { fontSize: 14, fontWeight: '600', color: '#EF4444' },
});
