// src/screens/customer/components/OrderStepDetail.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import UploadFileCard from './UploadFileCard';

interface UploadedFile {
  uri: string;
  name: string;
  type: string;
  size: number;
}

interface OrderDetails {
  material: string;
  size: string;
  quantity: number;
  speed: 'normal' | 'express';
  notes: string;
}

interface OrderStepDetailProps {
  uploadedFile: UploadedFile | null;
  orderDetails: OrderDetails;
  service: any;
  onPickImage: () => void;
  onRemoveFile: () => void;
  onUpdateDetails: (details: Partial<OrderDetails>) => void;
  getMaterialOptions: () => string[];
  getSizeOptions: () => string[];
}

export default function OrderStepDetail({
  uploadedFile,
  orderDetails,
  service,
  onPickImage,
  onRemoveFile,
  onUpdateDetails,
  getMaterialOptions,
  getSizeOptions,
}: OrderStepDetailProps) {
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📁 Upload Desain</Text>
        <UploadFileCard
          file={uploadedFile}
          onPick={onPickImage}
          onRemove={onRemoveFile}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Jenis Material *</Text>
        <View style={styles.optionsRow}>
          {getMaterialOptions().map(mat => (
            <TouchableOpacity
              key={mat}
              style={[
                styles.optionButton,
                orderDetails.material === mat && styles.optionButtonActive,
              ]}
              onPress={() => onUpdateDetails({ material: mat })}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  orderDetails.material === mat &&
                    styles.optionButtonTextActive,
                ]}
              >
                {mat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Ukuran *</Text>
        <View style={styles.optionsRow}>
          {getSizeOptions().map(size => (
            <TouchableOpacity
              key={size}
              style={[
                styles.optionButton,
                orderDetails.size === size && styles.optionButtonActive,
              ]}
              onPress={() => onUpdateDetails({ size })}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  orderDetails.size === size && styles.optionButtonTextActive,
                ]}
              >
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Jumlah ({service.satuan}) *</Text>
        <View style={styles.quantityRow}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() =>
              onUpdateDetails({
                quantity: Math.max(1, orderDetails.quantity - 1),
              })
            }
          >
            <Text style={styles.quantityButtonText}>−</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.quantityInput}
            value={orderDetails.quantity.toString()}
            onChangeText={t => onUpdateDetails({ quantity: parseInt(t) || 1 })}
            keyboardType="number-pad"
          />
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() =>
              onUpdateDetails({ quantity: orderDetails.quantity + 1 })
            }
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Kecepatan *</Text>
        <View style={styles.speedRow}>
          <TouchableOpacity
            style={[
              styles.speedCard,
              orderDetails.speed === 'normal' && styles.speedCardActive,
            ]}
            onPress={() => onUpdateDetails({ speed: 'normal' })}
          >
            <Text style={styles.speedEmoji}>🕐</Text>
            <Text style={styles.speedTitle}>Normal</Text>
            <Text style={styles.speedSubtitle}>3-5 hari</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.speedCard,
              orderDetails.speed === 'express' && styles.speedCardActive,
            ]}
            onPress={() => onUpdateDetails({ speed: 'express' })}
          >
            <Text style={styles.speedEmoji}>⚡</Text>
            <Text style={styles.speedTitle}>Express</Text>
            <Text style={styles.speedSubtitle}>1-2 hari (+50%)</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Catatan (Opsional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Tambahkan catatan..."
          placeholderTextColor="#9CA3AF"
          value={orderDetails.notes}
          onChangeText={t => onUpdateDetails({ notes: t })}
          multiline
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 20, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optionButton: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  optionButtonActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  optionButtonText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  optionButtonTextActive: { color: '#FFF' },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  quantityButton: {
    width: 48,
    height: 48,
    backgroundColor: '#FFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  quantityButtonText: { fontSize: 22, fontWeight: '600', color: '#1F2937' },
  quantityInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFF',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  speedRow: { flexDirection: 'row', gap: 12 },
  speedCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  speedCardActive: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  speedEmoji: { fontSize: 32, marginBottom: 8 },
  speedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  speedSubtitle: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
  textArea: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
