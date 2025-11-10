// screens/kurir/KurirHistoryScreen.tsx
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

interface KurirHistoryScreenProps {
  userId: string;
  onBack: () => void;
}

interface DeliveryHistory {
  id: string;
  orderNumber: string;
  customerName: string;
  deliveryAddress: string;
  totalPrice: number;
  deliveredDate: string;
  status: 'delivered' | 'cancelled';
}

import { API_BASE_URL } from '../../config/api'; // ✅ Import dari config

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleDateString('id-ID', options);
}

export default function KurirHistoryScreen({
  userId,
  onBack,
}: KurirHistoryScreenProps) {
  const [history, setHistory] = useState<DeliveryHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalDelivered: 0,
    thisWeek: 0,
    thisMonth: 0,
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      const ordersResponse = await axios.get(`${API_BASE_URL}/orders.php`);

      if (ordersResponse.data.status !== 'success') {
        throw new Error('Gagal mengambil data');
      }

      let allOrders = [];
      if (Array.isArray(ordersResponse.data.data)) {
        allOrders = ordersResponse.data.data;
      } else if (ordersResponse.data.data?.orders) {
        allOrders = ordersResponse.data.data.orders;
      }

      // Filter hanya yang sudah selesai atau dibatalkan
      const completedOrders = allOrders
        .filter((order: any) =>
          ['selesai', 'dibatalkan'].includes(order.status_order?.toLowerCase()),
        )
        .map((order: any) => ({
          id: order.id_order?.toString() || '',
          orderNumber: order.kode_order || `ORD-${order.id_order}`,
          customerName: order.nama_customer || 'Customer',
          deliveryAddress: order.alamat_pengiriman || '-',
          totalPrice: parseFloat(order.total_harga || 0),
          deliveredDate: order.tanggal_order || new Date().toISOString(),
          status:
            order.status_order?.toLowerCase() === 'selesai'
              ? 'delivered'
              : 'cancelled',
        }));

      // Sort by date (terbaru dulu)
      completedOrders.sort(
        (a: any, b: any) =>
          new Date(b.deliveredDate).getTime() -
          new Date(a.deliveredDate).getTime(),
      );

      // Calculate stats
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const deliveredOrders = completedOrders.filter(
        (h: any) => h.status === 'delivered',
      );

      setStats({
        totalDelivered: deliveredOrders.length,
        thisWeek: deliveredOrders.filter(
          (h: any) => new Date(h.deliveredDate) >= weekAgo,
        ).length,
        thisMonth: deliveredOrders.filter(
          (h: any) => new Date(h.deliveredDate) >= monthAgo,
        ).length,
      });

      setHistory(completedOrders);
    } catch (error: any) {
      console.error('❌ Failed to fetch history:', error);
      Alert.alert('Error', 'Gagal memuat riwayat pengiriman');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Riwayat Pengiriman</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Memuat riwayat...</Text>
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
        <Text style={styles.title}>Riwayat Pengiriman</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalDelivered}</Text>
          <Text style={styles.statLabel}>Total Terkirim</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.thisWeek}</Text>
          <Text style={styles.statLabel}>Minggu Ini</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.thisMonth}</Text>
          <Text style={styles.statLabel}>Bulan Ini</Text>
        </View>
      </View>

      {/* History List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Belum Ada Riwayat</Text>
            <Text style={styles.emptyText}>
              Riwayat pengiriman Anda akan muncul di sini
            </Text>
          </View>
        ) : (
          <>
            {history.map(item => (
              <HistoryCard key={item.id} item={item} />
            ))}
            <View style={{ height: 20 }} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

function HistoryCard({ item }: { item: DeliveryHistory }) {
  const isDelivered = item.status === 'delivered';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardIcon}>{isDelivered ? '✅' : '❌'}</Text>
          <View>
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            <Text style={styles.date}>{formatDate(item.deliveredDate)}</Text>
          </View>
        </View>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: isDelivered ? '#D1FAE5' : '#FEE2E2',
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: isDelivered ? '#10B981' : '#DC2626' },
            ]}
          >
            {isDelivered ? 'Terkirim' : 'Dibatalkan'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>👤</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Customer</Text>
            <Text style={styles.infoValue}>{item.customerName}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📍</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Alamat</Text>
            <Text style={styles.infoValue}>{item.deliveryAddress}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <Text style={styles.priceLabel}>Total Harga</Text>
        <Text style={styles.priceValue}>
          Rp {item.totalPrice.toLocaleString('id-ID')}
        </Text>
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
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
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
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
    fontSize: 28,
    marginRight: 12,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#6B7280',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
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
    fontSize: 18,
    marginRight: 10,
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
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
});
