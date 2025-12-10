// src/screens/customer/components/OrderStepDelivery.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import API_CONFIG from '../../../config/api';

interface OrderDetails {
  deliveryMethod: 'cod' | 'transfer_delivery' | 'pickup';
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  city: string;
  province: string;
  shippingCost: number;
}

interface CurrentUser {
  id_user: string;
  nama: string;
  email: string;
  role: string;
  no_telepon?: string;
  alamat?: string;
  kota?: string;
  provinsi?: string;
}

interface OrderStepDeliveryProps {
  orderDetails: OrderDetails;
  onUpdateDetails: (details: Partial<OrderDetails>) => void;
  currentUser?: CurrentUser | null;
  loadingUser?: boolean;
  onUpdateUserAddress?: (userData: CurrentUser) => void;
}

export default function OrderStepDelivery({
  orderDetails,
  onUpdateDetails,
  currentUser = null,
  loadingUser = false,
  onUpdateUserAddress,
}: OrderStepDeliveryProps) {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [saving, setSaving] = useState(false);

  console.log('OrderStepDelivery - currentUser:', currentUser);
  console.log('OrderStepDelivery - loadingUser:', loadingUser);

  const hasCompleteAddress = Boolean(
    currentUser?.alamat &&
      currentUser?.alamat.trim() !== '' &&
      currentUser?.kota &&
      currentUser?.kota.trim() !== '' &&
      currentUser?.no_telepon &&
      currentUser?.no_telepon.trim() !== '',
  );

  console.log('hasCompleteAddress:', hasCompleteAddress);

  const handleSaveAddressToProfile = async () => {
    console.log('handleSaveAddressToProfile called');
    console.log('currentUser before save:', currentUser);

    if (!currentUser) {
      console.error('currentUser is null/undefined!');
      Alert.alert(
        'Error',
        'User tidak ditemukan. Silakan refresh halaman atau login ulang.',
      );
      return;
    }

    console.log('currentUser exists:', {
      id: currentUser.id_user,
      nama: currentUser.nama,
    });

    if (
      !orderDetails.recipientPhone ||
      !orderDetails.shippingAddress ||
      !orderDetails.city
    ) {
      Alert.alert(
        'Validasi',
        'Nomor telepon, alamat lengkap, dan kota wajib diisi!',
      );
      return;
    }

    console.log('Validation passed, proceeding to save...');

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append('id_user', currentUser.id_user);
      formData.append('no_telepon', orderDetails.recipientPhone.trim());
      formData.append('alamat', orderDetails.shippingAddress.trim());
      formData.append('kota', orderDetails.city.trim());
      formData.append('provinsi', orderDetails.province?.trim() || '');

      console.log('Saving address to profile...', {
        user_id: currentUser.id_user,
        phone: orderDetails.recipientPhone,
        city: orderDetails.city,
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      console.log('Sending request to API...');
      console.log(
        'API URL:',
        API_CONFIG.getUrl('/users.php?op=update_address'),
      );

      const response = await fetch(
        API_CONFIG.getUrl('/users.php?op=update_address'),
        {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      console.log('Response status:', response.status);

      const responseText = await response.text();
      console.log('Raw API Response:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
        console.log('Parsed API Response:', result);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        throw new Error(
          'Server response is not valid JSON: ' +
            responseText.substring(0, 100),
        );
      }

      if (result.status === 'success' && result.data) {
        console.log('Update SUCCESS! New user data:', result.data);

        if (onUpdateUserAddress) {
          onUpdateUserAddress(result.data);
          console.log('Parent state updated via onUpdateUserAddress');
        }

        Alert.alert('Berhasil', 'Alamat berhasil disimpan ke profil Anda!');
        setShowAddressForm(false);
      } else {
        console.error('API returned error:', result);
        Alert.alert('Error', result.message || 'Gagal menyimpan alamat');
      }
    } catch (error: any) {
      console.error('Save address error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);

      let errorMsg = 'Gagal menyimpan alamat.';

      if (error.name === 'AbortError') {
        errorMsg =
          'Request timeout. Periksa koneksi internet atau pastikan server backend sudah berjalan (XAMPP/Apache).';
      } else if (error.message) {
        errorMsg = error.message;
      }

      Alert.alert('Error', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <View style={styles.section}>
        <View style={styles.sectionTitleContainer}>
          <Icon name="car-outline" size={20} color="#1F2937" />
          <Text style={styles.sectionTitle}> Metode Pengiriman</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.deliveryCard,
            orderDetails.deliveryMethod === 'cod' && styles.deliveryCardActive,
          ]}
          onPress={() =>
            onUpdateDetails({ deliveryMethod: 'cod', shippingCost: 15000 })
          }
        >
          <View style={styles.deliveryIconContainer}>
            <Icon name="car" size={24} color="#60A5FA" />
            <Icon
              name="cash"
              size={16}
              color="#10B981"
              style={styles.deliverySubIcon}
            />
          </View>
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
          <View style={styles.deliveryIconContainer}>
            <Icon name="car" size={24} color="#60A5FA" />
            <Icon
              name="card"
              size={16}
              color="#3B82F6"
              style={styles.deliverySubIcon}
            />
          </View>
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
          <Icon
            name="storefront"
            size={32}
            color="#60A5FA"
            style={styles.deliverySingleIcon}
          />
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
          {loadingUser ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#60A5FA" />
              <Text style={styles.loadingText}>Memuat data user...</Text>
            </View>
          ) : !currentUser ? (
            <View style={styles.errorCard}>
              <Icon name="alert-circle" size={48} color="#DC2626" />
              <Text style={styles.errorTitle}>User Tidak Ditemukan</Text>
              <Text style={styles.errorText}>
                Silakan logout dan login kembali untuk melanjutkan.
              </Text>
            </View>
          ) : (
            <>
              {hasCompleteAddress && !showAddressForm ? (
                <View style={styles.addressCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleContainer}>
                      <Icon name="location" size={18} color="#10B981" />
                      <Text style={styles.cardTitle}> Alamat Pengiriman</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => setShowAddressForm(true)}
                    >
                      <Icon name="pencil" size={14} color="#D97706" />
                      <Text style={styles.editButtonText}> Ubah</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.addressContent}>
                    <Text style={styles.addressName}>{currentUser.nama}</Text>
                    <View style={styles.addressRow}>
                      <Icon name="call" size={14} color="#4B5563" />
                      <Text style={styles.addressPhone}>
                        {' '}
                        {currentUser.no_telepon}
                      </Text>
                    </View>
                    <View style={styles.addressRow}>
                      <Icon name="location-outline" size={14} color="#374151" />
                      <Text style={styles.addressDetail}>
                        {' '}
                        {currentUser.alamat}
                      </Text>
                    </View>
                    <View style={styles.addressRow}>
                      <Icon name="business" size={14} color="#059669" />
                      <Text style={styles.addressLocation}>
                        {' '}
                        {currentUser.kota}
                        {currentUser.provinsi
                          ? `, ${currentUser.provinsi}`
                          : ''}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.formCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleContainer}>
                      <Icon name="create" size={18} color="#3B82F6" />
                      <Text style={styles.cardTitle}>
                        {' '}
                        {hasCompleteAddress ? 'Edit Alamat' : 'Lengkapi Alamat'}
                      </Text>
                    </View>
                    {hasCompleteAddress && (
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setShowAddressForm(false)}
                      >
                        <Icon name="close" size={18} color="#DC2626" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.formContent}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Nama Penerima *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Nama lengkap"
                        placeholderTextColor="#9CA3AF"
                        value={orderDetails.recipientName}
                        onChangeText={t =>
                          onUpdateDetails({ recipientName: t })
                        }
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Nomor Telepon *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="08xxxxxxxxxx"
                        placeholderTextColor="#9CA3AF"
                        value={orderDetails.recipientPhone}
                        onChangeText={t =>
                          onUpdateDetails({ recipientPhone: t })
                        }
                        keyboardType="phone-pad"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Alamat Lengkap *</Text>
                      <TextInput
                        style={styles.textArea}
                        placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan..."
                        placeholderTextColor="#9CA3AF"
                        value={orderDetails.shippingAddress}
                        onChangeText={t =>
                          onUpdateDetails({ shippingAddress: t })
                        }
                        multiline
                        numberOfLines={3}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Kota *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Nama kota"
                        placeholderTextColor="#9CA3AF"
                        value={orderDetails.city}
                        onChangeText={t => onUpdateDetails({ city: t })}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Provinsi (Opsional)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Nama provinsi"
                        placeholderTextColor="#9CA3AF"
                        value={orderDetails.province}
                        onChangeText={t => onUpdateDetails({ province: t })}
                      />
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.saveButton,
                        saving && styles.saveButtonDisabled,
                      ]}
                      onPress={handleSaveAddressToProfile}
                      disabled={saving}
                    >
                      {saving ? (
                        <ActivityIndicator color="#FFF" />
                      ) : (
                        <View style={styles.saveButtonContent}>
                          <Icon name="save" size={16} color="#FFF" />
                          <Text style={styles.saveButtonText}>
                            {' '}
                            Simpan ke Profil Saya
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    <View style={styles.helperTextContainer}>
                      <Icon
                        name="information-circle"
                        size={14}
                        color="#6B7280"
                      />
                      <Text style={styles.helperText}>
                        {' '}
                        Alamat akan tersimpan dan otomatis terisi saat order
                        berikutnya
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </>
          )}
        </>
      ) : (
        <View style={styles.infoCard}>
          <Icon name="storefront" size={48} color="#60A5FA" />
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
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
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
  deliveryCardActive: {
    borderColor: '#60A5FA',
    backgroundColor: '#EFF6FF',
  },
  deliveryIconContainer: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  deliverySubIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  deliverySingleIcon: {
    marginRight: 16,
  },
  deliveryInfo: { flex: 1 },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  deliverySubtitle: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  deliveryPrice: { fontSize: 13, fontWeight: '600', color: '#60A5FA' },
  addressCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#10B981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D97706',
  },
  cancelButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  addressContent: {
    marginTop: 4,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  addressPhone: {
    fontSize: 14,
    color: '#4B5563',
  },
  addressDetail: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    flex: 1,
  },
  addressLocation: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
  },
  formContent: {
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  textArea: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  helperTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingCard: {
    backgroundColor: '#F9FAFB',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorCard: {
    backgroundColor: '#FEE2E2',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
    marginTop: 12,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#991B1B',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#60A5FA',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E40AF',
    marginTop: 12,
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

