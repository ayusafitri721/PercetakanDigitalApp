// screens/customer/OrderFormScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Image,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';

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

interface OrderDetails {
  material: string;
  size: string;
  quantity: number;
  speed: 'normal' | 'express';
  notes: string;
  deliveryMethod: 'cod' | 'transfer_delivery' | 'pickup';
  paymentMethod: 'transfer' | 'qris' | '';
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  city: string;
  province: string;
  shippingCost: number;
}

interface UploadedFile {
  uri: string;
  name: string;
  type: string;
  size: number;
}

import { API_BASE_URL } from '../../config/api'; 

export default function OrderFormScreen({
  service,
  onBack,
}: OrderFormScreenProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [paymentProof, setPaymentProof] = useState<UploadedFile | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    material: '',
    size: '',
    quantity: 1,
    speed: 'normal',
    notes: '',
    deliveryMethod: 'cod',
    paymentMethod: '',
    recipientName: '',
    recipientPhone: '',
    shippingAddress: '',
    city: '',
    province: '',
    shippingCost: 0,
  });
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users.php`);
      if (response.data.status === 'success') {
        const usersData = response.data.data?.users || response.data.data;
        if (Array.isArray(usersData) && usersData.length > 0) {
          const user =
            usersData.find((u: any) => u.role === 'customer') || usersData[0];
          setCurrentUser(user);
          // Auto-fill recipient info from user
          setOrderDetails(prev => ({
            ...prev,
            recipientName: user.nama || '',
            recipientPhone: user.no_telepon || '',
          }));
        } else {
          Alert.alert('Error', 'Tidak ada user ditemukan.');
        }
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch user:', error.message);
      Alert.alert('Error', 'Gagal memuat data user.');
    } finally {
      setLoadingUser(false);
    }
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 33) return true;
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Izin Akses Galeri',
            message: 'Aplikasi membutuhkan izin untuk mengakses galeri',
            buttonNeutral: 'Tanya Nanti',
            buttonNegative: 'Tolak',
            buttonPositive: 'Izinkan',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handlePickImage = async (type: 'design' | 'payment') => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Izin Ditolak', 'Aplikasi membutuhkan izin akses galeri.');
        return;
      }

      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Gagal memilih gambar');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const maxSize = 10 * 1024 * 1024;

        if (asset.fileSize && asset.fileSize > maxSize) {
          Alert.alert('Error', 'Ukuran file maksimal 10MB!');
          return;
        }

        const fileData = {
          uri: asset.uri || '',
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize || 0,
        };

        if (type === 'design') {
          setUploadedFile(fileData);
        } else {
          setPaymentProof(fileData);
        }

        Alert.alert('Berhasil', 'Gambar berhasil dipilih!');
      }
    } catch (error) {
      console.error('Pick image error:', error);
      Alert.alert('Error', 'Gagal memilih gambar');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const calculatePrice = (): number => {
    if (!service || !orderDetails.material || !orderDetails.size) return 0;
    let total = parseInt(service.harga_dasar) * orderDetails.quantity;
    if (orderDetails.speed === 'express') total *= 1.5;
    return Math.round(total);
  };

  const calculateTotal = (): number => {
    return calculatePrice() + orderDetails.shippingCost;
  };

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
    if (lower.includes('stiker')) return '🏷️';
    if (lower.includes('packaging')) return '📦';
    if (lower.includes('foto')) return '📸';
    return '🖨️';
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

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!uploadedFile) {
        Alert.alert('Error', 'Silakan upload file desain terlebih dahulu!');
        return false;
      }
      if (!orderDetails.material || !orderDetails.size) {
        Alert.alert('Error', 'Silakan lengkapi material dan ukuran!');
        return false;
      }
      if (orderDetails.quantity < 1) {
        Alert.alert('Error', 'Jumlah minimal 1!');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (orderDetails.deliveryMethod !== 'pickup') {
        if (!orderDetails.recipientName.trim()) {
          Alert.alert('Error', 'Nama penerima harus diisi!');
          return false;
        }
        if (!orderDetails.recipientPhone.trim()) {
          Alert.alert('Error', 'Nomor telepon penerima harus diisi!');
          return false;
        }
        if (!orderDetails.shippingAddress.trim()) {
          Alert.alert('Error', 'Alamat pengiriman harus diisi!');
          return false;
        }
        if (!orderDetails.city.trim()) {
          Alert.alert('Error', 'Kota harus diisi!');
          return false;
        }
      }
      return true;
    }

    if (step === 3) {
      if (orderDetails.deliveryMethod === 'cod') return true;
      if (!orderDetails.paymentMethod) {
        Alert.alert('Error', 'Silakan pilih metode pembayaran!');
        return false;
      }
      if (!paymentProof) {
        Alert.alert('Error', 'Silakan upload bukti pembayaran!');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 2 && orderDetails.deliveryMethod === 'cod') {
        handleSubmitOrder();
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleSubmitOrder = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'User belum dimuat.');
      return;
    }

    setLoading(true);

    try {
      // STEP 1: CREATE ORDER
      const orderFormData = new FormData();
      orderFormData.append('id_user', currentUser.id_user.toString());
      orderFormData.append('jenis_order', 'online');
      orderFormData.append('kecepatan_pengerjaan', orderDetails.speed);
      orderFormData.append('subtotal', calculatePrice().toString());
      orderFormData.append('diskon', '0');
      orderFormData.append('ongkir', orderDetails.shippingCost.toString());
      orderFormData.append('total_harga', calculateTotal().toString());
      orderFormData.append('catatan_pelanggan', orderDetails.notes);

      // Status order based on payment
      let statusOrder = 'pending';
      if (orderDetails.deliveryMethod === 'cod') {
        statusOrder = 'pending'; // Menunggu konfirmasi
      } else {
        statusOrder = 'dibayar'; // Sudah bayar transfer
      }
      orderFormData.append('status_order', statusOrder);

      console.log('📤 Creating order...');
      const orderResponse = await axios.post(
        `${API_BASE_URL}/orders.php?op=create`,
        orderFormData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000,
        },
      );

      if (orderResponse.data.status !== 'success') {
        throw new Error(orderResponse.data.message || 'Gagal membuat order');
      }

      const id_order = orderResponse.data.data.id_order;
      const kode_order = orderResponse.data.data.kode_order;
      console.log('✅ Order created! ID:', id_order, 'Code:', kode_order);

      // STEP 2: CREATE ORDER ITEM + UPLOAD DESAIN
      const itemFormData = new FormData();
      itemFormData.append('id_order', id_order.toString());
      itemFormData.append('id_product', service?.id_product || '');
      itemFormData.append('ukuran', orderDetails.size);
      itemFormData.append('jumlah', orderDetails.quantity.toString());
      itemFormData.append('harga_satuan', service?.harga_dasar || '0');
      itemFormData.append(
        'keterangan',
        `Material: ${orderDetails.material}\nKecepatan: ${orderDetails.speed}\n${orderDetails.notes}`,
      );
      itemFormData.append('file_desain', {
        uri: uploadedFile!.uri,
        name: uploadedFile!.name,
        type: uploadedFile!.type,
      } as any);

      console.log('📤 Creating order item...');
      const itemResponse = await axios.post(
        `${API_BASE_URL}/order_items.php?op=create`,
        itemFormData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000,
        },
      );

      if (itemResponse.data.status !== 'success') {
        throw new Error(
          itemResponse.data.message || 'Gagal membuat order item',
        );
      }
      console.log('✅ Order item created!');

      // STEP 3: CREATE PAYMENT (jika bukan COD, upload bukti bayar)
      if (orderDetails.deliveryMethod !== 'cod' && paymentProof) {
        const paymentFormData = new FormData();
        paymentFormData.append('id_order', id_order.toString());
        paymentFormData.append('metode_pembayaran', orderDetails.paymentMethod);
        paymentFormData.append('jumlah_bayar', calculateTotal().toString());

        // Upload bukti bayar sebagai file
        paymentFormData.append('bukti_bayar', {
          uri: paymentProof.uri,
          name: paymentProof.name,
          type: paymentProof.type,
        } as any);

        console.log('📤 Creating payment...');
        const paymentResponse = await axios.post(
          `${API_BASE_URL}/payments.php?op=create`,
          paymentFormData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 30000,
          },
        );

        if (paymentResponse.data.status !== 'success') {
          console.warn(
            '⚠️ Payment creation warning:',
            paymentResponse.data.message,
          );
        } else {
          console.log('✅ Payment created!');
        }
      }

      // STEP 4: CREATE DELIVERY (jika perlu dikirim atau pickup)
      const deliveryFormData = new FormData();
      deliveryFormData.append('id_order', id_order.toString());

      if (orderDetails.deliveryMethod === 'pickup') {
        deliveryFormData.append('metode_pengiriman', 'ambil_sendiri');
        deliveryFormData.append(
          'nama_penerima',
          orderDetails.recipientName || currentUser.nama,
        );
        deliveryFormData.append(
          'no_telepon_penerima',
          orderDetails.recipientPhone || currentUser.no_telepon,
        );
        deliveryFormData.append('alamat_lengkap', 'Ambil di toko');
        deliveryFormData.append('ongkos_kirim', '0');
      } else {
        const metode =
          orderDetails.deliveryMethod === 'cod'
            ? 'diantar_cod'
            : 'diantar_reguler';
        deliveryFormData.append('metode_pengiriman', metode);
        deliveryFormData.append('nama_penerima', orderDetails.recipientName);
        deliveryFormData.append(
          'no_telepon_penerima',
          orderDetails.recipientPhone,
        );
        deliveryFormData.append('alamat_lengkap', orderDetails.shippingAddress);
        deliveryFormData.append('kota', orderDetails.city);
        deliveryFormData.append(
          'provinsi',
          orderDetails.province || 'Indonesia',
        );
        deliveryFormData.append(
          'ongkos_kirim',
          orderDetails.shippingCost.toString(),
        );
      }

      console.log('📤 Creating delivery...');
      const deliveryResponse = await axios.post(
        `${API_BASE_URL}/deliveries.php?op=create`,
        deliveryFormData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000,
        },
      );

      if (deliveryResponse.data.status !== 'success') {
        console.warn(
          '⚠️ Delivery creation warning:',
          deliveryResponse.data.message,
        );
      } else {
        console.log('✅ Delivery created!');
      }

      setLoading(false);

      // Reset form
      setUploadedFile(null);
      setPaymentProof(null);
      setOrderDetails({
        material: '',
        size: '',
        quantity: 1,
        speed: 'normal',
        notes: '',
        deliveryMethod: 'cod',
        paymentMethod: '',
        recipientName: currentUser.nama,
        recipientPhone: currentUser.no_telepon,
        shippingAddress: '',
        city: '',
        province: '',
        shippingCost: 0,
      });
      setCurrentStep(1);

      // Success message
      let successMessage = `✅ Pesanan Berhasil Dibuat!\n\n`;
      successMessage += `Kode Order: ${kode_order}\n`;
      successMessage += `Customer: ${currentUser.nama}\n`;
      successMessage += `Produk: ${service?.nama_product}\n`;
      successMessage += `Total: Rp ${calculateTotal().toLocaleString(
        'id-ID',
      )}\n\n`;

      if (orderDetails.deliveryMethod === 'cod') {
        successMessage += `📦 Metode: COD (Bayar saat terima)\n`;
        successMessage += `📋 Status: Menunggu konfirmasi admin\n\n`;
        successMessage += `Pesanan akan diproses setelah admin konfirmasi.`;
      } else if (orderDetails.deliveryMethod === 'transfer_delivery') {
        successMessage += `💳 Metode: Transfer + Diantar\n`;
        successMessage += `✅ Status: Dibayar - Siap produksi\n\n`;
        successMessage += `Pesanan langsung masuk ke antrian produksi!`;
      } else {
        successMessage += `🏪 Metode: Ambil di Toko\n`;
        successMessage += `✅ Status: Dibayar - Siap produksi\n\n`;
        successMessage += `Ambil pesanan di toko setelah selesai diproduksi.`;
      }

      Alert.alert('Berhasil', successMessage, [
        { text: 'OK', onPress: () => onBack() },
      ]);
    } catch (error: any) {
      setLoading(false);
      console.error('❌ Submit order error:', error);
      console.error('❌ Response:', error.response?.data);

      let errorMessage = 'Pesanan gagal dibuat.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes('Network Error')) {
        errorMessage = `Tidak dapat terhubung ke server.\n\nPastikan backend jalan di:\n${API_BASE_URL}`;
      } else {
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
        <Text style={styles.errorText}>❌ User tidak ditemukan</Text>
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
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Form Pemesanan</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* PROGRESS */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressStep,
              currentStep >= 1 && styles.progressStepActive,
            ]}
          >
            <Text
              style={[
                styles.progressStepText,
                currentStep >= 1 && styles.progressStepTextActive,
              ]}
            >
              1
            </Text>
          </View>
          <View
            style={[
              styles.progressLine,
              currentStep >= 2 && styles.progressLineActive,
            ]}
          />
          <View
            style={[
              styles.progressStep,
              currentStep >= 2 && styles.progressStepActive,
            ]}
          >
            <Text
              style={[
                styles.progressStepText,
                currentStep >= 2 && styles.progressStepTextActive,
              ]}
            >
              2
            </Text>
          </View>
          <View
            style={[
              styles.progressLine,
              currentStep >= 3 && styles.progressLineActive,
            ]}
          />
          <View
            style={[
              styles.progressStep,
              currentStep >= 3 && styles.progressStepActive,
            ]}
          >
            <Text
              style={[
                styles.progressStepText,
                currentStep >= 3 && styles.progressStepTextActive,
              ]}
            >
              3
            </Text>
          </View>
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>Detail</Text>
          <Text style={styles.progressLabel}>Pengiriman</Text>
          <Text style={styles.progressLabel}>Bayar</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* USER INFO */}
        <View style={styles.userInfoCard}>
          <Text style={styles.userInfoLabel}>👤 Customer:</Text>
          <Text style={styles.userInfoName}>{currentUser.nama}</Text>
          <Text style={styles.userInfoEmail}>{currentUser.email}</Text>
        </View>

        {/* SERVICE INFO */}
        <View style={[styles.serviceInfoCard, { borderLeftColor: color }]}>
          <Text style={styles.serviceIcon}>{icon}</Text>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{service.nama_product}</Text>
            <Text style={styles.serviceCategory}>{service.nama_category}</Text>
          </View>
        </View>

        {/* STEP 1: DETAIL */}
        {currentStep === 1 && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📁 Upload Desain</Text>
              {uploadedFile ? (
                <View style={styles.uploadedFileCard}>
                  <View style={styles.uploadedFileContent}>
                    <Image
                      source={{ uri: uploadedFile.uri }}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                    <View style={styles.uploadedFileDetails}>
                      <Text style={styles.uploadedFileName} numberOfLines={1}>
                        {uploadedFile.name}
                      </Text>
                      <Text style={styles.uploadedFileSize}>
                        {formatFileSize(uploadedFile.size)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setUploadedFile(null)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>🗑️ Hapus</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => handlePickImage('design')}
                >
                  <Text style={styles.uploadIcon}>🖼️</Text>
                  <Text style={styles.uploadText}>Pilih Gambar</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Jenis Material *</Text>
              <View style={styles.optionsRow}>
                {getMaterialOptions().map(mat => (
                  <TouchableOpacity
                    key={mat}
                    style={[
                      styles.optionButton,
                      orderDetails.material === mat &&
                        styles.optionButtonActive,
                    ]}
                    onPress={() =>
                      setOrderDetails({ ...orderDetails, material: mat })
                    }
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
                    onPress={() => setOrderDetails({ ...orderDetails, size })}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        orderDetails.size === size &&
                          styles.optionButtonTextActive,
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
                    setOrderDetails({
                      ...orderDetails,
                      quantity: Math.max(1, orderDetails.quantity - 1),
                    })
                  }
                >
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.quantityInput}
                  value={orderDetails.quantity.toString()}
                  onChangeText={t =>
                    setOrderDetails({
                      ...orderDetails,
                      quantity: parseInt(t) || 1,
                    })
                  }
                  keyboardType="number-pad"
                />
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() =>
                    setOrderDetails({
                      ...orderDetails,
                      quantity: orderDetails.quantity + 1,
                    })
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
                  onPress={() =>
                    setOrderDetails({ ...orderDetails, speed: 'normal' })
                  }
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
                  onPress={() =>
                    setOrderDetails({ ...orderDetails, speed: 'express' })
                  }
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
                onChangeText={t =>
                  setOrderDetails({ ...orderDetails, notes: t })
                }
                multiline
              />
            </View>
          </>
        )}

        {/* STEP 2: PENGIRIMAN */}
        {currentStep === 2 && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🚚 Metode Pengiriman</Text>

              <TouchableOpacity
                style={[
                  styles.deliveryCard,
                  orderDetails.deliveryMethod === 'cod' &&
                    styles.deliveryCardActive,
                ]}
                onPress={() =>
                  setOrderDetails({
                    ...orderDetails,
                    deliveryMethod: 'cod',
                    shippingCost: 15000,
                  })
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
                  setOrderDetails({
                    ...orderDetails,
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
                  setOrderDetails({
                    ...orderDetails,
                    deliveryMethod: 'pickup',
                    shippingCost: 0,
                  })
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

            {orderDetails.deliveryMethod !== 'pickup' && (
              <>
                <View style={styles.section}>
                  <Text style={styles.label}>Nama Penerima *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nama lengkap penerima"
                    placeholderTextColor="#9CA3AF"
                    value={orderDetails.recipientName}
                    onChangeText={t =>
                      setOrderDetails({ ...orderDetails, recipientName: t })
                    }
                  />
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>Nomor Telepon *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="08xxxxxxxxxx"
                    placeholderTextColor="#9CA3AF"
                    value={orderDetails.recipientPhone}
                    onChangeText={t =>
                      setOrderDetails({ ...orderDetails, recipientPhone: t })
                    }
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
                    onChangeText={t =>
                      setOrderDetails({ ...orderDetails, shippingAddress: t })
                    }
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
                    onChangeText={t =>
                      setOrderDetails({ ...orderDetails, city: t })
                    }
                  />
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>Provinsi (Opsional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nama provinsi"
                    placeholderTextColor="#9CA3AF"
                    value={orderDetails.province}
                    onChangeText={t =>
                      setOrderDetails({ ...orderDetails, province: t })
                    }
                  />
                </View>
              </>
            )}

            {orderDetails.deliveryMethod === 'pickup' && (
              <View style={styles.infoCard}>
                <Text style={styles.infoEmoji}>🏪</Text>
                <Text style={styles.infoTitle}>Ambil di Toko</Text>
                <Text style={styles.infoText}>
                  Pesanan akan siap diambil setelah selesai diproduksi. Anda
                  akan menerima notifikasi.
                </Text>
              </View>
            )}
          </>
        )}

        {/* STEP 3: PEMBAYARAN */}
        {currentStep === 3 && (
          <>
            {orderDetails.deliveryMethod === 'cod' ? (
              <View style={styles.infoCard}>
                <Text style={styles.infoEmoji}>✅</Text>
                <Text style={styles.infoTitle}>Siap Diproses</Text>
                <Text style={styles.infoText}>
                  Pesanan akan diproses setelah dikonfirmasi admin. Pembayaran
                  dilakukan saat barang diterima.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    💳 Pilih Metode Pembayaran
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.paymentCard,
                      orderDetails.paymentMethod === 'qris' &&
                        styles.paymentCardActive,
                    ]}
                    onPress={() =>
                      setOrderDetails({
                        ...orderDetails,
                        paymentMethod: 'qris',
                      })
                    }
                  >
                    <Text style={styles.paymentEmoji}>📱</Text>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentTitle}>QRIS</Text>
                      <Text style={styles.paymentSubtitle}>
                        Scan barcode untuk bayar
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.paymentCard,
                      orderDetails.paymentMethod === 'transfer' &&
                        styles.paymentCardActive,
                    ]}
                    onPress={() =>
                      setOrderDetails({
                        ...orderDetails,
                        paymentMethod: 'transfer',
                      })
                    }
                  >
                    <Text style={styles.paymentEmoji}>🏦</Text>
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
                        <Text style={styles.paymentInfoTitle}>📱 QRIS</Text>
                        <Text style={styles.paymentInfoText}>
                          Scan QRIS di kasir atau minta ke admin
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.paymentInfoTitle}>
                          🏦 Bank Transfer
                        </Text>
                        <Text style={styles.paymentInfoText}>
                          BCA: 1234567890
                        </Text>
                        <Text style={styles.paymentInfoText}>
                          a.n. Percetakan Digital
                        </Text>
                      </>
                    )}
                  </View>
                )}

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📸 Upload Bukti Bayar</Text>
                  {paymentProof ? (
                    <View style={styles.uploadedFileCard}>
                      <View style={styles.uploadedFileContent}>
                        <Image
                          source={{ uri: paymentProof.uri }}
                          style={styles.imagePreview}
                          resizeMode="cover"
                        />
                        <View style={styles.uploadedFileDetails}>
                          <Text
                            style={styles.uploadedFileName}
                            numberOfLines={1}
                          >
                            {paymentProof.name}
                          </Text>
                          <Text style={styles.uploadedFileSize}>
                            {formatFileSize(paymentProof.size)}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => setPaymentProof(null)}
                        style={styles.removeButton}
                      >
                        <Text style={styles.removeButtonText}>🗑️ Hapus</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={() => handlePickImage('payment')}
                    >
                      <Text style={styles.uploadIcon}>📸</Text>
                      <Text style={styles.uploadText}>Upload Bukti</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </>
        )}

        {/* PRICE SUMMARY */}
        {estimatedPrice > 0 && (
          <View style={[styles.priceCard, { backgroundColor: color }]}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal:</Text>
              <Text style={styles.priceValue}>
                Rp {estimatedPrice.toLocaleString('id-ID')}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Ongkir:</Text>
              <Text style={styles.priceValue}>
                Rp {orderDetails.shippingCost.toLocaleString('id-ID')}
              </Text>
            </View>
            <View style={[styles.priceRow, styles.priceRowTotal]}>
              <Text style={styles.priceLabelTotal}>Total:</Text>
              <Text style={styles.priceValueTotal}>
                Rp {totalPrice.toLocaleString('id-ID')}
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* BOTTOM BAR */}
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
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
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
  progressStep: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepActive: { backgroundColor: '#4F46E5' },
  progressStepText: { fontSize: 14, fontWeight: '700', color: '#9CA3AF' },
  progressStepTextActive: { color: '#FFF' },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  progressLineActive: { backgroundColor: '#4F46E5' },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: { flex: 1 },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 50,
    fontWeight: '600',
  },
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
  section: { marginTop: 20, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
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
  uploadedFileCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  uploadedFileContent: { flexDirection: 'row', marginBottom: 12 },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  uploadedFileDetails: { flex: 1, justifyContent: 'center' },
  uploadedFileName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  uploadedFileSize: { fontSize: 13, color: '#6B7280' },
  removeButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  removeButtonText: { fontSize: 14, fontWeight: '600', color: '#EF4444' },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
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
  paymentCardActive: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
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
    backgroundColor: '#FEF3C7',
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  paymentInfoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 8,
  },
  paymentInfoText: { fontSize: 14, color: '#78350F', marginBottom: 4 },
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
  priceCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceRowTotal: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  priceLabel: { fontSize: 14, fontWeight: '500', color: '#FFF', opacity: 0.9 },
  priceValue: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  priceLabelTotal: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  priceValueTotal: { fontSize: 22, fontWeight: '700', color: '#FFF' },
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
