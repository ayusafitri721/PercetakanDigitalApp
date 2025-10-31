// screens/customer/OrderFormScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';

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
}

export default function OrderFormScreen({
  service,
  onBack,
}: OrderFormScreenProps) {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    material: '',
    size: '',
    quantity: 1,
    speed: 'normal',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  // Simulasi upload file
  const handleFileUpload = () => {
    Alert.alert('Upload File', 'Pilih file desain Anda', [
      {
        text: 'PDF',
        onPress: () => {
          setUploadedFile('design_mockup.pdf');
          Alert.alert('✅ Berhasil', 'File PDF berhasil diupload!');
        },
      },
      {
        text: 'PNG/JPG',
        onPress: () => {
          setUploadedFile('design_mockup.png');
          Alert.alert('✅ Berhasil', 'File gambar berhasil diupload!');
        },
      },
      { text: 'Batal', style: 'cancel' },
    ]);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  // Hitung estimasi harga dari database
  const calculatePrice = (): number => {
    if (!service || !orderDetails.material || !orderDetails.size) return 0;

    // Ambil harga dasar dari database
    let basePrice = parseInt(service.harga_dasar);
    const { quantity, speed } = orderDetails;

    // Kalikan dengan jumlah
    let total = basePrice * quantity;

    // Tambah 50% untuk express
    if (speed === 'express') {
      total = total * 1.5;
    }

    return Math.round(total);
  };

  const estimatedPrice = calculatePrice();

  // Parse material dari database (misal: "HVS 70g, HVS 80g, Art Paper")
  const getMaterialOptions = (): string[] => {
    if (!service || !service.media_cetak) return ['Standard'];
    return service.media_cetak.split(',').map(m => m.trim());
  };

  // Parse ukuran dari database (misal: "A4, F4, Legal")
  const getSizeOptions = (): string[] => {
    if (!service || !service.ukuran_standar) return ['Standard'];
    return service.ukuran_standar.split(',').map(s => s.trim());
  };

  // Get icon dari kategori
  const getIconByCategory = (categoryName: string): string => {
    const lower = categoryName.toLowerCase();
    if (lower.includes('dokumen')) return '📄';
    if (lower.includes('banner')) return '🎴';
    if (lower.includes('kaos')) return '👕';
    if (lower.includes('stiker')) return '🖼️';
    if (lower.includes('packaging')) return '🎁';
    if (lower.includes('foto')) return '📸';
    return '🖨️';
  };

  // Get color dari kategori
  const getColorByCategory = (categoryName: string): string => {
    const lower = categoryName.toLowerCase();
    if (lower.includes('dokumen')) return '#4F46E5';
    if (lower.includes('banner')) return '#10B981';
    if (lower.includes('kaos')) return '#F59E0B';
    if (lower.includes('stiker')) return '#EF4444';
    if (lower.includes('packaging')) return '#8B5CF6';
    if (lower.includes('foto')) return '#EC4899';
    return '#6366F1';
  };

  // Submit order
  const handleSubmitOrder = () => {
    if (!uploadedFile) {
      Alert.alert('Error', 'Harap upload file desain terlebih dahulu!');
      return;
    }

    if (!orderDetails.material || !orderDetails.size) {
      Alert.alert('Error', 'Harap lengkapi semua data pesanan!');
      return;
    }

    if (orderDetails.quantity < 1) {
      Alert.alert('Error', 'Jumlah pesanan minimal 1!');
      return;
    }

    setLoading(true);

    // Simulasi API call (nanti ganti dengan API order)
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        '✅ Pesanan Berhasil Dibuat!',
        `Produk: ${
          service?.nama_product
        }\nTotal: Rp ${estimatedPrice.toLocaleString(
          'id-ID',
        )}\n\nSilakan lanjutkan ke pembayaran.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // TODO: Navigate to payment screen
              Alert.alert('Info', 'Fitur pembayaran segera hadir!');
            },
          },
        ],
      );
    }, 1500);
  };

  if (!service) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Produk tidak ditemukan</Text>
      </View>
    );
  }

  const icon = getIconByCategory(service.nama_category);
  const color = getColorByCategory(service.nama_category);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Form Pemesanan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Service Info */}
        <View style={[styles.serviceInfoCard, { borderLeftColor: color }]}>
          <Text style={styles.serviceIcon}>{icon}</Text>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{service.nama_product}</Text>
            <Text style={styles.serviceCategory}>
              📁 {service.nama_category}
            </Text>
            {service.deskripsi && (
              <Text style={styles.serviceDescription}>{service.deskripsi}</Text>
            )}
          </View>
        </View>

        {/* Upload File Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📁 Upload File Desain</Text>
          <Text style={styles.sectionSubtitle}>
            Format: PDF, PNG, JPG (Max 10MB)
          </Text>

          {uploadedFile ? (
            <View style={styles.uploadedFileCard}>
              <View style={styles.uploadedFileInfo}>
                <Text style={styles.uploadedFileIcon}>📄</Text>
                <View style={styles.uploadedFileDetails}>
                  <Text style={styles.uploadedFileName}>{uploadedFile}</Text>
                  <Text style={styles.uploadedFileSize}>2.5 MB</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleRemoveFile}>
                <Text style={styles.removeFileIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleFileUpload}
              activeOpacity={0.7}
            >
              <Text style={styles.uploadIcon}>📤</Text>
              <Text style={styles.uploadText}>Pilih File</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Detail Pesanan</Text>

          {/* Material */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Jenis Material *</Text>
            <View style={styles.optionsRow}>
              {getMaterialOptions().map(mat => (
                <TouchableOpacity
                  key={mat}
                  style={[
                    styles.optionButton,
                    orderDetails.material === mat && styles.optionButtonActive,
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

          {/* Size */}
          <View style={styles.inputGroup}>
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

          {/* Quantity */}
          <View style={styles.inputGroup}>
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
                onChangeText={text =>
                  setOrderDetails({
                    ...orderDetails,
                    quantity: parseInt(text) || 1,
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

          {/* Speed */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kecepatan Pengerjaan *</Text>
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
                <Text style={styles.speedTitle}>⏱️ Normal</Text>
                <Text style={styles.speedSubtitle}>3-5 hari kerja</Text>
                <Text style={styles.speedPrice}>Harga standar</Text>
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
                <Text style={styles.speedTitle}>⚡ Express</Text>
                <Text style={styles.speedSubtitle}>1-2 hari kerja</Text>
                <Text style={styles.speedPrice}>+50% harga</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Catatan (Opsional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Tambahkan catatan khusus..."
              placeholderTextColor="#9CA3AF"
              value={orderDetails.notes}
              onChangeText={text =>
                setOrderDetails({ ...orderDetails, notes: text })
              }
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Price Estimation */}
        <View style={[styles.priceCard, { backgroundColor: color }]}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Estimasi Harga:</Text>
            <Text style={styles.priceValue}>
              Rp {estimatedPrice.toLocaleString('id-ID')}
            </Text>
          </View>
          <Text style={styles.priceNote}>
            *Harga dapat berubah setelah validasi desain
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          <View>
            <Text style={styles.bottomBarLabel}>Total</Text>
            <Text style={styles.bottomBarPrice}>
              Rp {estimatedPrice.toLocaleString('id-ID')}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitOrder}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Lanjut Bayar →</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
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
  backIcon: {
    fontSize: 24,
    color: '#1F2937',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 50,
  },
  serviceInfoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    borderLeftWidth: 4,
  },
  serviceIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
  },
  uploadedFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  uploadedFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  uploadedFileIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  uploadedFileDetails: {
    flex: 1,
  },
  uploadedFileName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  uploadedFileSize: {
    fontSize: 13,
    color: '#6B7280',
  },
  removeFileIcon: {
    fontSize: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  optionButtonActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  optionButtonTextActive: {
    color: '#FFFFFF',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  quantityButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  quantityInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  speedRow: {
    flexDirection: 'row',
    gap: 12,
  },
  speedCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  speedCardActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  speedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  speedSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  speedPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#1F2937',
    minHeight: 100,
  },
  priceCard: {
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  priceNote: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    fontStyle: 'italic',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bottomBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomBarLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  bottomBarPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
