// screens/customer/OrderDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

interface OrderDetailScreenProps {
  orderId: string;
  onBack: () => void;
}

interface OrderItem {
  id_item: string;
  id_produk: string;
  nama_produk: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
  catatan_item: string;
  ukuran: string;
  gambar_preview: string;
}

interface OrderDetail {
  id_order: string;
  kode_order: string;
  nama_customer: string;
  email_customer: string;
  telepon_customer: string;
  alamat_pengiriman: string;
  tanggal_order: string;
  jenis_order: string;
  kecepatan_pengerjaan: string;
  status_order: string;
  status_pembayaran: string;
  metode_pembayaran: string;
  subtotal: number;
  diskon: number;
  ongkir: number;
  total_harga: number;
  catatan: string;
  catatan_internal: string;
  tanggal_selesai: string | null;
  items: OrderItem[];
}

function getStatusConfig(status: string) {
  const configs: {
    [key: string]: {
      label: string;
      bgColor: string;
      textColor: string;
      iconName: string;
    };
  } = {
    pending: {
      label: 'Menunggu',
      bgColor: '#FEF3C7',
      textColor: '#D97706',
      iconName: 'time',
    },
    validasi: {
      label: 'Validasi',
      bgColor: '#DBEAFE',
      textColor: '#2563EB',
      iconName: 'search',
    },
    dibayar: {
      label: 'Dibayar',
      bgColor: '#D1FAE5',
      textColor: '#059669',
      iconName: 'cash',
    },
    diproses: {
      label: 'Diproses',
      bgColor: '#BFDBFE',
      textColor: '#1E40AF',
      iconName: 'settings',
    },
    cetak: {
      label: 'Sedang Cetak',
      bgColor: '#93C5FD',
      textColor: '#1E3A8A',
      iconName: 'print',
    },
    siap: {
      label: 'Siap',
      bgColor: '#D1FAE5',
      textColor: '#059669',
      iconName: 'checkmark-circle',
    },
    dikirim: {
      label: 'Dikirim',
      bgColor: '#BFDBFE',
      textColor: '#1D4ED8',
      iconName: 'car',
    },
    selesai: {
      label: 'Selesai',
      bgColor: '#D1FAE5',
      textColor: '#10B981',
      iconName: 'checkmark-done',
    },
    dibatalkan: {
      label: 'Dibatalkan',
      bgColor: '#FEE2E2',
      textColor: '#DC2626',
      iconName: 'close-circle',
    },
  };
  return configs[status.toLowerCase()] || configs.pending;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleDateString('id-ID', options);
}

function formatPrice(price: number): string {
  return `Rp ${price.toLocaleString('id-ID')}`;
}

export default function OrderDetailScreen({
  orderId,
  onBack,
}: OrderDetailScreenProps) {
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching order detail for ID:', orderId);

      const response = await axios.get(
        `${API_BASE_URL}/orders.php?op=detail&id=${orderId}`,
      );

      console.log('📦 Order detail response:', response.data);

      if (response.data.status !== 'success') {
        throw new Error('Gagal mengambil detail order');
      }

      setOrderDetail(response.data.data);
    } catch (error: any) {
      console.error('❌ Failed to fetch order detail:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Gagal memuat detail pesanan',
      );
      onBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Pesanan</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Memuat detail pesanan...</Text>
        </View>
      </View>
    );
  }

  if (!orderDetail) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Pesanan</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Icon name="document-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>Data pesanan tidak ditemukan</Text>
        </View>
      </View>
    );
  }

  const statusConfig = getStatusConfig(orderDetail.status_order);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Pesanan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadgeLarge,
              { backgroundColor: statusConfig.bgColor },
            ]}
          >
            <Icon
              name={statusConfig.iconName}
              size={28}
              color={statusConfig.textColor}
            />
            <Text
              style={[styles.statusLabel, { color: statusConfig.textColor }]}
            >
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Order Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="document-text" size={20} color="#3B82F6" />
            <Text style={styles.cardTitle}>Informasi Pesanan</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kode Order</Text>
            <Text style={styles.infoValue}>{orderDetail.kode_order}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tanggal Order</Text>
            <Text style={styles.infoValue}>
              {formatDate(orderDetail.tanggal_order)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Jenis Order</Text>
            <View style={styles.badgeRow}>
              <Icon
                name={
                  orderDetail.jenis_order === 'online'
                    ? 'globe-outline'
                    : 'storefront-outline'
                }
                size={14}
                color="#64748B"
              />
              <Text style={styles.infoValue}>
                {orderDetail.jenis_order === 'online' ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kecepatan</Text>
            <View style={styles.badgeRow}>
              <Icon
                name={
                  orderDetail.kecepatan_pengerjaan === 'normal'
                    ? 'time-outline'
                    : 'flash-outline'
                }
                size={14}
                color="#64748B"
              />
              <Text style={styles.infoValue}>
                {orderDetail.kecepatan_pengerjaan === 'normal'
                  ? 'Normal'
                  : 'Express'}
              </Text>
            </View>
          </View>
          {orderDetail.tanggal_selesai && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tanggal Selesai</Text>
                <Text style={styles.infoValue}>
                  {formatDate(orderDetail.tanggal_selesai)}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Customer Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="person" size={20} color="#3B82F6" />
            <Text style={styles.cardTitle}>Informasi Pelanggan</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nama</Text>
            <Text style={styles.infoValue}>{orderDetail.nama_customer}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={[styles.infoValue, styles.infoValueSmall]}>
              {orderDetail.email_customer}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Telepon</Text>
            <Text style={styles.infoValue}>
              {orderDetail.telepon_customer || '-'}
            </Text>
          </View>
          {orderDetail.alamat_pengiriman && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>Alamat Pengiriman</Text>
                <Text style={styles.infoValueMultiline}>
                  {orderDetail.alamat_pengiriman}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Payment Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="card" size={20} color="#3B82F6" />
            <Text style={styles.cardTitle}>Informasi Pembayaran</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status Pembayaran</Text>
            <View
              style={[
                styles.paymentBadge,
                {
                  backgroundColor:
                    orderDetail.status_pembayaran === 'lunas'
                      ? '#D1FAE5'
                      : '#FEF3C7',
                },
              ]}
            >
              <Icon
                name={
                  orderDetail.status_pembayaran === 'lunas'
                    ? 'checkmark-circle'
                    : 'time'
                }
                size={14}
                color={
                  orderDetail.status_pembayaran === 'lunas'
                    ? '#059669'
                    : '#D97706'
                }
              />
              <Text
                style={[
                  styles.paymentBadgeText,
                  {
                    color:
                      orderDetail.status_pembayaran === 'lunas'
                        ? '#059669'
                        : '#D97706',
                  },
                ]}
              >
                {orderDetail.status_pembayaran === 'lunas'
                  ? 'Lunas'
                  : orderDetail.status_pembayaran === 'belum_bayar'
                  ? 'Belum Bayar'
                  : orderDetail.status_pembayaran}
              </Text>
            </View>
          </View>
          {orderDetail.metode_pembayaran && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Metode Pembayaran</Text>
                <Text style={styles.infoValue}>
                  {orderDetail.metode_pembayaran}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Items Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="cube" size={20} color="#3B82F6" />
            <Text style={styles.cardTitle}>Item Pesanan</Text>
          </View>
          {orderDetail.items.map((item, index) => (
            <View key={item.id_item}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.itemContainer}>
                {item.gambar_preview ? (
                  <Image
                    source={{ uri: item.gambar_preview }}
                    style={styles.itemImage}
                  />
                ) : (
                  <View style={styles.itemImagePlaceholder}>
                    <Icon name="cube-outline" size={24} color="#9CA3AF" />
                  </View>
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.nama_produk}</Text>
                  {item.ukuran && (
                    <View style={styles.itemDetailRow}>
                      <Icon name="resize-outline" size={12} color="#64748B" />
                      <Text style={styles.itemDetail}>
                        Ukuran: {item.ukuran}
                      </Text>
                    </View>
                  )}
                  <View style={styles.itemDetailRow}>
                    <Icon name="pricetag-outline" size={12} color="#64748B" />
                    <Text style={styles.itemDetail}>
                      {item.jumlah} x {formatPrice(item.harga_satuan)}
                    </Text>
                  </View>
                  {item.catatan_item && (
                    <View style={styles.itemNoteContainer}>
                      <Icon name="chatbox-outline" size={12} color="#3B82F6" />
                      <Text style={styles.itemNote}>{item.catatan_item}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.itemSubtotal}>
                  {formatPrice(item.subtotal)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Catatan Card */}
        {orderDetail.catatan && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="chatbox-ellipses" size={20} color="#3B82F6" />
              <Text style={styles.cardTitle}>Catatan Pelanggan</Text>
            </View>
            <Text style={styles.noteText}>{orderDetail.catatan}</Text>
          </View>
        )}

        {/* Price Summary Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="calculator" size={20} color="#3B82F6" />
            <Text style={styles.cardTitle}>Rincian Harga</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>
              {formatPrice(orderDetail.subtotal)}
            </Text>
          </View>
          {orderDetail.diskon > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Diskon</Text>
                <Text style={[styles.priceValue, styles.discountText]}>
                  - {formatPrice(orderDetail.diskon)}
                </Text>
              </View>
            </>
          )}
          {orderDetail.ongkir > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Ongkir</Text>
                <Text style={styles.priceValue}>
                  {formatPrice(orderDetail.ongkir)}
                </Text>
              </View>
            </>
          )}
          <View style={styles.dividerBold} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total Harga</Text>
            <Text style={styles.totalValue}>
              {formatPrice(orderDetail.total_harga)}
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Buttons */}
      {orderDetail.status_order === 'pending' && (
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              Alert.alert(
                'Batalkan Pesanan',
                'Apakah Anda yakin ingin membatalkan pesanan ini?',
                [
                  { text: 'Tidak', style: 'cancel' },
                  {
                    text: 'Ya, Batalkan',
                    style: 'destructive',
                    onPress: () => {
                      Alert.alert('Info', 'Fitur ini akan segera tersedia');
                    },
                  },
                ],
              );
            }}
          >
            <Icon name="close-circle" size={20} color="#DC2626" />
            <Text style={styles.cancelButtonText}>Batalkan Pesanan</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 16,
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
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  scrollView: {
    flex: 1,
  },
  statusContainer: {
    padding: 24,
    alignItems: 'center',
  },
  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  statusLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoColumn: {
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
    textAlign: 'right',
    maxWidth: '60%',
  },
  infoValueSmall: {
    fontSize: 12,
  },
  infoValueMultiline: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '500',
    marginTop: 8,
    lineHeight: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0F2FE',
    marginVertical: 4,
  },
  dividerBold: {
    height: 2,
    backgroundColor: '#BFDBFE',
    marginVertical: 8,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  paymentBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    gap: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  itemDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  itemDetail: {
    fontSize: 13,
    color: '#64748B',
  },
  itemNoteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: 4,
  },
  itemNote: {
    flex: 1,
    fontSize: 12,
    color: '#3B82F6',
    fontStyle: 'italic',
  },
  itemSubtotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  noteText: {
    fontSize: 14,
    color: '#1E3A8A',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  priceLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  priceValue: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  discountText: {
    color: '#DC2626',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingBottom: 32,
    elevation: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
});
