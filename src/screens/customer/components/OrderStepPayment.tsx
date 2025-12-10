// src/screens/customer/components/OrderStepPayment.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import UploadFileCard from './UploadFileCard';

interface UploadedFile {
  uri: string;
  name: string;
  type: string;
  size: number;
}

interface OrderDetails {
  deliveryMethod: 'cod' | 'transfer_delivery' | 'pickup';
  paymentMethod: 'transfer' | 'qris' | '';
}

interface OrderStepPaymentProps {
  orderDetails: OrderDetails;
  paymentProof: UploadedFile | null;
  onPickPaymentProof: () => void;
  onRemovePaymentProof: () => void;
  onUpdateDetails: (details: Partial<OrderDetails>) => void;
}

export default function OrderStepPayment({
  orderDetails,
  paymentProof,
  onPickPaymentProof,
  onRemovePaymentProof,
  onUpdateDetails,
}: OrderStepPaymentProps) {
  if (orderDetails.deliveryMethod === 'cod') {
    return (
      <View style={styles.infoCard}>
        <Icon
          name="checkmark-circle"
          size={48}
          color="#2563EB"
          style={styles.infoIcon}
        />
        <Text style={styles.infoTitle}>Siap Diproses</Text>
        <Text style={styles.infoText}>
          Pesanan akan diproses setelah dikonfirmasi admin. Pembayaran dilakukan
          saat barang diterima.
        </Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Icon name="card-outline" size={18} color="#1F2937" /> Pilih Metode
          Pembayaran
        </Text>

        <TouchableOpacity
          style={[
            styles.paymentCard,
            orderDetails.paymentMethod === 'qris' && styles.paymentCardActive,
          ]}
          onPress={() => onUpdateDetails({ paymentMethod: 'qris' })}
        >
          <Icon
            name="qr-code-outline"
            size={36}
            color={
              orderDetails.paymentMethod === 'qris' ? '#2563EB' : '#6B7280'
            }
          />
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>QRIS</Text>
            <Text style={styles.paymentSubtitle}>Scan barcode untuk bayar</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentCard,
            orderDetails.paymentMethod === 'transfer' &&
              styles.paymentCardActive,
          ]}
          onPress={() => onUpdateDetails({ paymentMethod: 'transfer' })}
        >
          <Icon
            name="business-outline"
            size={36}
            color={
              orderDetails.paymentMethod === 'transfer' ? '#2563EB' : '#6B7280'
            }
          />
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>Transfer Bank</Text>
            <Text style={styles.paymentSubtitle}>
              Transfer ke rekening toko
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {orderDetails.paymentMethod && (
        <View style={styles.paymentInfoCard}>
          {orderDetails.paymentMethod === 'qris' ? (
            <>
              <View style={styles.paymentInfoHeader}>
                <Icon name="qr-code" size={20} color="#1E40AF" />
                <Text style={styles.paymentInfoTitle}> QRIS</Text>
              </View>
              <Text style={styles.paymentInfoText}>
                Scan QRIS di kasir atau minta ke admin
              </Text>
            </>
          ) : (
            <>
              <View style={styles.paymentInfoHeader}>
                <Icon name="business" size={20} color="#1E40AF" />
                <Text style={styles.paymentInfoTitle}> Bank Transfer</Text>
              </View>
              <Text style={styles.paymentInfoText}>BCA: 1234567890</Text>
              <Text style={styles.paymentInfoText}>
                a.n. Percetakan Digital
              </Text>
            </>
          )}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Icon name="image-outline" size={18} color="#1F2937" /> Upload Bukti
          Bayar
        </Text>
        <UploadFileCard
          file={paymentProof}
          onPick={onPickPaymentProof}
          onRemove={onRemovePaymentProof}
          title="Upload Bukti"
          icon="📸"
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
  paymentCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    alignItems: 'center',
  },
  paymentCardActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  paymentEmoji: { fontSize: 36, marginRight: 16 },
  paymentInfo: { flex: 1 },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  paymentSubtitle: { fontSize: 13, color: '#6B7280' },
  paymentInfoCard: {
    backgroundColor: '#DBEAFE',
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  paymentInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentInfoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E40AF',
  },
  paymentInfoText: { fontSize: 14, color: '#1E3A8A', marginBottom: 4 },
  infoCard: {
    backgroundColor: '#DBEAFE',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  infoIcon: { marginBottom: 12 },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#1E3A8A',
    textAlign: 'center',
    lineHeight: 20,
  },
});
