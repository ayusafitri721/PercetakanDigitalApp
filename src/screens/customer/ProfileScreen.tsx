// screens/customer/ProfileScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import EditProfileModal from './components/EditProfileModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import { API_BASE_URL } from '../../config/api';

interface ProfileScreenProps {
  user: {
    id_user: string;
    nama: string;
    email: string;
    role: string;
    no_telepon?: string;
    alamat?: string;
    kota?: string;
    provinsi?: string;
    foto_profil?: string;
    status_aktif?: number;
    tanggal_daftar?: string;
  };
  onBack: () => void;
  onLogout: () => void;
  onUpdateProfile: (updatedUser: any) => void;
}

export default function ProfileScreen({
  user,
  onBack,
  onLogout,
  onUpdateProfile,
}: ProfileScreenProps) {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Function untuk refresh user data dari server
  const refreshUserData = async () => {
    console.log('🔄 Refreshing user data...');
    setRefreshing(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/users.php?op=detail&id=${user.id_user}`,
      );
      const result = await response.json();

      if (result.success && result.data) {
        console.log('✅ User data refreshed:', result.data);
        onUpdateProfile(result.data);
      } else {
        console.error('❌ Failed to refresh user data:', result);
      }
    } catch (error) {
      console.error('❌ Error refreshing user data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAbout = () => {
    Alert.alert(
      'Tentang Aplikasi',
      'Percetakan App v1.0\n\nAplikasi pengelolaan usaha percetakan dan digital printing.\n\n© 2025 Kelompok 5',
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'Bantuan',
      'Hubungi kami:\n\nWhatsApp: 0812-3456-7890\nEmail: support@percetakan.com',
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity
          onPress={refreshUserData}
          style={styles.refreshButton}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#4F46E5" />
          ) : (
            <Icon name="refresh" size={24} color="#4F46E5" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user.nama.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{user.nama}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.roleBadge}>
            <Icon name="person" size={14} color="#4F46E5" />
            <Text style={styles.roleText}> {user.role}</Text>
          </View>
        </View>

        {/* User Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Informasi Akun</Text>
          <InfoRow
            icon="person-outline"
            label="Nama Lengkap"
            value={user.nama}
          />
          <InfoRow icon="mail-outline" label="Email" value={user.email} />
          {user.no_telepon && (
            <InfoRow
              icon="call-outline"
              label="No. Telepon"
              value={user.no_telepon}
            />
          )}
          {user.alamat && (
            <InfoRow
              icon="location-outline"
              label="Alamat"
              value={user.alamat}
            />
          )}
          {user.kota && (
            <InfoRow icon="business-outline" label="Kota" value={user.kota} />
          )}
          {user.provinsi && (
            <InfoRow
              icon="map-outline"
              label="Provinsi"
              value={user.provinsi}
            />
          )}
          <InfoRow icon="card-outline" label="User ID" value={user.id_user} />
          {user.tanggal_daftar && (
            <InfoRow
              icon="calendar-outline"
              label="Tanggal Daftar"
              value={new Date(user.tanggal_daftar).toLocaleDateString('id-ID')}
            />
          )}
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <MenuButton
            icon="create-outline"
            title="Edit Profile"
            subtitle="Ubah data profil Anda"
            onPress={() => setEditModalVisible(true)}
          />
          <MenuButton
            icon="lock-closed-outline"
            title="Ubah Password"
            subtitle="Ganti password akun"
            onPress={() => setPasswordModalVisible(true)}
          />
          <MenuButton
            icon="chatbubbles-outline"
            title="Bantuan"
            subtitle="Hubungi customer service"
            onPress={handleHelp}
          />
          <MenuButton
            icon="information-circle-outline"
            title="Tentang Aplikasi"
            subtitle="Versi & informasi aplikasi"
            onPress={handleAbout}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={onLogout}
          activeOpacity={0.8}
        >
          <Icon name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Percetakan App v1.0</Text>
          <Text style={styles.footerSubtext}>© 2025 Kelompok 5</Text>
        </View>
      </ScrollView>

      {/* Modals */}
      <EditProfileModal
        visible={editModalVisible}
        user={user}
        onClose={() => setEditModalVisible(false)}
        onUpdate={onUpdateProfile}
      />
      <ChangePasswordModal
        visible={passwordModalVisible}
        userId={user.id_user}
        onClose={() => setPasswordModalVisible(false)}
        onPasswordChanged={refreshUserData} // ✅ Callback refresh data
      />
    </View>
  );
}

// Info Row Component
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Icon name={icon} size={24} color="#6B7280" style={styles.infoIcon} />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

// Menu Button Component
function MenuButton({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.menuButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconContainer}>
        <Icon name={icon} size={24} color="#4F46E5" />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 40,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoIcon: {
    marginRight: 16,
    width: 30,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 24,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
    paddingTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#D1D5DB',
  },
});
