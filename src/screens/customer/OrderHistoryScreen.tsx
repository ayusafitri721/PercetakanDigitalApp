// screens/customer/OrderHistoryScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';

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

// Dummy data untuk demo
const DUMMY_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2025-001',
    serviceName: 'Cetak Banner',
    serviceIcon: '🎴',
    status: 'processing',
    totalPrice: 150000,
    quantity: 2,
    date: '2025-01-15',
    estimatedDate: '2025-01-18',
  },
  {
    id: '2',
    orderNumber: 'ORD-2025-002',
    serviceName: 'Sablon Kaos',
    serviceIcon: '👕',
    status: 'validating',
    totalPrice: 75000,
    quantity: 5,
    date: '2025-01-14',
    estimatedDate: '2025-01-17',
  },
  {
    id: '3',
    orderNumber: 'ORD-2025-003',
    serviceName: 'Cetak Foto',
    serviceIcon: '📸',
    status: 'completed',
    totalPrice: 50000,
    quantity: 25,
    date: '2025-01-10',
  },
];

export default function OrderHistoryScreen({
  userId,
  onBack,
}: OrderHistoryScreenProps) {
  const [orders, setOrders] = useState<Order[]>(DUMMY_ORDERS);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const onRefresh = () => {
    setRefreshing(true);
    // Simulasi refresh data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Riwayat Pesanan</Text>
        <View style={{ width: 40 }} />
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
              <OrderCard key={order.id} order={order} />
            ))}
            <View style={{ height: 20 }} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

// Order Card Component
function OrderCard({ order }: { order: Order }) {
  const statusConfig = getStatusConfig(order.status);

  return (
    <TouchableOpacity style={styles.orderCard} activeOpacity={0.7}>
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
        <TouchableOpacity style={styles.detailButton}>
          <Text style={styles.detailButtonText}>Lihat Detail →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// Helper functions
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
