// screens/customer/HomeScreen.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
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
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
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
            <Text style={styles.profileIcon}>
              {user.nama.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Action Card */}
      <View style={styles.quickActionCard}>
        <Text style={styles.quickActionTitle}>🎨 Buat Pesanan Baru</Text>
        <Text style={styles.quickActionSubtitle}>
          Mulai cetak desain Anda sekarang!
        </Text>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => onNavigate('catalog')}
          activeOpacity={0.8}
        >
          <Text style={styles.quickActionButtonText}>Pesan Sekarang →</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Grid */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Menu Utama</Text>
        <View style={styles.menuGrid}>
          <MenuCard
            icon="📦"
            title="Riwayat Pesanan"
            description="Lihat pesanan Anda"
            color="#4F46E5"
            onPress={() => onNavigate('history')}
          />
          <MenuCard
            icon="📋"
            title="Katalog Layanan"
            description="Jenis cetak"
            color="#10B981"
            onPress={() => onNavigate('catalog')}
          />
          <MenuCard
            icon="🚚"
            title="Tracking"
            description="Lacak pengiriman"
            color="#F59E0B"
            onPress={() => Alert.alert('Info', 'Fitur tracking segera hadir!')}
          />
          <MenuCard
            icon="💬"
            title="Bantuan"
            description="Hubungi kami"
            color="#6366F1"
            onPress={() => Alert.alert('Bantuan', 'WhatsApp: 0812-3456-7890')}
          />
        </View>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerIcon}>ℹ️</Text>
        <View style={styles.infoBannerContent}>
          <Text style={styles.infoBannerTitle}>Proses Cepat & Mudah</Text>
          <Text style={styles.infoBannerText}>
            Upload file → Pilih layanan → Bayar → Terima pesanan
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Percetakan App v1.0</Text>
      </View>
    </ScrollView>
  );
}

// MenuCard Component
function MenuCard({
  icon,
  title,
  description,
  color,
  onPress,
}: {
  icon: string;
  title: string;
  description: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.menuCard, { borderLeftColor: color }]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuDescription}>{description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  quickActionCard: {
    backgroundColor: '#4F46E5',
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 20,
    padding: 24,
    elevation: 4,
  },
  quickActionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  quickActionSubtitle: {
    fontSize: 15,
    color: '#E0E7FF',
    marginBottom: 16,
  },
  quickActionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  quickActionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4F46E5',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  menuCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    borderLeftWidth: 4,
  },
  menuIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#DBEAFE',
    marginHorizontal: 24,
    marginTop: 32,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  infoBannerIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: 13,
    color: '#3B82F6',
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
    paddingTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
