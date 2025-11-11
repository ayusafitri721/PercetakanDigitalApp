// screens/kurir/KurirDeliveryDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

interface DeliveryDetailProps {
  orderId: string;
  onBack: () => void;
  onStatusUpdated: () => void;
}

interface OrderDetail {
  id_order: string;
  kode_order: string;
  nama_customer: string;
  telepon_customer: string;
  alamat_pengiriman: string;
  total_harga: number;
  status_order: string;
  tanggal_order: string;
  catatan: string;
  items: OrderItem[];
}

interface OrderItem {
  nama_produk: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
  ukuran?: string;
  catatan_item?: string;
}

export default function KurirDeliveryDetailScreen({
  orderId,
  onBack,
  onStatusUpdated,
}: DeliveryDetailProps) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/orders.php?op=detail&id=${orderId}`,
      );

      if (response.data.status === 'success') {
        setOrder(response.data.data);
      } else {
        throw new Error('Gagal memuat detail pesanan');
      }
    } catch (error) {
      console.error('Error fetching order detail:', error);
      Alert.alert('Error', 'Gagal memuat detail pesanan');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const handleCallCustomer = () => {
    if (order?.telepon_customer) {
      Linking.openURL(`tel:${order.telepon_customer}`);
    }
  };

  const handleOpenMaps = () => {
    if (order?.alamat_pengiriman) {
      const query = encodeURIComponent(order.alamat_pengiriman);
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${query}`,
      );
    }
  };

  const handleUpdateStatus = async (newStatus: 'dikirim' | 'selesai') => {
    const statusLabel =
      newStatus === 'dikirim' ? 'DALAM PENGIRIMAN' : 'SELESAI';
    const confirmMessage =
      newStatus === 'dikirim'
        ? 'Konfirmasi bahwa Anda sedang mengirim pesanan ini?'
        : 'Konfirmasi bahwa pesanan sudah diterima oleh customer?';

    Alert.alert('Konfirmasi', confirmMessage, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Ya, Lanjutkan',
        onPress: async () => {
          try {
            setUpdating(true);

            const formData = new FormData();
            formData.append('id_order', orderId);
            formData.append('status_order', newStatus);

            await axios.put(
              `${API_BASE_URL}/orders.php?id=${orderId}`,
              formData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              },
            );

            Alert.alert(
              '✅ Berhasil',
              `Status pesanan berhasil diperbarui ke ${statusLabel}`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    onStatusUpdated();
                    if (newStatus === 'selesai') {
                      onBack();
                    } else {
                      fetchOrderDetail();
                    }
                  },
                },
              ],
            );
          } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert('Error', 'Gagal memperbarui status pesanan');
          } finally {
            setUpdating(false);
          }
        },
      },
    ]);
  };

  const getStatusConfig = (status: string) => {
    const configs: any = {
      siap: {
        label: 'Siap Diambil',
        bgColor: '#FEF3C7',
        textColor: '#D97706',
        icon: '📦',
      },
      dikirim: {
        label: 'Dalam Pengiriman',
        bgColor: '#E0E7FF',
        textColor: '#4F46E5',
        icon: '🚚',
      },
      selesai: {
        label: 'Terkirim',
        bgColor: '#D1FAE5',
        textColor: '#10B981',
        icon: '✅',
      },
    };
    return configs[status] || configs.siap;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Pengiriman</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Memuat detail...</Text>
        </View>
      </View>
    );
  }

  if (!order) {
    return null;
  }

  const statusConfig = getStatusConfig(order.status_order);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Pengiriman</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusIcon}>{statusConfig.icon}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusConfig.bgColor },
            ]}
          >
            <Text
              style={[styles.statusText, { color: statusConfig.textColor }]}
            >
              {statusConfig.label}
            </Text>
          </View>
          <Text style={styles.orderNumber}>{order.kode_order}</Text>
          <Text style={styles.orderDate}>
            {new Date(order.tanggal_order).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Customer Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informasi Customer</Text>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>👤</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nama</Text>
              <Text style={styles.infoValue}>{order.nama_customer}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📞</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>No. Telepon</Text>
              <Text style={styles.infoValue}>{order.telepon_customer}</Text>
            </View>
            <TouchableOpacity
              onPress={handleCallCustomer}
              style={styles.actionIcon}
            >
              <Text style={styles.actionIconText}>📱</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Alamat Pengiriman</Text>
              <Text style={styles.infoValue}>{order.alamat_pengiriman}</Text>
            </View>
            <TouchableOpacity
              onPress={handleOpenMaps}
              style={styles.actionIcon}
            >
              <Text style={styles.actionIconText}>🗺️</Text>
            </TouchableOpacity>
          </View>

          {order.catatan && (
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📝</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Catatan Customer</Text>
                <Text style={styles.infoValue}>{order.catatan}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Order Items Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detail Pesanan</Text>
          <View style={styles.divider} />

          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.nama_produk}</Text>
                  {item.ukuran && (
                    <Text style={styles.itemDetail}>Ukuran: {item.ukuran}</Text>
                  )}
                  {item.catatan_item && (
                    <Text style={styles.itemDetail}>
                      Catatan: {item.catatan_item}
                    </Text>
                  )}
                  <Text style={styles.itemPrice}>
                    {item.jumlah} x Rp{' '}
                    {item.harga_satuan.toLocaleString('id-ID')}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  Rp {item.subtotal.toLocaleString('id-ID')}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Tidak ada item</Text>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Harga</Text>
            <Text style={styles.totalValue}>
              Rp {order.total_harga.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {order.status_order === 'siap' && (
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => handleUpdateStatus('dikirim')}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.buttonIcon}>🚚</Text>
                    <Text style={styles.buttonText}>Mulai Pengiriman</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          {order.status_order === 'dikirim' && (
            <>
              <View style={styles.deliveryNote}>
                <Text style={styles.noteIcon}>ℹ️</Text>
                <Text style={styles.noteText}>
                  Pastikan pesanan sudah diterima oleh customer sebelum
                  menyelesaikan pengiriman
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, styles.completeButton]}
                onPress={() => handleUpdateStatus('selesai')}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.buttonIcon}>✅</Text>
                    <Text style={styles.buttonText}>Selesaikan Pengiriman</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          {order.status_order === 'selesai' && (
            <View style={styles.completedNote}>
              <Text style={styles.completedIcon}>✅</Text>
              <Text style={styles.completedText}>Pengiriman telah selesai</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#4F46E5',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 2,
  },
  statusIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    lineHeight: 20,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionIconText: {
    fontSize: 18,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  actionContainer: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  deliveryNote: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  noteIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
  },
  completeButton: {
    backgroundColor: '#10B981',
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completedNote: {
    flexDirection: 'row',
    backgroundColor: '#D1FAE5',
    padding: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  completedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
  },
});
