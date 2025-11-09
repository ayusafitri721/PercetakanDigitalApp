// screens/auth/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { register } from '../../config/authAPI';
import { API_BASE_URL } from '../../config/api';

interface RegisterScreenProps {
  onGoToLogin: () => void;
  onRegisterSuccess?: (userData: any) => void;
}

export default function RegisterScreen({
  onGoToLogin,
  onRegisterSuccess,
}: RegisterScreenProps) {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [noTelepon, setNoTelepon] = useState('');
  const [alamat, setAlamat] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validasi input
    if (!nama.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Nama, email, dan password harus diisi!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Format email tidak valid!');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter!');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Password dan konfirmasi password tidak sama!');
      return;
    }

    setLoading(true);

    try {
      // Panggil API register
      const data = await register({
        nama: nama.trim(),
        email: email.trim(),
        password,
        no_telepon: noTelepon.trim(),
        alamat: alamat.trim(),
      });

      if (data.success) {
        Alert.alert(
          '✅ Registrasi Berhasil!',
          'Akun Anda berhasil dibuat. Silakan login untuk melanjutkan.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setNama('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setNoTelepon('');
                setAlamat('');
                // Kembali ke login
                onGoToLogin();
              },
            },
          ],
        );
      } else {
        Alert.alert(
          '❌ Registrasi Gagal',
          data.message || 'Terjadi kesalahan saat registrasi',
        );
      }
    } catch (error: any) {
      Alert.alert('⚠️ Error', error.message || 'Tidak bisa connect ke server!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#10B981" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onGoToLogin}
              disabled={loading}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>📝</Text>
            </View>
            <Text style={styles.title}>Daftar Akun</Text>
            <Text style={styles.subtitle}>Buat akun baru Anda</Text>
          </View>

          <View style={styles.formCard}>
            {/* Nama */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Lengkap *</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan nama lengkap"
                  placeholderTextColor="#9CA3AF"
                  value={nama}
                  onChangeText={setNama}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  style={styles.input}
                  placeholder="contoh@email.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Minimal 6 karakter"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeIcon}>
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Konfirmasi Password *</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔐</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ulangi password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeIcon}>
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* No Telepon */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>No. Telepon (Opsional)</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>📱</Text>
                <TextInput
                  style={styles.input}
                  placeholder="08xxxxxxxxxx"
                  placeholderTextColor="#9CA3AF"
                  value={noTelepon}
                  onChangeText={setNoTelepon}
                  keyboardType="phone-pad"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Alamat */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Alamat (Opsional)</Text>
              <View style={styles.inputWrapperMultiline}>
                <Text style={styles.inputIcon}>📍</Text>
                <TextInput
                  style={styles.inputMultiline}
                  placeholder="Masukkan alamat lengkap"
                  placeholderTextColor="#9CA3AF"
                  value={alamat}
                  onChangeText={setAlamat}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  editable={!loading}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.registerButton,
                loading && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.registerButtonText}> Memproses...</Text>
                </View>
              ) : (
                <Text style={styles.registerButtonText}>Daftar Sekarang</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Sudah punya akun? </Text>
              <TouchableOpacity disabled={loading} onPress={onGoToLogin}>
                <Text style={styles.loginLink}>Masuk</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>📡 API: {API_BASE_URL}</Text>
            <Text style={styles.footerHint}>
              Pastikan API sudah jalan di komputer
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#10B981' },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: { alignItems: 'center', marginBottom: 30, position: 'relative' },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { fontSize: 24, color: '#FFFFFF' },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 8,
  },
  logoEmoji: { fontSize: 40 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: { fontSize: 15, color: '#D1FAE5' },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    elevation: 10,
  },
  inputGroup: { marginBottom: 18 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F9FAFB',
  },
  inputWrapperMultiline: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  inputIcon: { fontSize: 20, marginRight: 10 },
  input: { flex: 1, height: 50, fontSize: 15, color: '#1F2937' },
  inputMultiline: { flex: 1, fontSize: 15, color: '#1F2937', minHeight: 70 },
  eyeButton: { padding: 8 },
  eyeIcon: { fontSize: 20 },
  registerButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    elevation: 6,
  },
  registerButtonDisabled: { opacity: 0.7 },
  loadingContainer: { flexDirection: 'row', alignItems: 'center' },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  loginText: { fontSize: 14, color: '#6B7280' },
  loginLink: { fontSize: 14, color: '#10B981', fontWeight: '700' },
  footer: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#D1FAE5',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  footerHint: { fontSize: 10, color: '#A7F3D0', textAlign: 'center' },
});
