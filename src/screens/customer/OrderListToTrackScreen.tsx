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
import Icon from 'react-native-vector-icons/Ionicons';
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
  if (lower.includes('dokumen')) return 'document-text';
  if (lower.includes('banner')) return 'color-palette';
  if (lower.includes('kaos')) return 'shirt';
  if (lower.includes('stiker')) return 'pricetag';
  if (lower.includes('packaging')) return 'cube';
  if (lower.includes('foto')) return 'camera';
  return 'print';
}

function getStatusConfig(status: string) {
  const configs: any = {
    pending: { label: 'Menunggu', bgColor: '#FEF3C7', textColor: '#D97706' },
    validasi: { label: 'Validasi', bgColor: '#DBEAFE', textColor: '#2563EB' },
    proses: { label: 'Diproses', bgColor: '#BFDBFE', textColor: '#1E40AF' },
    cetak: { label: 'Sedang Cetak', bgColor: '#93C5FD', textColor: '#1E3A8A' },
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
              serviceIcon: 'print',
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
            <Icon name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Lacak Pesanan</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Memuat pesanan...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
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
            <Icon name="location-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>Tidak Ada Pesanan Aktif</Text>
            <Text style={styles.emptyStateText}>
              Belum ada pesanan yang dapat dilacak saat ini
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.infoCard}>
              <Icon name="information-circle" size={24} color="#3B82F6" />
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
          <View style={styles.orderIconContainer}>
            <Icon name={order.serviceIcon} size={28} color="#3B82F6" />
          </View>
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
        <View style={styles.orderQuantityRow}>
          <Icon name="cube-outline" size={14} color="#64748B" />
          <Text style={styles.orderQuantity}>Jumlah: {order.quantity} pcs</Text>
        </View>
        {order.estimatedDate && (
          <View style={styles.orderEstimatedRow}>
            <Icon name="calendar-outline" size={14} color="#3B82F6" />
            <Text style={styles.orderEstimated}>
              Estimasi: {formatDate(order.estimatedDate)}
            </Text>
          </View>
        )}
        {isCOD && (
          <View style={styles.codBadge}>
            <Icon name="cash-outline" size={14} color="#D97706" />
            <Text style={styles.codBadgeText}>COD</Text>
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
          <Icon name="location" size={16} color="#FFFFFF" />
          <Text style={styles.trackButtonText}>Lacak</Text>
          <Icon name="arrow-forward" size={14} color="#FFFFFF" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F9FF' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#64748B',
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
  title: { fontSize: 20, fontWeight: 'bold', color: '#1E3A8A' },
  scrollView: { flex: 1 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    fontWeight: '500',
    lineHeight: 18,
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginTop: 16,
    marginBottom: 12,
  },
  emptyStateText: { fontSize: 15, color: '#64748B', textAlign: 'center' },
  orderCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  orderIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 2,
  },
  orderDate: { fontSize: 12, color: '#64748B' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  orderDivider: { height: 1, backgroundColor: '#E0F2FE', marginVertical: 12 },
  orderBody: { marginBottom: 12 },
  orderServiceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 6,
  },
  orderQuantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderQuantity: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 6,
  },
  orderEstimatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderEstimated: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
    marginLeft: 6,
  },
  codBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#F59E0B',
    gap: 4,
  },
  codBadgeText: { fontSize: 11, fontWeight: '600', color: '#D97706' },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderPriceLabel: { fontSize: 12, color: '#64748B', marginBottom: 2 },
  orderPrice: { fontSize: 18, fontWeight: 'bold', color: '#1E3A8A' },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    gap: 6,
  },
  trackButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});
