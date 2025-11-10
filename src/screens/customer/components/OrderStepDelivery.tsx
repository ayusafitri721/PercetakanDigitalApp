// src/screens/customer/components/OrderStepDelivery.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';

interface OrderDetails {
  deliveryMethod: 'cod' | 'transfer_delivery' | 'pickup';
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  city: string;
  province: string;
  shippingCost: number; // Tanpa tanda '?'
}
interface OrderStepDeliveryProps {
  orderDetails: OrderDetails;
  onUpdateDetails: (details: Partial<OrderDetails>) => void;
}

export default function OrderStepDelivery({
  orderDetails,
  onUpdateDetails,
}: OrderStepDeliveryProps) {
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚚 Metode Pengiriman</Text>

        <TouchableOpacity
          style={[
            styles.deliveryCard,
            orderDetails.deliveryMethod === 'cod' && styles.deliveryCardActive,
          ]}
          onPress={() =>
            onUpdateDetails({ deliveryMethod: 'cod', shippingCost: 15000 })
          }
        >
          <Text style={styles.deliveryEmoji}>🚚💵</Text>
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryTitle}>Diantar (COD)</Text>
            <Text style={styles.deliverySubtitle}>Bayar saat terima</Text>
            <Text style={styles.deliveryPrice}>+ Rp 15.000</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.deliveryCard,
            orderDetails.deliveryMethod === 'transfer_delivery' &&
              styles.deliveryCardActive,
          ]}
          onPress={() =>
            onUpdateDetails({
              deliveryMethod: 'transfer_delivery',
              shippingCost: 15000,
            })
          }
        >
          <Text style={styles.deliveryEmoji}>🚚💳</Text>
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryTitle}>Diantar (Transfer)</Text>
            <Text style={styles.deliverySubtitle}>
              Transfer dulu, lalu dikirim
            </Text>
            <Text style={styles.deliveryPrice}>+ Rp 15.000</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.deliveryCard,
            orderDetails.deliveryMethod === 'pickup' &&
              styles.deliveryCardActive,
          ]}
          onPress={() =>
            onUpdateDetails({ deliveryMethod: 'pickup', shippingCost: 0 })
          }
        >
          <Text style={styles.deliveryEmoji}>🏪</Text>
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryTitle}>Ambil di Toko</Text>
            <Text style={styles.deliverySubtitle}>
              Transfer dulu, ambil sendiri
            </Text>
            <Text style={styles.deliveryPrice}>Gratis ongkir</Text>
          </View>
        </TouchableOpacity>
      </View>

      {orderDetails.deliveryMethod !== 'pickup' ? (
        <>
          <View style={styles.section}>
            <Text style={styles.label}>Nama Penerima *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nama lengkap penerima"
              placeholderTextColor="#9CA3AF"
              value={orderDetails.recipientName}
              onChangeText={t => onUpdateDetails({ recipientName: t })}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Nomor Telepon *</Text>
            <TextInput
              style={styles.input}
              placeholder="08xxxxxxxxxx"
              placeholderTextColor="#9CA3AF"
              value={orderDetails.recipientPhone}
              onChangeText={t => onUpdateDetails({ recipientPhone: t })}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Alamat Lengkap *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan..."
              placeholderTextColor="#9CA3AF"
              value={orderDetails.shippingAddress}
              onChangeText={t => onUpdateDetails({ shippingAddress: t })}
              multiline
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Kota *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nama kota"
              placeholderTextColor="#9CA3AF"
              value={orderDetails.city}
              onChangeText={t => onUpdateDetails({ city: t })}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Provinsi (Opsional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Nama provinsi"
              placeholderTextColor="#9CA3AF"
              value={orderDetails.province}
              onChangeText={t => onUpdateDetails({ province: t })}
            />
          </View>
        </>
      ) : (
        <View style={styles.infoCard}>
          <Text style={styles.infoEmoji}>🏪</Text>
          <Text style={styles.infoTitle}>Ambil di Toko</Text>
          <Text style={styles.infoText}>
            Pesanan akan siap diambil setelah selesai diproduksi. Anda akan
            menerima notifikasi.
          </Text>
        </View>
      )}
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
  deliveryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    alignItems: 'center',
  },
  deliveryCardActive: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  deliveryEmoji: { fontSize: 36, marginRight: 16 },
  deliveryInfo: { flex: 1 },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  deliverySubtitle: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  deliveryPrice: { fontSize: 13, fontWeight: '600', color: '#4F46E5' },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
  },
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
  infoEmoji: { fontSize: 48, marginBottom: 12 },
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
