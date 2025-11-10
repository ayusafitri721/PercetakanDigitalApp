// screens/kurir/KurirDashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';

interface KurirDashboardProps {
  userId: string;
  userName: string;
  onLogout: () => void;
}

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  totalPrice: number;
  deliveryStatus: 'ready' | 'picked_up' | 'on_delivery' | 'delivered';
  orderDate: string;
  notes?: string;
}

import { API_BASE_URL } from '../../config/api';

function getStatusConfig(status: DeliveryOrder['deliveryStatus']) {
  const configs = {
    ready: {
      label: 'Siap Diambil',
      bgColor: '#FEF3C7',
      textColor: '#D97706',
      icon: '📦',
    },
    picked_up: {
      label: 'Sudah Diambil',
      bgColor: '#DBEAFE',
      textColor: '#2563EB',
      icon: '📋',
    },
    on_delivery: {
      label: 'Dalam Pengiriman',
      bgColor: '#E0E7FF',
      textColor: '#4F46E5',
      icon: '🚚',
    },
    delivered: {
      label: 'Terkirim',
      bgColor: '#D1FAE5',
      textColor: '#10B981',
      icon: '✅',
    },
  };
  return configs[status] || configs.ready;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleDateString('id-ID', options);
}

export default function KurirDashboardScreen({
  userId,
  userName,
  onLogout,
}: KurirDashboardProps) {
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    completedToday: 0,
    ongoingDeliveries: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);

      // Fetch orders yang siap untuk dikirim atau sedang dikirim
      const ordersResponse = await axios.get(`${API_BASE_URL}/orders.php`);

      if (ordersResponse.data.status !== 'success') {
        throw new Error('Gagal mengambil data orders');
      }

      let allOrders = [];
      if (Array.isArray(ordersResponse.data.data)) {
        allOrders = ordersResponse.data.data;
      } else if (ordersResponse.data.data?.orders) {
        allOrders = ordersResponse.data.data.orders;
      }

      // Filter orders yang sudah siap dikirim (status: siap, dikirim, selesai)
      const deliveryOrders = allOrders
        .filter((order: any) =>
          ['siap', 'dikirim', 'selesai'].includes(
            order.status_order?.toLowerCase(),
          ),
        )
        .map((order: any) => ({
          id: order.id_order?.toString() || '',
          orderNumber: order.kode_order || `ORD-${order.id_order}`,
          customerName: order.nama_customer || 'Customer',
          customerPhone: order.telepon_customer || '-',
          deliveryAddress: order.alamat_pengiriman || 'Alamat tidak tersedia',
          totalPrice: parseFloat(order.total_harga || 0),
          deliveryStatus: mapDeliveryStatus(order.status_order),
          orderDate: order.tanggal_order || new Date().toISOString(),
          notes: order.catatan || '',
        }));

      // Sort by date (terbaru dulu)
      deliveryOrders.sort(
        (a: any, b: any) =>
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
      );

      // Calculate stats
      const today = new Date().toDateString();
      const todayOrders = deliveryOrders.filter(
        (d: any) => new Date(d.orderDate).toDateString() === today,
      );

      setStats({
        todayDeliveries: todayOrders.length,
        completedToday: todayOrders.filter(
          (d: any) => d.deliveryStatus === 'delivered',
        ).length,
        ongoingDeliveries: deliveryOrders.filter(
          (d: any) => d.deliveryStatus === 'on_delivery',
        ).length,
      });

      setDeliveries(deliveryOrders);
    } catch (error: any) {
      console.error('❌ Failed to fetch deliveries:', error);
      Alert.alert('Error', 'Gagal memuat data pengiriman');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const mapDeliveryStatus = (
    status: string,
  ): DeliveryOrder['deliveryStatus'] => {
    const lower = status?.toLowerCase() || '';
    if (lower === 'siap') return 'ready';
    if (lower === 'dikirim') return 'on_delivery';
    if (lower === 'selesai') return 'delivered';
    return 'ready';
  };

  const handlePickup = async (orderId: string) => {
    Alert.alert(
      'Ambil Pesanan',
      'Konfirmasi bahwa Anda telah mengambil pesanan ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Ambil',
          onPress: async () => {
            try {
              await axios.put(`${API_BASE_URL}/orders.php`, {
                id_order: orderId,
                status_order: 'dikirim',
              });
              Alert.alert('Berhasil', 'Status pesanan diperbarui');
              fetchDeliveries();
            } catch (error) {
              Alert.alert('Error', 'Gagal memperbarui status');
            }
          },
        },
      ],
    );
  };

  const handleDeliver = async (orderId: string) => {
    Alert.alert(
      'Konfirmasi Pengiriman',
      'Apakah pesanan sudah diterima oleh customer?',
      [
        { text: 'Belum', style: 'cancel' },
        {
          text: 'Ya, Sudah',
          onPress: async () => {
            try {
              await axios.put(`${API_BASE_URL}/orders.php`, {
                id_order: orderId,
                status_order: 'selesai',
              });
              Alert.alert('✅ Berhasil', 'Pesanan berhasil dikirim!');
              fetchDeliveries();
            } catch (error) {
              Alert.alert('Error', 'Gagal memperbarui status');
            }
          },
        },
      ],
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDeliveries();
  };

  const getFilteredDeliveries = () => {
    switch (filter) {
      case 'pending':
        return deliveries.filter(d =>
          ['ready', 'picked_up', 'on_delivery'].includes(d.deliveryStatus),
        );
      case 'completed':
        return deliveries.filter(d => d.deliveryStatus === 'delivered');
      default:
        return deliveries;
    }
  };

  const filteredDeliveries = getFilteredDeliveries();

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard Kurir</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Memuat data pengiriman...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Halo, {userName}! 👋</Text>
          <Text style={styles.headerSubtitle}>Kurir Percetakan</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📦</Text>
          <Text style={styles.statValue}>{stats.todayDeliveries}</Text>
          <Text style={styles.statLabel}>Pengiriman Hari Ini</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>✅</Text>
          <Text style={styles.statValue}>{stats.completedToday}</Text>
          <Text style={styles.statLabel}>Selesai Hari Ini</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🚚</Text>
          <Text style={styles.statValue}>{stats.ongoingDeliveries}</Text>
          <Text style={styles.statLabel}>Sedang Dikirim</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'all' && styles.filterTabTextActive,
            ]}
          >
            Semua
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'pending' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('pending')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'pending' && styles.filterTabTextActive,
            ]}
          >
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'completed' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('completed')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'completed' && styles.filterTabTextActive,
            ]}
          >
            Selesai
          </Text>
        </TouchableOpacity>
      </View>

      {/* Delivery List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredDeliveries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Tidak Ada Pengiriman</Text>
            <Text style={styles.emptyText}>
              Belum ada pesanan yang perlu dikirim
            </Text>
          </View>
        ) : (
          <>
            {filteredDeliveries.map(delivery => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                onPickup={handlePickup}
                onDeliver={handleDeliver}
              />
            ))}
            <View style={{ height: 20 }} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

function DeliveryCard({
  delivery,
  onPickup,
  onDeliver,
}: {
  delivery: DeliveryOrder;
  onPickup: (id: string) => void;
  onDeliver: (id: string) => void;
}) {
  const statusConfig = getStatusConfig(delivery.deliveryStatus);

  return (
    <View style={styles.deliveryCard}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardIcon}>{statusConfig.icon}</Text>
          <View>
            <Text style={styles.orderNumber}>{delivery.orderNumber}</Text>
            <Text style={styles.orderDate}>
              {formatDate(delivery.orderDate)}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusConfig.bgColor },
          ]}
        >
          <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Customer Info */}
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>👤</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Nama Customer</Text>
            <Text style={styles.infoValue}>{delivery.customerName}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📞</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>No. Telepon</Text>
            <Text style={styles.infoValue}>{delivery.customerPhone}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📍</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Alamat Pengiriman</Text>
            <Text style={styles.infoValue}>{delivery.deliveryAddress}</Text>
          </View>
        </View>

        {delivery.notes && (
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📝</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Catatan</Text>
              <Text style={styles.infoValue}>{delivery.notes}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.priceLabel}>Total Harga</Text>
          <Text style={styles.priceValue}>
            Rp {delivery.totalPrice.toLocaleString('id-ID')}
          </Text>
        </View>

        {/* Action Buttons */}
        {delivery.deliveryStatus === 'ready' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onPickup(delivery.id)}
          >
            <Text style={styles.actionButtonText}>📦 Ambil Pesanan</Text>
          </TouchableOpacity>
        )}

        {delivery.deliveryStatus === 'on_delivery' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deliverButton]}
            onPress={() => onDeliver(delivery.id)}
          >
            <Text style={styles.actionButtonText}>✅ Sudah Terkirim</Text>
          </TouchableOpacity>
        )}
      </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerGreeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    marginTop: 4,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    fontSize: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#4F46E5',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  deliveryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  cardBody: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  actionButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  deliverButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
