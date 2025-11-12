// screens/customer/OrderHistoryScreen.tsx
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
import OrderDetailScreen from './OrderDetailScreen'; // TAMBAH IMPORT INI

interface OrderHistoryScreenProps {
  userId: string;
  onBack: () => void;
}

interface Order {
  id: string;
  orderNumber: string;
  serviceName: string;
  serviceIcon: string;
  status:
    | 'pending'
    | 'validating'
    | 'processing'
    | 'printing'
    | 'ready'
    | 'delivering'
    | 'completed'
    | 'cancelled';
  totalPrice: number;
  quantity: number;
  date: string;
  estimatedDate?: string;
}

import { API_BASE_URL } from '../../config/api';

// Helper functions
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

function mapOrderStatus(status: string): Order['status'] {
  const statusMap: { [key: string]: Order['status'] } = {
    pending: 'pending',
    dibayar: 'validating',
    diproses: 'processing',
    selesai: 'completed',
    dibatalkan: 'cancelled',
    validasi: 'validating',
    cetak: 'printing',
    siap: 'ready',
    dikirim: 'delivering',
  };
  return statusMap[status.toLowerCase()] || 'pending';
}

function getStatusConfig(status: Order['status']) {
  const configs = {
    pending: {
      label: 'Menunggu',
      bgColor: '#FEF3C7',
      textColor: '#D97706',
    },
    validating: {
      label: 'Validasi',
      bgColor: '#DBEAFE',
      textColor: '#2563EB',
    },
    processing: {
      label: 'Diproses',
      bgColor: '#E0E7FF',
      textColor: '#4F46E5',
    },
    printing: {
      label: 'Sedang Cetak',
      bgColor: '#DDD6FE',
      textColor: '#7C3AED',
    },
    ready: {
      label: 'Siap',
      bgColor: '#D1FAE5',
      textColor: '#059669',
    },
    delivering: {
      label: 'Dikirim',
      bgColor: '#BFDBFE',
      textColor: '#1D4ED8',
    },
    completed: {
      label: 'Selesai',
      bgColor: '#D1FAE5',
      textColor: '#10B981',
    },
    cancelled: {
      label: 'Dibatalkan',
      bgColor: '#FEE2E2',
      textColor: '#DC2626',
    },
  };
  return configs[status] || configs.pending;
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

export default function OrderHistoryScreen({
  userId,
  onBack,
}: OrderHistoryScreenProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // ✅ TAMBAH STATE UNTUK DETAIL SCREEN
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      console.log('🔍 Fetching orders for userId:', userId);
      console.log('🔍 UserId type:', typeof userId);

      const ordersResponse = await axios.get(`${API_BASE_URL}/orders.php`);

      console.log('📦 Orders response status:', ordersResponse.data.status);

      if (ordersResponse.data.status !== 'success') {
        throw new Error('Gagal mengambil data orders');
      }

      // Handle berbagai kemungkinan struktur response
      let allOrders = [];

      if (Array.isArray(ordersResponse.data.data)) {
        allOrders = ordersResponse.data.data;
      } else if (
        ordersResponse.data.data?.orders &&
        Array.isArray(ordersResponse.data.data.orders)
      ) {
        allOrders = ordersResponse.data.data.orders;
      } else if (
        ordersResponse.data.orders &&
        Array.isArray(ordersResponse.data.orders)
      ) {
        allOrders = ordersResponse.data.orders;
      }

      console.log('📊 Total orders from API:', allOrders.length);
      console.log('📊 First order sample:', allOrders[0]);

      const userOrders = allOrders.filter((order: any) => {
        const orderUserId = order.id_user?.toString();
        const currentUserId = userId.toString();
        return orderUserId === currentUserId;
      });

      console.log('✅ Filtered user orders:', userOrders.length);

      if (userOrders.length === 0) {
        console.warn('⚠️ No orders found for user:', userId);
        setOrders([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const ordersWithDetails = await Promise.all(
        userOrders.map(async (order: any) => {
          try {
            console.log('🔄 Fetching items for order:', order.id_order);

            const itemsResponse = await axios.get(
              `${API_BASE_URL}/order_items.php`,
            );

            // LOG FULL RESPONSE untuk debugging
            console.log(
              '📦 Order Items API Response:',
              JSON.stringify(itemsResponse.data, null, 2),
            );

            // Handle berbagai kemungkinan struktur response
            let allItems = [];

            if (itemsResponse.data.status === 'success') {
              if (Array.isArray(itemsResponse.data.data)) {
                allItems = itemsResponse.data.data;
              } else if (
                itemsResponse.data.data?.order_items &&
                Array.isArray(itemsResponse.data.data.order_items)
              ) {
                allItems = itemsResponse.data.data.order_items;
              } else if (
                itemsResponse.data.data?.items &&
                Array.isArray(itemsResponse.data.data.items)
              ) {
                allItems = itemsResponse.data.data.items;
              }
            }

            console.log(`📦 Total items from API: ${allItems.length}`);
            console.log(
              `📦 Items array type: ${
                Array.isArray(allItems) ? 'Array' : typeof allItems
              }`,
            );

            if (!Array.isArray(allItems)) {
              console.error('❌ allItems is not an array!', allItems);
              throw new Error('Invalid items data structure');
            }

            const orderItems = allItems.filter(
              (item: any) =>
                item.id_order?.toString() === order.id_order?.toString(),
            );

            console.log(
              `✅ Items for order ${order.id_order}:`,
              orderItems.length,
            );

            // LOG UNTUK DEBUG - Lihat struktur item yang sebenarnya
            if (orderItems.length > 0) {
              console.log(
                '🔍 First item structure:',
                JSON.stringify(orderItems[0], null, 2),
              );
            }

            // PERBAIKAN: Coba berbagai kemungkinan nama field quantity
            const totalQuantity = orderItems.reduce(
              (sum: number, item: any) => {
                // Coba berbagai kemungkinan nama field
                const qty = parseInt(
                  item.jumlah ||
                    item.quantity ||
                    item.qty ||
                    item.total ||
                    item.amount ||
                    item.kuantitas ||
                    item.jml ||
                    '0',
                );
                console.log(
                  `📊 Item quantity parsed: ${qty} (from field: ${JSON.stringify(
                    {
                      jumlah: item.jumlah,
                      quantity: item.quantity,
                      qty: item.qty,
                      total: item.total,
                      amount: item.amount,
                    },
                  )})`,
                );
                return sum + qty;
              },
              0,
            );

            console.log(`✅ Total quantity calculated: ${totalQuantity}`);

            const productName = orderItems[0]?.nama_product || 'Produk';
            const categoryName = orderItems[0]?.nama_category || '';

            const orderDetail = {
              id: order.id_order?.toString() || '',
              orderNumber: order.kode_order || `ORD-${order.id_order}`,
              serviceName: productName,
              serviceIcon: getIconByCategory(categoryName),
              status: mapOrderStatus(order.status_order),
              totalPrice: parseFloat(order.total_harga || 0),
              quantity: totalQuantity,
              date:
                order.tanggal_order || new Date().toISOString().split('T')[0],
              estimatedDate: order.estimasi_selesai || undefined,
            };

            console.log(
              '✅ Order detail created:',
              JSON.stringify(orderDetail, null, 2),
            );

            return orderDetail;
          } catch (error) {
            console.error(
              '❌ Error fetching items for order:',
              order.id_order,
              error,
            );
            return {
              id: order.id_order?.toString() || '',
              orderNumber: order.kode_order || `ORD-${order.id_order}`,
              serviceName: 'Produk',
              serviceIcon: '🖨️',
              status: mapOrderStatus(order.status_order),
              totalPrice: parseFloat(order.total_harga || 0),
              quantity: 0,
              date:
                order.tanggal_order || new Date().toISOString().split('T')[0],
              estimatedDate: order.estimasi_selesai || undefined,
            };
          }
        }),
      );

      ordersWithDetails.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      console.log('🎉 Final orders with details:', ordersWithDetails.length);
      console.log('🎉 Orders:', JSON.stringify(ordersWithDetails, null, 2));

      setOrders(ordersWithDetails);
    } catch (error: any) {
      console.error('❌ Failed to fetch orders:', error);
      console.error('❌ Error details:', error.response?.data);
      Alert.alert(
        'Error',
        'Gagal memuat riwayat pesanan. Periksa koneksi Anda.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getFilteredOrders = () => {
    switch (filter) {
      case 'active':
        return orders.filter(o =>
          [
            'pending',
            'validating',
            'processing',
            'printing',
            'ready',
            'delivering',
          ].includes(o.status),
        );
      case 'completed':
        return orders.filter(o =>
          ['completed', 'cancelled'].includes(o.status),
        );
      default:
        return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

  // ✅ JIKA DETAIL SCREEN AKTIF, TAMPILKAN DETAIL SCREEN
  if (selectedOrderId) {
    return (
      <OrderDetailScreen
        orderId={selectedOrderId}
        onBack={() => {
          setSelectedOrderId(null);
          fetchOrders(); // Refresh data setelah kembali
        }}
      />
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Riwayat Pesanan</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Memuat riwayat pesanan...</Text>
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
        <Text style={styles.title}>Riwayat Pesanan</Text>
        <View style={{ width: 40 }} />
      </View>

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
            filter === 'active' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('active')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'active' && styles.filterTabTextActive,
            ]}
          >
            Aktif
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

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📦</Text>
            <Text style={styles.emptyStateTitle}>Belum Ada Pesanan</Text>
            <Text style={styles.emptyStateText}>
              {filter === 'all'
                ? 'Anda belum memiliki pesanan'
                : filter === 'active'
                ? 'Tidak ada pesanan aktif'
                : 'Tidak ada pesanan selesai'}
            </Text>
          </View>
        ) : (
          <>
            {filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={() => setSelectedOrderId(order.id)} // ✅ TAMBAH HANDLER
              />
            ))}
            <View style={{ height: 20 }} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ✅ UPDATE OrderCard untuk handle press
function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const statusConfig = getStatusConfig(order.status);

  return (
    <TouchableOpacity
      style={styles.orderCard}
      activeOpacity={0.7}
      onPress={onPress} // ✅ TAMBAH onPress handler
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
      </View>

      <View style={styles.orderFooter}>
        <View>
          <Text style={styles.orderPriceLabel}>Total Harga</Text>
          <Text style={styles.orderPrice}>
            Rp {order.totalPrice.toLocaleString('id-ID')}
          </Text>
        </View>
        <TouchableOpacity style={styles.detailButton} onPress={onPress}>
          <Text style={styles.detailButtonText}>Lihat Detail →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
  backIcon: {
    fontSize: 24,
    color: '#1F2937',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
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
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: 16,
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
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderIcon: {
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
  orderDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  orderBody: {
    marginBottom: 12,
  },
  orderServiceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  orderQuantity: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  orderEstimated: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '600',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderPriceLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  orderPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  detailButton: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
});
