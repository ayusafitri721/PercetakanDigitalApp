// screens/auth/LoginScreen.tsx
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
import { login } from '../../config/authAPI';
import { API_BASE_URL } from '../../config/api';

interface LoginScreenProps {
  onGoToRegister: () => void;
  onLoginSuccess: (userData: any) => void;
}

export default function LoginScreen({
  onGoToRegister,
  onLoginSuccess,
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validasi input kosong
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Email dan password harus diisi!');
      return;
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Format email tidak valid!');
      return;
    }

    setLoading(true);

    try {
      // Panggil API login
      const data = await login({
        email: email.trim(),
        password: password,
      });

      if (data.success && data.data) {
        Alert.alert(
          '✅ Login Berhasil!',
          `Selamat datang ${data.data.user.nama}`,
        );

        // Panggil callback success dengan data user
        onLoginSuccess(data.data);

        // Reset form
        setEmail('');
        setPassword('');
      } else {
        Alert.alert(
          '❌ Login Gagal',
          data.message || 'Email atau password salah!',
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
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
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
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🖨️</Text>
            </View>
            <Text style={styles.title}>Percetakan App</Text>
            <Text style={styles.subtitle}>Masuk ke akun Anda</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan password"
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

            <TouchableOpacity style={styles.forgotButton} disabled={loading}>
              <Text style={styles.forgotText}>Lupa password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.loginButtonText}> Memproses...</Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Masuk</Text>
              )}
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Belum punya akun? </Text>
              <TouchableOpacity disabled={loading} onPress={onGoToRegister}>
                <Text style={styles.registerLink}>Daftar</Text>
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
  container: { flex: 1, backgroundColor: '#4F46E5' },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: { alignItems: 'center', marginBottom: 40 },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
  },
  logoEmoji: { fontSize: 50 },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: '#E0E7FF' },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    elevation: 10,
  },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
  },
  inputIcon: { fontSize: 22, marginRight: 12 },
  input: { flex: 1, height: 54, fontSize: 16, color: '#1F2937' },
  eyeButton: { padding: 8 },
  eyeIcon: { fontSize: 22 },
  forgotButton: { alignSelf: 'flex-end', marginBottom: 24, marginTop: 4 },
  forgotText: { fontSize: 14, color: '#4F46E5', fontWeight: '600' },
  loginButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 6,
  },
  loginButtonDisabled: { opacity: 0.7 },
  loadingContainer: { flexDirection: 'row', alignItems: 'center' },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  registerText: { fontSize: 15, color: '#6B7280' },
  registerLink: { fontSize: 15, color: '#4F46E5', fontWeight: '700' },
  footer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#E0E7FF',
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  footerHint: { fontSize: 11, color: '#C7D2FE', textAlign: 'center' },
});
