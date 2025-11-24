// screens/kurir/KurirDashboardScreen.tsx - Modern UI with Bottom Navbar
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
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import KurirActiveDeliveryScreen from './KurirActiveDeliveryScreen';

const { width } = Dimensions.get('window');

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
  deliveryStatus: 'ready' | 'delivered';
  orderDate: string;
  notes?: string;
}

import { API_BASE_URL } from '../../config/api';

function getStatusConfig(status: DeliveryOrder['deliveryStatus']) {
  const configs = {
    ready: {
      label: 'Siap Diambil',
      bgColor: '#DBEAFE',
      textColor: '#1E40AF',
    },
    delivered: {
      label: 'Terkirim',
      bgColor: '#D1FAE5',
      textColor: '#059669',
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

function mapDeliveryStatus(status: string): 'ready' | 'delivered' {
  const lower = status?.toLowerCase() || '';
  if (lower === 'siap') return 'ready';
  if (lower === 'selesai') return 'delivered';
  return 'ready';
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
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'profile'>(
    'home',
  );

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
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

      console.log('Total orders from API:', allOrders.length);

      const deliveryOrders = allOrders
        .filter((order: any) => {
          const status = order.status_order?.toLowerCase();
          const jenis = order.jenis_order?.toLowerCase();
          console.log(
            `Order ${order.kode_order}: jenis=${jenis}, status=${status}`,
          );
          return jenis === 'online' && ['siap', 'selesai'].includes(status);
        })
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

      console.log('Filtered delivery orders:', deliveryOrders.length);

      deliveryOrders.sort(
        (a: any, b: any) =>
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
      );

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
          (d: any) => d.deliveryStatus === 'ready',
        ).length,
      });

      setDeliveries(deliveryOrders);
    } catch (error: any) {
      console.error('Failed to fetch deliveries:', error);
      Alert.alert('Error', 'Gagal memuat data pengiriman');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePickup = (orderId: string) => {
    console.log('Opening detail for order:', orderId);
    setSelectedOrderId(orderId);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDeliveries();
  };

  const getFilteredDeliveries = () => {
    switch (filter) {
      case 'pending':
        return deliveries.filter(d => d.deliveryStatus === 'ready');
      case 'completed':
        return deliveries.filter(d => d.deliveryStatus === 'delivered');
      default:
        return deliveries;
    }
  };

  const filteredDeliveries = getFilteredDeliveries();

  if (selectedOrderId) {
    return (
      <KurirActiveDeliveryScreen
        orderId={selectedOrderId}
        onBack={() => {
          console.log('Back from detail');
          setSelectedOrderId(null);
        }}
        onComplete={() => {
          console.log('Delivery completed, refreshing...');
          fetchDeliveries();
          setSelectedOrderId(null);
        }}
      />
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Memuat data pengiriman...</Text>
      </View>
    );
  }

  const renderHomeContent = () => (
    <>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.statCardBlue]}>
          <View style={[styles.iconCircle, { backgroundColor: '#2563EB' }]}>
            <Icon name="cube-outline" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.statValue}>{stats.todayDeliveries}</Text>
          <Text style={styles.statLabel}>Pengiriman Hari Ini</Text>
        </View>

        <View style={[styles.statCard, styles.statCardGreen]}>
          <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}>
            <Icon name="checkmark-circle-outline" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.statValue}>{stats.completedToday}</Text>
          <Text style={styles.statLabel}>Selesai Hari Ini</Text>
        </View>

        <View style={[styles.statCard, styles.statCardOrange]}>
          <View style={[styles.iconCircle, { backgroundColor: '#EA580C' }]}>
            <Icon name="car-outline" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.statValue}>{stats.ongoingDeliveries}</Text>
          <Text style={styles.statLabel}>Siap Diantar</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Icon
            name="list-outline"
            size={18}
            color={filter === 'all' ? '#FFFFFF' : '#64748B'}
          />
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
          <Icon
            name="time-outline"
            size={18}
            color={filter === 'pending' ? '#FFFFFF' : '#64748B'}
          />
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
          <Icon
            name="checkmark-done-outline"
            size={18}
            color={filter === 'completed' ? '#FFFFFF' : '#64748B'}
          />
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
      {filteredDeliveries.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Icon name="cube-outline" size={48} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>Tidak Ada Pengiriman</Text>
          <Text style={styles.emptyText}>
            Belum ada pesanan ONLINE yang perlu dikirim
          </Text>
        </View>
      ) : (
        <>
          {filteredDeliveries.map(delivery => (
            <DeliveryCard
              key={delivery.id}
              delivery={delivery}
              onPickup={handlePickup}
            />
          ))}
          <View style={styles.bottomPadding} />
        </>
      )}
    </>
  );

  const renderHistoryContent = () => {
    const completedDeliveries = deliveries.filter(
      d => d.deliveryStatus === 'delivered',
    );

    return (
      <>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Riwayat Pengiriman</Text>
          <Text style={styles.historySubtitle}>
            Total {completedDeliveries.length} pengiriman selesai
          </Text>
        </View>

        {completedDeliveries.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Icon name="time-outline" size={48} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Riwayat</Text>
            <Text style={styles.emptyText}>
              Riwayat pengiriman yang selesai akan muncul di sini
            </Text>
          </View>
        ) : (
          <>
            {completedDeliveries.map(delivery => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                onPickup={handlePickup}
              />
            ))}
            <View style={styles.bottomPadding} />
          </>
        )}
      </>
    );
  };

  const renderProfileContent = () => (
    <View style={styles.profileContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {userName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.profileName}>{userName}</Text>
        <Text style={styles.profileRole}>Kurir Pengiriman</Text>
      </View>

      <View style={styles.profileStats}>
        <View style={styles.profileStatItem}>
          <Text style={styles.profileStatValue}>{stats.todayDeliveries}</Text>
          <Text style={styles.profileStatLabel}>Total Hari Ini</Text>
        </View>
        <View style={styles.profileStatDivider} />
        <View style={styles.profileStatItem}>
          <Text style={styles.profileStatValue}>{stats.completedToday}</Text>
          <Text style={styles.profileStatLabel}>Selesai</Text>
        </View>
        <View style={styles.profileStatDivider} />
        <View style={styles.profileStatItem}>
          <Text style={styles.profileStatValue}>{deliveries.length}</Text>
          <Text style={styles.profileStatLabel}>Total</Text>
        </View>
      </View>

      <View style={styles.profileMenu}>
        <TouchableOpacity style={styles.profileMenuItem}>
          <View style={styles.profileMenuLeft}>
            <View
              style={[styles.profileMenuIcon, { backgroundColor: '#DBEAFE' }]}
            >
              <Icon name="person-outline" size={20} color="#2563EB" />
            </View>
            <Text style={styles.profileMenuText}>Informasi Akun</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileMenuItem}>
          <View style={styles.profileMenuLeft}>
            <View
              style={[styles.profileMenuIcon, { backgroundColor: '#FEF3C7' }]}
            >
              <Icon name="notifications-outline" size={20} color="#D97706" />
            </View>
            <Text style={styles.profileMenuText}>Notifikasi</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileMenuItem}>
          <View style={styles.profileMenuLeft}>
            <View
              style={[styles.profileMenuIcon, { backgroundColor: '#E0E7FF' }]}
            >
              <Icon name="settings-outline" size={20} color="#4F46E5" />
            </View>
            <Text style={styles.profileMenuText}>Pengaturan</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileMenuItem}>
          <View style={styles.profileMenuLeft}>
            <View
              style={[styles.profileMenuIcon, { backgroundColor: '#DBEAFE' }]}
            >
              <Icon name="help-circle-outline" size={20} color="#2563EB" />
            </View>
            <Text style={styles.profileMenuText}>Bantuan</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <Icon name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutBtnText}>Keluar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerGreeting}>Halo, {userName}</Text>
            <Text style={styles.headerSubtitle}>
              {activeTab === 'home' && 'Siap untuk mengantar pesanan hari ini'}
              {activeTab === 'history' && 'Lihat riwayat pengiriman Anda'}
              {activeTab === 'profile' && 'Kelola profil dan pengaturan'}
            </Text>
          </View>
          {activeTab === 'home' && (
            <TouchableOpacity style={styles.notificationButton}>
              <Icon name="notifications-outline" size={24} color="#FFFFFF" />
              {stats.ongoingDeliveries > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {stats.ongoingDeliveries}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563EB']}
            tintColor="#2563EB"
          />
        }
      >
        {activeTab === 'home' && renderHomeContent()}
        {activeTab === 'history' && renderHistoryContent()}
        {activeTab === 'profile' && renderProfileContent()}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('home')}
        >
          <Icon
            name={activeTab === 'home' ? 'home' : 'home-outline'}
            size={24}
            color={activeTab === 'home' ? '#2563EB' : '#94A3B8'}
          />
          <Text
            style={[
              styles.navText,
              activeTab === 'home' && styles.navTextActive,
            ]}
          >
            Beranda
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('history')}
        >
          <Icon
            name={activeTab === 'history' ? 'time' : 'time-outline'}
            size={24}
            color={activeTab === 'history' ? '#2563EB' : '#94A3B8'}
          />
          <Text
            style={[
              styles.navText,
              activeTab === 'history' && styles.navTextActive,
            ]}
          >
            Riwayat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('profile')}
        >
          <Icon
            name={activeTab === 'profile' ? 'person' : 'person-outline'}
            size={24}
            color={activeTab === 'profile' ? '#2563EB' : '#94A3B8'}
          />
          <Text
            style={[
              styles.navText,
              activeTab === 'profile' && styles.navTextActive,
            ]}
          >
            Profil
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DeliveryCard({
  delivery,
  onPickup,
}: {
  delivery: DeliveryOrder;
  onPickup: (id: string) => void;
}) {
  const statusConfig = getStatusConfig(delivery.deliveryStatus);

  return (
    <View style={styles.deliveryCard}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={styles.cardIconContainer}>
            <Icon name="cube-outline" size={24} color="#2563EB" />
          </View>
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

      {/* Body */}
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Icon
            name="person-outline"
            size={18}
            color="#64748B"
            style={styles.infoIcon}
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Nama Customer</Text>
            <Text style={styles.infoValue}>{delivery.customerName}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Icon
            name="call-outline"
            size={18}
            color="#64748B"
            style={styles.infoIcon}
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>No. Telepon</Text>
            <Text style={styles.infoValue}>{delivery.customerPhone}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Icon
            name="location-outline"
            size={18}
            color="#64748B"
            style={styles.infoIcon}
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Alamat Pengiriman</Text>
            <Text style={styles.infoValue}>{delivery.deliveryAddress}</Text>
          </View>
        </View>

        {delivery.notes && (
          <View style={styles.infoRow}>
            <Icon
              name="document-text-outline"
              size={18}
              color="#64748B"
              style={styles.infoIcon}
            />
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

        {delivery.deliveryStatus === 'ready' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onPickup(delivery.id)}
          >
            <Icon name="checkmark-circle" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Selesaikan</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#2563EB',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerGreeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#BFDBFE',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCardBlue: {
    borderTopWidth: 3,
    borderTopColor: '#2563EB',
  },
  statCardGreen: {
    borderTopWidth: 3,
    borderTopColor: '#059669',
  },
  statCardOrange: {
    borderTopWidth: 3,
    borderTopColor: '#EA580C',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    gap: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: '#2563EB',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  deliveryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    gap: 12,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
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
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  actionButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    elevation: 2,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 20,
  },
  historyHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  historySubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  profileContainer: {
    flex: 1,
    paddingTop: 20,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: '#64748B',
  },
  profileStats: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  profileStatLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  profileStatDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  profileMenu: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 8,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  profileMenuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileMenuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileMenuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '500',
  },
  navTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
});
