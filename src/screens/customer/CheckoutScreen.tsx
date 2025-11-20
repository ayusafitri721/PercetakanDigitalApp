// screens/customer/CheckoutScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useCart } from './contexts/CartContext';
import OrderStepDelivery from './components/OrderStepDelivery';
import OrderStepPayment from './components/OrderStepPayment';
import OrderProgress from './components/OrderProgress';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CheckoutScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

interface OrderDetails {
  deliveryMethod: 'cod' | 'transfer_delivery' | 'pickup';
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  city: string;
  province: string;
  shippingCost: number;
  paymentMethod: 'transfer' | 'qris' | '';
}

export default function CheckoutScreen({
  onBack,
  onSuccess,
}: CheckoutScreenProps) {
  const { items, totalPrice, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [paymentProof, setPaymentProof] = useState<any>(null);

  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    deliveryMethod: 'cod',
    recipientName: '',
    recipientPhone: '',
    shippingAddress: '',
    city: '',
    province: '',
    shippingCost: 15000,
    paymentMethod: '',
  });

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('@user_data');
      if (userData) {
        const parsed = JSON.parse(userData);
        setCurrentUser(parsed.user);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const updateDetails = (updates: Partial<OrderDetails>) => {
    setOrderDetails(prev => ({ ...prev, ...updates }));
  };

  const handlePickImage = async () => {
    // Implement image picker for payment proof
    Alert.alert('Info', 'Upload bukti pembayaran (implementasi image picker)');
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (orderDetails.deliveryMethod !== 'pickup') {
        if (!orderDetails.recipientName.trim()) {
          Alert.alert('Validasi', 'Nama penerima harus diisi');
          return false;
        }
        if (!orderDetails.recipientPhone.trim()) {
          Alert.alert('Validasi', 'Nomor telepon harus diisi');
          return false;
        }
        if (!orderDetails.shippingAddress.trim()) {
          Alert.alert('Validasi', 'Alamat pengiriman harus diisi');
          return false;
        }
        if (!orderDetails.city.trim()) {
          Alert.alert('Validasi', 'Kota harus diisi');
          return false;
        }
      }
      return true;
    }

    if (step === 2) {
      if (orderDetails.deliveryMethod === 'cod') {
        return true;
      }
      if (!orderDetails.paymentMethod) {
        Alert.alert('Validasi', 'Pilih metode pembayaran');
        return false;
      }
      if (!paymentProof) {
        Alert.alert('Validasi', 'Upload bukti pembayaran');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1 && orderDetails.deliveryMethod === 'cod') {
        handleSubmitOrder();
      } else {
        setCurrentStep(2);
      }
    }
  };

  const handleSubmitOrder = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'User tidak ditemukan');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Error', 'Keranjang kosong');
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement API call untuk submit order dari cart
      // Simulasi delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear cart after successful order
      clearCart();

      setLoading(false);

      const successMsg = `
✅ Pesanan berhasil dibuat!

📦 Total Item: ${items.length}
💰 Total: Rp ${calculateTotal().toLocaleString('id-ID')}

${
  orderDetails.deliveryMethod === 'cod'
    ? '💵 Pembayaran: COD (Bayar saat terima)'
    : '💳 Pembayaran: Transfer'
}

Pesanan akan segera diproses oleh admin.
      `.trim();

      Alert.alert('Berhasil', successMsg, [{ text: 'OK', onPress: onSuccess }]);
    } catch (error: any) {
      setLoading(false);
      console.error('Submit order error:', error);
      Alert.alert('Gagal', error.message || 'Pesanan gagal dibuat');
    }
  };

  const calculateTotal = (): number => {
    return totalPrice + orderDetails.shippingCost;
  };

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Keranjang Kosong</Text>
          <Text style={styles.emptyText}>Tidak ada item untuk checkout.</Text>
          <TouchableOpacity style={styles.backToCartButton} onPress={onBack}>
            <Text style={styles.backToCartButtonText}>← Kembali</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.step, currentStep >= 1 && styles.stepActive]}>
            <Text
              style={[
                styles.stepText,
                currentStep >= 1 && styles.stepTextActive,
              ]}
            >
              1
            </Text>
          </View>
          <View style={[styles.line, currentStep >= 2 && styles.lineActive]} />
          <View style={[styles.step, currentStep >= 2 && styles.stepActive]}>
            <Text
              style={[
                styles.stepText,
                currentStep >= 2 && styles.stepTextActive,
              ]}
            >
              2
            </Text>
          </View>
        </View>
        <View style={styles.labels}>
          <Text style={styles.label}>Pengiriman</Text>
          <Text style={styles.label}>Pembayaran</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📦 Ringkasan Pesanan</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Item:</Text>
            <Text style={styles.summaryValue}>{items.length} produk</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>
              Rp {totalPrice.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>

        {/* Steps */}
        {currentStep === 1 && (
          <OrderStepDelivery
            orderDetails={orderDetails}
            onUpdateDetails={updateDetails}
          />
        )}

        {currentStep === 2 && (
          <OrderStepPayment
            orderDetails={orderDetails}
            paymentProof={paymentProof}
            onPickPaymentProof={handlePickImage}
            onRemovePaymentProof={() => setPaymentProof(null)}
            onUpdateDetails={updateDetails}
          />
        )}

        {/* Price Summary */}
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal:</Text>
            <Text style={styles.priceValue}>
              Rp {totalPrice.toLocaleString('id-ID')}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Ongkir:</Text>
            <Text style={styles.priceValue}>
              Rp {orderDetails.shippingCost.toLocaleString('id-ID')}
            </Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              Rp {calculateTotal().toLocaleString('id-ID')}
            </Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          {currentStep === 2 && (
            <TouchableOpacity
              style={styles.backStepButton}
              onPress={() => setCurrentStep(1)}
            >
              <Text style={styles.backStepButtonText}>← Kembali</Text>
            </TouchableOpacity>
          )}
          <View style={styles.bottomBarRight}>
            <View style={styles.bottomBarLeft}>
              <Text style={styles.bottomBarLabel}>Total</Text>
              <Text style={styles.bottomBarPrice}>
                Rp {calculateTotal().toLocaleString('id-ID')}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={
                currentStep === 2 ||
                (currentStep === 1 && orderDetails.deliveryMethod === 'cod')
                  ? handleSubmitOrder
                  : handleNext
              }
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {currentStep === 2 ||
                  (currentStep === 1 && orderDetails.deliveryMethod === 'cod')
                    ? 'Buat Pesanan →'
                    : 'Lanjut →'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { fontSize: 24, color: '#1F2937' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  progressContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  step: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActive: { backgroundColor: '#4F46E5' },
  stepText: { fontSize: 14, fontWeight: '700', color: '#9CA3AF' },
  stepTextActive: { color: '#FFF' },
  line: {
    width: 80,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  lineActive: { backgroundColor: '#4F46E5' },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: { fontSize: 80, marginBottom: 20 },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  backToCartButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  backToCartButtonText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  scrollView: { flex: 1 },
  summaryCard: {
    backgroundColor: '#EEF2FF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  priceCard: {
    backgroundColor: '#4F46E5',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: { fontSize: 14, color: '#FFF', opacity: 0.9 },
  priceValue: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  totalValue: { fontSize: 22, fontWeight: '700', color: '#FFF' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bottomBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backStepButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  backStepButtonText: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  bottomBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  bottomBarLeft: { flex: 1 },
  bottomBarLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  bottomBarPrice: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  submitButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    elevation: 3,
  },
  submitButtonDisabled: { opacity: 0.6, elevation: 0 },
  submitButtonText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
