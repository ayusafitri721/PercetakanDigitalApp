// screens/customer/HomeScreen.tsx - BALANCED BLUE THEME
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { CustomerScreen } from './DashboardScreen';

interface HomeScreenProps {
  user: {
    nama: string;
    email: string;
    [key: string]: any;
  };
  onNavigate: (screen: CustomerScreen) => void;
}

export default function HomeScreen({ user, onNavigate }: HomeScreenProps) {
  const [activeTab, setActiveTab] = React.useState('home');

  const handleTabPress = (tab: string, screen?: CustomerScreen) => {
    setActiveTab(tab);
    if (screen) {
      onNavigate(screen);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header - BLUE GRADIENT */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Halo,</Text>
              <Text style={styles.userName}>{user.nama} 👋</Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => onNavigate('profile')}
              activeOpacity={0.7}
            >
              <Icon name="person" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards - COLORFUL */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statCardBlue]}>
            <View style={[styles.iconCircle, { backgroundColor: '#3B82F6' }]}>
              <Icon name="cube-outline" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Total Pesanan</Text>
          </View>
          <View style={[styles.statCard, styles.statCardOrange]}>
            <View style={[styles.iconCircle, { backgroundColor: '#F59E0B' }]}>
              <Icon name="time-outline" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Diproses</Text>
          </View>
          <View style={[styles.statCard, styles.statCardGreen]}>
            <View style={[styles.iconCircle, { backgroundColor: '#10B981' }]}>
              <Icon name="checkmark-circle-outline" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.statNumber}>9</Text>
            <Text style={styles.statLabel}>Selesai</Text>
          </View>
        </View>

        {/* Quick Actions - COLORFUL */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Layanan Kami</Text>
          <View style={styles.servicesGrid}>
            <ServiceCard
              iconName="print-outline"
              title="Print"
              gradient="#3B82F6"
              onPress={() => onNavigate('catalog')}
            />
            <ServiceCard
              iconName="document-outline"
              title="Fotocopy"
              gradient="#8B5CF6"
              onPress={() => onNavigate('catalog')}
            />
            <ServiceCard
              iconName="color-palette-outline"
              title="Desain"
              gradient="#06B6D4"
              onPress={() => Alert.alert('Info', 'Fitur desain segera hadir!')}
            />
            <ServiceCard
              iconName="book-outline"
              title="Jilid"
              gradient="#10B981"
              onPress={() => Alert.alert('Info', 'Fitur jilid segera hadir!')}
            />
          </View>
        </View>

        {/* Promo Banner - BLUE GRADIENT */}
        <TouchableOpacity
          style={styles.promoBanner}
          activeOpacity={0.8}
          onPress={() =>
            Alert.alert('Promo', 'Diskon 20% untuk pesanan pertama!')
          }
        >
          <View style={styles.promoContent}>
            <Icon name="gift-outline" size={32} color="#FFFFFF" />
            <View style={styles.promoTextContainer}>
              <Text style={styles.promoTitle}>Promo Spesial!</Text>
              <Text style={styles.promoText}>Diskon 20% untuk member baru</Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Recent Orders */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pesanan Terbaru</Text>
            <TouchableOpacity onPress={() => onNavigate('history')}>
              <Text style={styles.seeAllText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          <OrderItem
            orderNumber="#ORD-2024-001"
            service="Print Berwarna"
            status="Diproses"
            date="20 Nov 2024"
            statusColor="#F59E0B"
          />
          <OrderItem
            orderNumber="#ORD-2024-002"
            service="Fotocopy A4"
            status="Selesai"
            date="19 Nov 2024"
            statusColor="#10B981"
          />
        </View>

        {/* Spacer for bottom nav */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Navigation - BLUE ACCENT */}
      <View style={styles.bottomNav}>
        <NavButton
          iconName="home"
          label="Home"
          isActive={activeTab === 'home'}
          onPress={() => handleTabPress('home')}
        />
        <NavButton
          iconName="navigate"
          label="Tracking"
          isActive={activeTab === 'tracking'}
          onPress={() => handleTabPress('tracking', 'tracking_list')}
        />
        <TouchableOpacity
          style={styles.fabButton}
          activeOpacity={0.8}
          onPress={() => onNavigate('catalog')}
        >
          <Icon name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>
        <NavButton
          iconName="receipt"
          label="Pesanan"
          isActive={activeTab === 'history'}
          onPress={() => handleTabPress('history', 'history')}
        />
        <NavButton
          iconName="person"
          label="Profil"
          isActive={activeTab === 'profile'}
          onPress={() => handleTabPress('profile', 'profile')}
        />
      </View>
    </View>
  );
}

// ServiceCard Component
function ServiceCard({
  iconName,
  title,
  gradient,
  onPress,
}: {
  iconName: string;
  title: string;
  gradient: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.serviceCard}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={[styles.serviceCardInner, { backgroundColor: gradient }]}>
        <Icon name={iconName} size={32} color="#FFFFFF" />
        <Text style={styles.serviceTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

// OrderItem Component
function OrderItem({
  orderNumber,
  service,
  status,
  date,
  statusColor,
}: {
  orderNumber: string;
  service: string;
  status: string;
  date: string;
  statusColor: string;
}) {
  return (
    <View style={styles.orderItem}>
      <View style={styles.orderLeft}>
        <Text style={styles.orderNumber}>{orderNumber}</Text>
        <Text style={styles.orderService}>{service}</Text>
        <View style={styles.orderDateContainer}>
          <Icon name="calendar-outline" size={14} color="#64748B" />
          <Text style={styles.orderDate}>{date}</Text>
        </View>
      </View>
      <View
        style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}
      >
        <Text style={[styles.statusText, { color: statusColor }]}>
          {status}
        </Text>
      </View>
    </View>
  );
}

// NavButton Component
function NavButton({
  iconName,
  label,
  isActive,
  onPress,
}: {
  iconName: string;
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.navButton}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Icon
        name={isActive ? iconName : iconName + '-outline'}
        size={24}
        color={isActive ? '#3B82F6' : '#94A3B8'}
      />
      <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#3B82F6',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: '#DBEAFE',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
    borderTopColor: '#3B82F6',
  },
  statCardOrange: {
    borderTopWidth: 3,
    borderTopColor: '#F59E0B',
  },
  statCardGreen: {
    borderTopWidth: 3,
    borderTopColor: '#10B981',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: '48%',
  },
  serviceCardInner: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
  },
  promoBanner: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    elevation: 4,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  promoTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  promoText: {
    fontSize: 13,
    color: '#DBEAFE',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  orderItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  orderLeft: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  orderService: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 6,
  },
  orderDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    fontSize: 12,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 100,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#3B82F6',
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -28,
    elevation: 8,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});
