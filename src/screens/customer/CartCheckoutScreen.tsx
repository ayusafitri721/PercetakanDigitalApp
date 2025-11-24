// screens/customer/CartCheckoutScreen.tsx
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
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  Asset,
} from 'react-native-image-picker';

import OrderStepDelivery from './components/OrderStepDelivery';
import OrderStepPayment from './components/OrderStepPayment';
import PriceSummary from './components/PriceSummary';
import { useCart } from './contexts/CartContext';
import { processCheckout } from '../../services/checkoutService';
import { CurrentUser } from '../../types/user.types';

interface UploadedFile {
  uri: string;
  name: string;
  type: string;
  size: number;
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



interface CartCheckoutScreenProps {
  onBack: () => void;
  onCheckoutSuccess: (orderId: number, kodeOrder: string) => void;
  userData?: CurrentUser | null; // ✅ Ganti dari UserData ke CurrentUser
}

export default function CartCheckoutScreen({
  onBack,
  onCheckoutSuccess,
  userData,
}: CartCheckoutScreenProps) {
  // ✅ SEMUA HOOKS DI ATAS, SEBELUM CONDITIONAL LOGIC
  const { cartOrder, cartItems, cartCount, clearCart } = useCart();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentProof, setPaymentProof] = useState<UploadedFile | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

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

  // ✅ Load user data dari prop
  useEffect(() => {
    console.log('📥 CartCheckoutScreen - userData received:', userData);
    if (userData) {
      setCurrentUser(userData);
      setOrderDetails(prev => ({
        ...prev,
        recipientName: userData.nama || '',
        recipientPhone: userData.no_telepon || '',
        shippingAddress: userData.alamat || '',
        city: userData.kota || '',
        province: userData.provinsi || '',
      }));
    }
  }, [userData]);

  const updateDetails = (updates: Partial<OrderDetails>) => {
    setOrderDetails(prev => ({ ...prev, ...updates }));
  };

  // ✅ Handler untuk update user address dari child component
  const handleUpdateUserAddress = (updatedUser: CurrentUser) => {
    console.log('🔄 Parent received updated user data:', updatedUser);
    setCurrentUser(updatedUser);

    // Update SEMUA field di orderDetails
    setOrderDetails(prev => ({
      ...prev,
      recipientName: updatedUser.nama || prev.recipientName,
      recipientPhone: updatedUser.no_telepon || prev.recipientPhone,
      shippingAddress: updatedUser.alamat || prev.shippingAddress,
      city: updatedUser.kota || prev.city,
      province: updatedUser.provinsi || prev.province,
    }));
  };

  // ============================================
  // IMAGE PICKER
  // ============================================
  const handlePickPaymentProof = () => {
    Alert.alert('Upload Bukti Pembayaran', 'Pilih sumber gambar', [
      { text: 'Kamera 📷', onPress: openCamera },
      { text: 'Galeri 🖼️', onPress: openGallery },
      { text: 'Batal', style: 'cancel' },
    ]);
  };

  const openCamera = () => {
    launchCamera(
      { mediaType: 'photo', quality: 0.8, maxWidth: 1024, maxHeight: 1024 },
      handleImageResponse,
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8, maxWidth: 1024, maxHeight: 1024 },
      handleImageResponse,
    );
  };

  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) return;
    if (response.errorCode) {
      Alert.alert('Error', response.errorMessage || 'Gagal mengambil gambar');
      return;
    }
    if (response.assets && response.assets.length > 0) {
      const asset: Asset = response.assets[0];
      setPaymentProof({
        uri: asset.uri || '',
        name: asset.fileName || `payment_proof_${Date.now()}.jpg`,
        type: asset.type || 'image/jpeg',
        size: asset.fileSize || 0,
      });
    }
  };

  const handleRemovePaymentProof = () => setPaymentProof(null);

  // ============================================
  // VALIDATION
  // ============================================
  const validateStep1 = (): boolean => {
    if (orderDetails.deliveryMethod === 'pickup') return true;
    if (!orderDetails.recipientName.trim()) {
      Alert.alert('Perhatian', 'Nama penerima harus diisi');
      return false;
    }
    if (!orderDetails.recipientPhone.trim()) {
      Alert.alert('Perhatian', 'Nomor telepon harus diisi');
      return false;
    }
    if (!orderDetails.shippingAddress.trim()) {
      Alert.alert('Perhatian', 'Alamat lengkap harus diisi');
      return false;
    }
    if (!orderDetails.city.trim()) {
      Alert.alert('Perhatian', 'Kota harus diisi');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (orderDetails.deliveryMethod === 'cod') return true;
    if (!orderDetails.paymentMethod) {
      Alert.alert('Perhatian', 'Pilih metode pembayaran');
      return false;
    }
    if (!paymentProof) {
      Alert.alert('Perhatian', 'Upload bukti pembayaran');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
    } else {
      handleSubmitCheckout();
    }
  };

  const handleBack = () => {
    if (currentStep === 1) onBack();
    else setCurrentStep(currentStep - 1);
  };

  // ============================================
  // ✅ SUBMIT CHECKOUT - KIRIM KE DATABASE
  // ============================================
  const handleSubmitCheckout = async () => {
    if (!validateStep2()) return;

    // ✅ FIX: Gunakan currentUser.id_user
    if (!currentUser?.id_user) {
      Alert.alert('Error', 'Data user tidak ditemukan. Silakan login ulang.');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      Alert.alert('Error', 'Keranjang kosong');
      return;
    }

    setLoading(true);

    try {
      const subtotal = cartOrder?.subtotal || cartOrder?.total_harga || 0;
      const shippingCost = orderDetails.shippingCost;
      const total = subtotal + shippingCost;

      const mappedItems = cartItems.map((item: any) => ({
        id_product: item.product?.id_product || item.id_product,
        nama_product: item.product?.nama_product || item.nama_product,
        ukuran: item.ukuran || item.size || 'Standard',
        jumlah: item.jumlah || item.quantity || 1,
        harga_satuan: item.harga_satuan || item.price || 0,
        subtotal: item.subtotal || 0,
        keterangan: item.keterangan || item.notes || '',
        designFile: item.designFile || null,
      }));

      const checkoutData = {
        id_user: parseInt(currentUser.id_user), // ✅ Parse ke number
        catatan_pelanggan: '',
        kecepatan_pengerjaan: 'normal',
        delivery_method: orderDetails.deliveryMethod,
        recipient_name: orderDetails.recipientName,
        recipient_phone: orderDetails.recipientPhone,
        shipping_address: orderDetails.shippingAddress,
        city: orderDetails.city,
        province: orderDetails.province,
        shipping_cost: shippingCost,
        payment_method: orderDetails.paymentMethod,
        payment_proof: paymentProof,
        items: mappedItems,
        subtotal,
        total,
      };

      console.log('🚀 Checkout data:', checkoutData);

      const result = await processCheckout(checkoutData);

      if (result.success && result.orderId && result.kodeOrder) {
        await clearCart();

        Alert.alert(
          'Checkout Berhasil! 🎉',
          `Kode Order: ${result.kodeOrder}\n\nPesanan Anda sedang diproses.`,
          [
            {
              text: 'OK',
              onPress: () =>
                onCheckoutSuccess(result.orderId!, result.kodeOrder!),
            },
          ],
        );
      } else {
        throw new Error(result.message || 'Checkout gagal');
      }
    } catch (error: any) {
      console.error('❌ Checkout error:', error);
      Alert.alert('Error', error.message || 'Terjadi kesalahan saat checkout');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDER - EARLY RETURN SETELAH SEMUA HOOKS
  // ============================================
  if (!cartOrder) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Keranjang kosong</Text>
        </View>
      </View>
    );
  }

  const subtotal = cartOrder.subtotal || cartOrder.total_harga || 0;
  const shippingCost = orderDetails.shippingCost;
  const total = subtotal + shippingCost;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {currentStep === 1 ? '🚚 Pengiriman' : '💳 Pembayaran'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(currentStep / 2) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>Step {currentStep} dari 2</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.customerCard}>
          <Text style={styles.customerLabel}>👤 Customer:</Text>
          <Text style={styles.customerName}>
            {currentUser?.nama || 'Loading...'}
          </Text>
          <Text style={styles.customerEmail}>{currentUser?.email || '-'}</Text>
          <Text style={styles.customerPhone}>
            📞 {currentUser?.no_telepon || '-'}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📦 Ringkasan Pesanan</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Jumlah Item:</Text>
            <Text style={styles.summaryValue}>{cartCount} item</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>
              Rp {subtotal.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>

        {currentStep === 1 ? (
          <OrderStepDelivery
            orderDetails={orderDetails}
            onUpdateDetails={updateDetails}
            currentUser={currentUser}
            loadingUser={loadingUser}
            onUpdateUserAddress={handleUpdateUserAddress}
          />
        ) : (
          <OrderStepPayment
            orderDetails={orderDetails}
            paymentProof={paymentProof}
            onPickPaymentProof={handlePickPaymentProof}
            onRemovePaymentProof={handleRemovePaymentProof}
            onUpdateDetails={updateDetails}
          />
        )}

        <PriceSummary
          subtotal={subtotal}
          shippingCost={shippingCost}
          total={total}
          color="#4F46E5"
        />
        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          <View style={styles.bottomBarLeft}>
            <Text style={styles.bottomBarLabel}>Total Pembayaran</Text>
            <Text style={styles.bottomBarPrice}>
              Rp {total.toLocaleString('id-ID')}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.nextButton, loading && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.nextButtonText}>
                {currentStep === 1 ? 'Lanjut 💳' : 'Konfirmasi ✅'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { fontSize: 20, color: '#1F2937', fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  progressContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: { height: '100%', backgroundColor: '#4F46E5', borderRadius: 3 },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  scrollView: { flex: 1 },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '600',
  },
  customerCard: {
    backgroundColor: '#EEF2FF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  customerLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  customerEmail: { fontSize: 13, color: '#6B7280', marginBottom: 2 },
  customerPhone: { fontSize: 13, color: '#6B7280' },
  summaryCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    borderLeftWidth: 5,
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
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
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
  bottomBarLeft: { flex: 1 },
  bottomBarLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  bottomBarPrice: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  nextButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    elevation: 3,
  },
  nextButtonDisabled: { opacity: 0.6 },
  nextButtonText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
