// screens/customer/OrderFormScreen.tsx
import React from 'react';
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

import OrderProgress from './components/OrderProgress';
import OrderStepDetail from './components/OrderStepDetail';
import OrderStepDelivery from './components/OrderStepDelivery';
import OrderStepPayment from './components/OrderStepPayment';
import PriceSummary from './components/PriceSummary';
import { useOrderForm } from './hooks/useOrderForm';
import {
  validateStep,
  submitOrder,
  getSuccessMessage,
} from './utils/orderHelpers';

interface OrderFormScreenProps {
  service: {
    id_product: string;
    nama_product: string;
    nama_category: string;
    deskripsi: string;
    media_cetak: string;
    ukuran_standar: string;
    satuan: string;
    harga_dasar: string;
  } | null;
  onBack: () => void;
}

export default function OrderFormScreen({
  service,
  onBack,
}: OrderFormScreenProps) {
  const {
    uploadedFile,
    setUploadedFile,
    paymentProof,
    setPaymentProof,
    orderDetails,
    updateDetails,
    loading,
    setLoading,
    currentUser,
    loadingUser,
    currentStep,
    setCurrentStep,
    handlePickImage,
    calculatePrice,
    calculateTotal,
    resetForm,
    updateCurrentUser,
  } = useOrderForm(service);

  const getMaterialOptions = (): string[] =>
    service?.media_cetak
      ? service.media_cetak.split(',').map(m => m.trim())
      : ['Standard'];

  const getSizeOptions = (): string[] =>
    service?.ukuran_standar
      ? service.ukuran_standar.split(',').map(s => s.trim())
      : ['Standard'];

  const getIconByCategory = (cat: string): string => {
    const lower = cat.toLowerCase();
    if (lower.includes('dokumen')) return '📄';
    if (lower.includes('banner')) return '🎨';
    if (lower.includes('kaos')) return '👕';
    if (lower.includes('stiker')) return '🏷';
    if (lower.includes('packaging')) return '📦';
    if (lower.includes('foto')) return '📸';
    return '🖨';
  };

  const getColorByCategory = (cat: string): string => {
    const lower = cat.toLowerCase();
    if (lower.includes('dokumen')) return '#4F46E5';
    if (lower.includes('banner')) return '#10B981';
    if (lower.includes('kaos')) return '#F59E0B';
    if (lower.includes('stiker')) return '#EF4444';
    if (lower.includes('packaging')) return '#8B5CF6';
    if (lower.includes('foto')) return '#EC4899';
    return '#6366F1';
  };

  const handleNext = () => {
    if (validateStep(currentStep, orderDetails, uploadedFile, paymentProof)) {
      if (currentStep === 2 && orderDetails.deliveryMethod === 'cod') {
        handleSubmitOrder();
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleSubmitOrder = async () => {
    if (!currentUser || !uploadedFile) {
      Alert.alert('Error', 'Data tidak lengkap');
      return;
    }

    setLoading(true);

    try {
      const { kode_order } = await submitOrder(
        currentUser,
        orderDetails,
        service!,
        uploadedFile,
        paymentProof,
        calculatePrice,
        calculateTotal,
      );

      setLoading(false);
      resetForm();

      const successMsg = getSuccessMessage(
        kode_order,
        currentUser,
        service!,
        orderDetails,
        calculateTotal,
      );

      Alert.alert('Berhasil', successMsg, [
        { text: 'OK', onPress: () => onBack() },
      ]);
    } catch (error: any) {
      setLoading(false);
      console.error('❌ Submit order error:', error);

      console.log('🔥 ERROR RESPONSE:', error.response);
      console.log('🔥 ERROR DATA:', error.response?.data);
      console.log('🔥 ERROR STATUS:', error.response?.status);
      console.log('🔥 ERROR MESSAGE:', error.response?.data?.message);

      let errorMessage = 'Pesanan gagal dibuat.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Gagal', errorMessage);
    }
  };

  if (!service) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Produk tidak ditemukan</Text>
      </View>
    );
  }

  if (loadingUser) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Memuat data user...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>User Tidak Ditemukan</Text>
        <Text style={styles.errorDesc}>
          Session expired. Silakan logout dan login kembali.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={onBack}>
          <Text style={styles.retryButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const icon = getIconByCategory(service.nama_category);
  const color = getColorByCategory(service.nama_category);
  const estimatedPrice = calculatePrice();
  const totalPrice = calculateTotal();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Form Pemesanan</Text>
        <View style={{ width: 40 }} />
      </View>

      <OrderProgress currentStep={currentStep} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.userInfoCard}>
          <Text style={styles.userInfoLabel}>👤 Customer:</Text>
          <Text style={styles.userInfoName}>{currentUser.nama}</Text>
          <Text style={styles.userInfoEmail}>{currentUser.email}</Text>
        </View>

        <View style={[styles.serviceInfoCard, { borderLeftColor: color }]}>
          <Text style={styles.serviceIcon}>{icon}</Text>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{service.nama_product}</Text>
            <Text style={styles.serviceCategory}>{service.nama_category}</Text>
          </View>
        </View>

        {currentStep === 1 && (
          <OrderStepDetail
            uploadedFile={uploadedFile}
            orderDetails={orderDetails}
            service={service}
            onPickImage={() => handlePickImage('design')}
            onRemoveFile={() => setUploadedFile(null)}
            onUpdateDetails={updateDetails}
            getMaterialOptions={getMaterialOptions}
            getSizeOptions={getSizeOptions}
          />
        )}

        {currentStep === 2 && (
          <OrderStepDelivery
            orderDetails={orderDetails}
            onUpdateDetails={updateDetails}
            currentUser={currentUser}
            loadingUser={loadingUser}
            onUpdateUserAddress={updateCurrentUser}
          />
        )}

        {currentStep === 3 && (
          <OrderStepPayment
            orderDetails={orderDetails}
            paymentProof={paymentProof}
            onPickPaymentProof={() => handlePickImage('payment')}
            onRemovePaymentProof={() => setPaymentProof(null)}
            onUpdateDetails={updateDetails}
          />
        )}

        <PriceSummary
          subtotal={estimatedPrice}
          shippingCost={orderDetails.shippingCost}
          total={totalPrice}
          color={color}
        />

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={styles.backStepButton}
              onPress={() => setCurrentStep(currentStep - 1)}
            >
              <Text style={styles.backStepButtonText}>← Kembali</Text>
            </TouchableOpacity>
          )}
          <View style={styles.bottomBarRight}>
            <View style={styles.bottomBarLeft}>
              <Text style={styles.bottomBarLabel}>Total</Text>
              <Text style={styles.bottomBarPrice}>
                Rp {totalPrice.toLocaleString('id-ID')}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (loading || estimatedPrice === 0) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={
                currentStep === 3 ||
                (currentStep === 2 && orderDetails.deliveryMethod === 'cod')
                  ? handleSubmitOrder
                  : handleNext
              }
              disabled={loading || estimatedPrice === 0}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {currentStep === 3 ||
                  (currentStep === 2 && orderDetails.deliveryMethod === 'cod')
                    ? 'Pesan →'
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
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorDesc: {
    fontSize: 14,
    color: '#991B1B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 50,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryButtonText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
  scrollView: { flex: 1 },
  userInfoCard: {
    backgroundColor: '#EEF2FF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  userInfoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  userInfoName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  userInfoEmail: { fontSize: 13, color: '#6B7280' },
  serviceInfoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 5,
  },
  serviceIcon: { fontSize: 40, marginRight: 16 },
  serviceInfo: { flex: 1 },
  serviceName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '500',
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
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
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  submitButtonDisabled: { opacity: 0.6, elevation: 0 },
  submitButtonText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
