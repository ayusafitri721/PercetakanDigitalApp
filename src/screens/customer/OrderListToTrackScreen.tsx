// screens/customer/OrderListToTrackScreen.tsx
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
import { API_BASE_URL } from '../../config/api';

interface OrderListToTrackProps {
  userId: string;
  onBack: () => void;
  onSelectOrder: (orderId: string) => void;
}

interface Order {
  id: string;
  orderNumber: string;
  serviceName: string;
  serviceIcon: string;
  status: string;
  totalPrice: number;
  quantity: number;
  date: string;
  estimatedDate?: string;
  paymentMethod?: string;
}

function getIconByCategory(cat: string): string {
  const lower = cat.toLowerCase();
  if (lower.includes('dokumen')) return '📄';
  if (lower.includes('banner')) return '🎨';
  if (lower.includes('kaos')) return '👕';
  if (lower.includes('stiker')) return '🏷️';
  if (lower.includes('packaging')) return '📦';
  if (lower.includes('foto')) return '📸';
  return '🖨️';
}

function getStatusConfig(status: string) {
  const configs: any = {
    pending: { label: 'Menunggu', bgColor: '#FEF3C7', textColor: '#D97706' },
    validasi: { label: 'Validasi', bgColor: '#DBEAFE', textColor: '#2563EB' },
    proses: { label: 'Diproses', bgColor: '#E0E7FF', textColor: '#4F46E5' },
    cetak: { label: 'Sedang Cetak', bgColor: '#DDD6FE', textColor: '#7C3AED' },
    siap: { label: 'Siap', bgColor: '#D1FAE5', textColor: '#059669' },
    dikirim: { label: 'Dikirim', bgColor: '#BFDBFE', textColor: '#1D4ED8' },
    selesai: { label: 'Selesai', bgColor: '#D1FAE5', textColor: '#10B981' },
    dibatalkan: {
      label: 'Dibatalkan',
      bgColor: '#FEE2E2',
      textColor: '#DC2626',
    },
  };
  return configs[status.toLowerCase()] || configs.pending;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  return date.toLocaleDateString('id-ID', options);
}

export default function OrderListToTrackScreen({
  userId,
  onBack,
  onSelectOrder,
}: OrderListToTrackProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersResponse = await axios.get(`${API_BASE_URL}/orders.php`);

      let allOrders = [];

      if (ordersResponse.data.status === 'success') {
        if (Array.isArray(ordersResponse.data.data)) {
          allOrders = ordersResponse.data.data;
        } else if (ordersResponse.data.data?.orders) {
          allOrders = ordersResponse.data.data.orders;
        } else if (ordersResponse.data.orders) {
          allOrders = ordersResponse.data.orders;
        }
      }

      if (!Array.isArray(allOrders)) {
        setOrders([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const userOrders = allOrders.filter(
        (order: any) => order.id_user?.toString() === userId.toString(),
      );

      // 👉 FILTER: Hanya order yang bisa di-track
      const trackableOrders = userOrders.filter((order: any) => {
        const status = order.status_order?.toLowerCase();
        return ['validasi', 'proses', 'siap', 'dikirim', 'selesai'].includes(
          status,
        );
      });

      if (trackableOrders.length === 0) {
        setOrders([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const ordersWithDetails = await Promise.all(
        trackableOrders.map(async (order: any) => {
          try {
            const itemsResponse = await axios.get(
              `${API_BASE_URL}/order_items.php`,
            );
            let allItems = [];

            if (itemsResponse.data.status === 'success') {
              if (Array.isArray(itemsResponse.data.data)) {
                allItems = itemsResponse.data.data;
              } else if (itemsResponse.data.data?.order_items) {
                allItems = itemsResponse.data.data.order_items;
              } else if (itemsResponse.data.data?.items) {
                allItems = itemsResponse.data.data.items;
              }
            }

            if (!Array.isArray(allItems)) {
              allItems = [];
            }

            const orderItems = allItems.filter(
              (item: any) =>
                item.id_order?.toString() === order.id_order?.toString(),
            );

            const totalQuantity = orderItems.reduce(
              (sum: number, item: any) => {
                const qty = parseInt(item.jumlah || item.quantity || '0');
                return sum + qty;
              },
              0,
            );

            const productName = orderItems[0]?.nama_product || 'Produk';
            const categoryName = orderItems[0]?.nama_category || '';

            return {
              id: order.id_order?.toString() || '',
              orderNumber: order.kode_order || `ORD-${order.id_order}`,
              serviceName: productName,
              serviceIcon: getIconByCategory(categoryName),
              status: order.status_order || 'pending',
              totalPrice: parseFloat(order.total_harga || 0),
              quantity: totalQuantity,
              date:
                order.tanggal_order || new Date().toISOString().split('T')[0],
              estimatedDate: order.estimasi_selesai || undefined,
              paymentMethod: order.metode_pembayaran || '',
            };
          } catch (error) {
            console.error('Error fetching items:', error);
            return {
              id: order.id_order?.toString() || '',
              orderNumber: order.kode_order || `ORD-${order.id_order}`,
              serviceName: 'Produk',
              serviceIcon: '🖨️',
              status: order.status_order || 'pending',
              totalPrice: parseFloat(order.total_harga || 0),
              quantity: 0,
              date:
                order.tanggal_order || new Date().toISOString().split('T')[0],
              estimatedDate: order.estimasi_selesai || undefined,
              paymentMethod: order.metode_pembayaran || '',
            };
          }
        }),
      );

      ordersWithDetails.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setOrders(ordersWithDetails);
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      Alert.alert('Error', 'Gagal memuat data pesanan.');
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Lacak Pesanan</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Memuat pesanan...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Lacak Pesanan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📍</Text>
            <Text style={styles.emptyStateTitle}>Tidak Ada Pesanan Aktif</Text>
            <Text style={styles.emptyStateText}>
              Belum ada pesanan yang dapat dilacak saat ini
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>💡</Text>
              <Text style={styles.infoText}>
                Pilih pesanan di bawah untuk melihat tracking pengiriman
              </Text>
            </View>

            {orders.map(order => (
              <TrackableOrderCard
                key={order.id}
                order={order}
                onPress={() => onSelectOrder(order.id)}
              />
            ))}
            <View style={{ height: 20 }} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

function TrackableOrderCard({
  order,
  onPress,
}: {
  order: Order;
  onPress: () => void;
}) {
  const statusConfig = getStatusConfig(order.status);
  const isCOD = order.paymentMethod === 'cod';

  return (
    <TouchableOpacity
      style={styles.orderCard}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderLeft}>
          <Text style={styles.orderIcon}>{order.serviceIcon}</Text>
          <View>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <Text style={styles.orderDate}>{formatDate(order.date)}</Text>
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

      <View style={styles.orderDivider} />

      <View style={styles.orderBody}>
        <Text style={styles.orderServiceName}>{order.serviceName}</Text>
        <Text style={styles.orderQuantity}>Jumlah: {order.quantity} pcs</Text>
        {order.estimatedDate && (
          <Text style={styles.orderEstimated}>
            📅 Estimasi: {formatDate(order.estimatedDate)}
          </Text>
        )}
        {isCOD && (
          <View style={styles.codBadge}>
            <Text style={styles.codBadgeText}>💰 COD</Text>
          </View>
        )}
      </View>

      <View style={styles.orderFooter}>
        <View>
          <Text style={styles.orderPriceLabel}>Total Harga</Text>
          <Text style={styles.orderPrice}>
            Rp {order.totalPrice.toLocaleString('id-ID')}
          </Text>
        </View>
        <View style={styles.trackButton}>
          <Text style={styles.trackButtonText}>📍 Lacak →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
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
  backIcon: { fontSize: 24, color: '#1F2937' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  scrollView: { flex: 1 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  infoIcon: { fontSize: 24, marginRight: 12 },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '500',
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateIcon: { fontSize: 64, marginBottom: 20 },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  emptyStateText: { fontSize: 15, color: '#6B7280', textAlign: 'center' },
  orderCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  orderIcon: { fontSize: 32, marginRight: 12 },
  orderNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  orderDate: { fontSize: 12, color: '#6B7280' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  orderDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  orderBody: { marginBottom: 12 },
  orderServiceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  orderQuantity: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  orderEstimated: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '600',
    marginBottom: 4,
  },
  codBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  codBadgeText: { fontSize: 11, fontWeight: '600', color: '#D97706' },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderPriceLabel: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  orderPrice: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  trackButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 2,
  },
  trackButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});
