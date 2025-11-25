// src/screens/customer/OrderTrackingScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

interface OrderTrackingProps {
  orderId: string;
  onBack: () => void;
}

interface OrderDetail {
  id_order: string;
  kode_order: string;
  status_order: string;
  status_pembayaran: string;
  metode_pembayaran: string;
  metode_pengiriman: string;
  total_harga: number;
  tanggal_order: string;
  nama_kurir?: string;
  telepon_kurir?: string;
  alamat_pengiriman: string;
  nama_penerima: string;
  telepon_penerima: string;
  tracking_history: TrackingEvent[];
}

interface TrackingEvent {
  status: string;
  timestamp: string;
  keterangan: string;
}

export default function OrderTrackingScreen({
  orderId,
  onBack,
}: OrderTrackingProps) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrderTracking();
    // Auto refresh setiap 30 detik
    const interval = setInterval(fetchOrderTracking, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrderTracking = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/orders.php?op=detail&id=${orderId}`,
      );

      if (response.data.status === 'success') {
        setOrder(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tracking:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrderTracking();
  };

  const handleCallKurir = () => {
    if (order?.telepon_kurir) {
      Linking.openURL(`tel:${order.telepon_kurir}`);
    }
  };

  const getStatusProgress = (status: string) => {
    const statusMap: any = {
      validasi: 1,
      proses: 2,
      siap: 3,
      dikirim: 4,
      selesai: 5,
    };
    return statusMap[status] || 1;
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      validasi: 'Menunggu Validasi',
      proses: 'Sedang Diproses',
      siap: 'Siap Dikirim',
      dikirim: 'Dalam Pengiriman',
      selesai: 'Pesanan Selesai',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      validasi: '#F59E0B',
      proses: '#3B82F6',
      siap: '#8B5CF6',
      dikirim: '#EF4444',
      selesai: '#10B981',
    };
    return colors[status] || '#6B7280';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lacak Pesanan</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Memuat tracking...</Text>
        </View>
      </View>
    );
  }

  if (!order) return null;

  const isCOD = order.metode_pembayaran === 'cod';
  const currentProgress = getStatusProgress(order.status_order);
  const statusColor = getStatusColor(order.status_order);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lacak Pesanan</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Order Number Card */}
        <View style={styles.orderCard}>
          <Text style={styles.orderNumber}>{order.kode_order}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor + '20' },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusLabel(order.status_order)}
            </Text>
          </View>
        </View>

        {/* Progress Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.cardTitle}>📦 Status Pengiriman</Text>
          <View style={styles.timeline}>
            {/* Validasi */}
            <View style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  currentProgress >= 1 && styles.timelineDotActive,
                ]}
              >
                <Text style={styles.timelineDotText}>
                  {currentProgress > 1 ? '✓' : '1'}
                </Text>
              </View>
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineTitle,
                    currentProgress >= 1 && styles.timelineTitleActive,
                  ]}
                >
                  Pesanan Diterima
                </Text>
                <Text style={styles.timelineDesc}>
                  Pesanan sedang divalidasi admin
                </Text>
              </View>
            </View>

            {currentProgress >= 1 && (
              <View
                style={[
                  styles.timelineLine,
                  currentProgress >= 2 && styles.timelineLineActive,
                ]}
              />
            )}

            {/* Proses */}
            <View style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  currentProgress >= 2 && styles.timelineDotActive,
                ]}
              >
                <Text style={styles.timelineDotText}>
                  {currentProgress > 2 ? '✓' : '2'}
                </Text>
              </View>
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineTitle,
                    currentProgress >= 2 && styles.timelineTitleActive,
                  ]}
                >
                  Sedang Diproses
                </Text>
                <Text style={styles.timelineDesc}>
                  Pesanan sedang diproduksi
                </Text>
              </View>
            </View>

            {currentProgress >= 2 && (
              <View
                style={[
                  styles.timelineLine,
                  currentProgress >= 3 && styles.timelineLineActive,
                ]}
              />
            )}

            {/* Siap */}
            <View style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  currentProgress >= 3 && styles.timelineDotActive,
                ]}
              >
                <Text style={styles.timelineDotText}>
                  {currentProgress > 3 ? '✓' : '3'}
                </Text>
              </View>
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineTitle,
                    currentProgress >= 3 && styles.timelineTitleActive,
                  ]}
                >
                  Siap Dikirim
                </Text>
                <Text style={styles.timelineDesc}>
                  Pesanan siap diambil kurir
                </Text>
              </View>
            </View>

            {currentProgress >= 3 && (
              <View
                style={[
                  styles.timelineLine,
                  currentProgress >= 4 && styles.timelineLineActive,
                ]}
              />
            )}

            {/* Dikirim */}
            <View style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  currentProgress >= 4 && styles.timelineDotActive,
                ]}
              >
                <Text style={styles.timelineDotText}>
                  {currentProgress > 4 ? '✓' : '4'}
                </Text>
              </View>
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineTitle,
                    currentProgress >= 4 && styles.timelineTitleActive,
                  ]}
                >
                  Dalam Pengiriman
                </Text>
                <Text style={styles.timelineDesc}>
                  {isCOD
                    ? 'Kurir sedang mengantar pesanan (COD)'
                    : 'Kurir sedang mengantar pesanan'}
                </Text>
              </View>
            </View>

            {currentProgress >= 4 && (
              <View
                style={[
                  styles.timelineLine,
                  currentProgress >= 5 && styles.timelineLineActive,
                ]}
              />
            )}

            {/* Selesai */}
            <View style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  currentProgress >= 5 && styles.timelineDotActive,
                ]}
              >
                <Text style={styles.timelineDotText}>
                  {currentProgress >= 5 ? '✓' : '5'}
                </Text>
              </View>
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineTitle,
                    currentProgress >= 5 && styles.timelineTitleActive,
                  ]}
                >
                  Pesanan Selesai
                </Text>
                <Text style={styles.timelineDesc}>
                  {isCOD
                    ? 'Pesanan diterima & pembayaran lunas'
                    : 'Pesanan telah diterima'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Kurir Info - Show when status >= dikirim */}
        {currentProgress >= 4 && order.nama_kurir && (
          <View style={styles.kurirCard}>
            <Text style={styles.cardTitle}>🚚 Informasi Kurir</Text>
            <View style={styles.kurirInfo}>
              <View style={styles.kurirAvatar}>
                <Text style={styles.kurirAvatarText}>
                  {order.nama_kurir.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.kurirDetails}>
                <Text style={styles.kurirName}>{order.nama_kurir}</Text>
                <Text style={styles.kurirPhone}>{order.telepon_kurir}</Text>
              </View>
              <TouchableOpacity
                style={styles.callButton}
                onPress={handleCallKurir}
              >
                <Text style={styles.callButtonText}>📞 Hubungi</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Payment Info - COD */}
        {isCOD && (
          <View style={styles.paymentCard}>
            <Text style={styles.cardTitle}>💰 Informasi Pembayaran</Text>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Metode:</Text>
              <Text style={styles.paymentValue}>COD (Bayar di Tempat)</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Status:</Text>
              <View
                style={[
                  styles.paymentBadge,
                  {
                    backgroundColor:
                      order.status_pembayaran === 'lunas'
                        ? '#D1FAE5'
                        : '#FEF3C7',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.paymentBadgeText,
                    {
                      color:
                        order.status_pembayaran === 'lunas'
                          ? '#10B981'
                          : '#D97706',
                    },
                  ]}
                >
                  {order.status_pembayaran === 'lunas'
                    ? '✅ Lunas'
                    : '⏳ Belum Bayar'}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.paymentRow}>
              <Text style={styles.totalLabel}>Total yang harus dibayar:</Text>
              <Text style={styles.totalValue}>
                Rp {order.total_harga.toLocaleString('id-ID')}
              </Text>
            </View>
            {order.status_pembayaran !== 'lunas' && (
              <View style={styles.codNote}>
                <Text style={styles.codNoteText}>
                  💡 Siapkan uang pas saat kurir tiba
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Delivery Address */}
        <View style={styles.addressCard}>
          <Text style={styles.cardTitle}>📍 Alamat Pengiriman</Text>
          <Text style={styles.addressName}>{order.nama_penerima}</Text>
          <Text style={styles.addressPhone}>{order.telepon_penerima}</Text>
          <Text style={styles.addressText}>{order.alamat_pengiriman}</Text>
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
  orderCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F3F4F6',
  },
  timelineDotActive: {
    backgroundColor: '#4F46E5',
  },
  timelineDotText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  timelineContent: {
    flex: 1,
    marginLeft: 16,
    paddingBottom: 8,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  timelineTitleActive: {
    color: '#1F2937',
  },
  timelineDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  timelineLine: {
    width: 3,
    height: 32,
    backgroundColor: '#E5E7EB',
    marginLeft: 14.5,
    marginVertical: -4,
  },
  timelineLineActive: {
    backgroundColor: '#4F46E5',
  },
  kurirCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },
  kurirInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kurirAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  kurirAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  kurirDetails: {
    flex: 1,
  },
  kurirName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  kurirPhone: {
    fontSize: 13,
    color: '#6B7280',
  },
  callButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  callButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  paymentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  paymentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  codNote: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  codNoteText: {
    fontSize: 13,
    color: '#92400E',
    textAlign: 'center',
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },
  addressName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
});
