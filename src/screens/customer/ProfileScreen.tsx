// screens/customer/ProfileScreen.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

interface ProfileScreenProps {
  user: {
    id_user: string;
    nama: string;
    email: string;
    role: string;
    no_telepon?: string;
    alamat?: string;
  };
  onBack: () => void;
  onLogout: () => void;
}

export default function ProfileScreen({
  user,
  onBack,
  onLogout,
}: ProfileScreenProps) {
  const handleEditProfile = () => {
    Alert.alert('Info', 'Fitur edit profile segera hadir!');
  };

  const handleChangePassword = () => {
    Alert.alert('Info', 'Fitur ubah password segera hadir!');
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
      'Hubungi kami:\n\n📱 WhatsApp: 0812-3456-7890\n📧 Email: support@percetakan.com',
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <View style={{ width: 40 }} />
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
            <Text style={styles.roleText}>👤 {user.role}</Text>
          </View>
        </View>

        {/* User Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Informasi Akun</Text>
          <InfoRow icon="👤" label="Nama Lengkap" value={user.nama} />
          <InfoRow icon="📧" label="Email" value={user.email} />
          {user.no_telepon && (
            <InfoRow icon="📱" label="No. Telepon" value={user.no_telepon} />
          )}
          {user.alamat && (
            <InfoRow icon="📍" label="Alamat" value={user.alamat} />
          )}
          <InfoRow icon="🆔" label="User ID" value={user.id_user} />
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <MenuButton
            icon="✏️"
            title="Edit Profile"
            subtitle="Ubah data profil Anda"
            onPress={handleEditProfile}
          />
          <MenuButton
            icon="🔒"
            title="Ubah Password"
            subtitle="Ganti password akun"
            onPress={handleChangePassword}
          />
          <MenuButton
            icon="💬"
            title="Bantuan"
            subtitle="Hubungi customer service"
            onPress={handleHelp}
          />
          <MenuButton
            icon="ℹ️"
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
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Percetakan App v1.0</Text>
          <Text style={styles.footerSubtext}>© 2025 Kelompok 5</Text>
        </View>
      </ScrollView>
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
      <Text style={styles.infoIcon}>{icon}</Text>
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
        <Text style={styles.menuIcon}>{icon}</Text>
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.menuArrow}>→</Text>
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
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
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
    fontSize: 24,
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
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 8,
    elevation: 2,
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
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 24,
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
  menuArrow: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    marginHorizontal: 24,
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
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
