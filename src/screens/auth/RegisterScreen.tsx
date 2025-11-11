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
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { register } from '../../config/authAPI';
import { API_BASE_URL } from '../../config/api';

const { width, height } = Dimensions.get('window');

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
      <StatusBar barStyle="light-content" backgroundColor="#5AB9EA" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Section with Background Pattern - SAMA SEPERTI LOGIN & WELCOME */}
          <ImageBackground
            source={require('../../assets/images/welcome-screen.png')}
            style={styles.topSection}
            resizeMode="cover"
            defaultSource={require('../../assets/images/welcome-screen.png')}
          >
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={onGoToLogin}
              disabled={loading}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>

            {/* Logo - Diperkecil */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/Logo-Prin.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </ImageBackground>

          {/* Bottom Section - White Card dengan Register Form */}
          <View style={styles.bottomSection}>
            <View style={styles.registerCard}>
              <Text style={styles.registerTitle}>Create Account</Text>
              <Text style={styles.registerSubtitle}>Buat akun baru Anda</Text>

              {/* Nama */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nama Lengkap"
                    placeholderTextColor="#A8C5DD"
                    value={nama}
                    onChangeText={setNama}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>📧</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#A8C5DD"
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
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Password (min. 6 characters)"
                    placeholderTextColor="#A8C5DD"
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
                      {showPassword ? '👁️' : '🔍'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🔐</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#A8C5DD"
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
                      {showConfirmPassword ? '👁️' : '🔍'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* No Telepon */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>📱</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number (Optional)"
                    placeholderTextColor="#A8C5DD"
                    value={noTelepon}
                    onChangeText={setNoTelepon}
                    keyboardType="phone-pad"
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Alamat */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapperMultiline}>
                  <Text style={styles.inputIcon}>📍</Text>
                  <TextInput
                    style={styles.inputMultiline}
                    placeholder="Address (Optional)"
                    placeholderTextColor="#A8C5DD"
                    value={alamat}
                    onChangeText={setAlamat}
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Register Button */}
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
                    <Text style={styles.registerButtonText}> Loading...</Text>
                  </View>
                ) : (
                  <Text style={styles.registerButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have account? </Text>
                <TouchableOpacity disabled={loading} onPress={onGoToLogin}>
                  <Text style={styles.loginLink}>Login here!</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5AB9EA',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  // SAMA SEPERTI LOGIN & WELCOME
  topSection: {
    backgroundColor: '#5AB9EA',
    paddingTop: 50,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 240, // Lebih pendek untuk register karena form lebih panjang
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  logoImage: {
    width: 140, // Diperkecil dari 200
    height: 140, // Diperkecil dari 200
  },
  // SAMA SEPERTI LOGIN & WELCOME
  bottomSection: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 35,
    paddingBottom: 40,
    paddingHorizontal: 28,
    minHeight: '60%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  registerCard: {
    alignItems: 'center',
  },
  registerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5AB9EA',
    marginBottom: 6,
  },
  registerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F9FC',
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 52,
    borderWidth: 1,
    borderColor: '#E1EDF5',
  },
  inputWrapperMultiline: {
    flexDirection: 'row',
    backgroundColor: '#F5F9FC',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E1EDF5',
    minHeight: 70,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
  },
  inputMultiline: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    minHeight: 50,
    textAlignVertical: 'top',
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 18,
  },
  registerButton: {
    width: '100%',
    backgroundColor: '#5AB9EA',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 18,
    elevation: 4,
    shadowColor: '#5AB9EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginText: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  loginLink: {
    fontSize: 13,
    color: '#5AB9EA',
    fontWeight: '700',
  },
});
