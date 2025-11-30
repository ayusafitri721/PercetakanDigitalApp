// screens/auth/LoginScreen.tsx (NO EMOJIS VERSION)
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
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../../config/authAPI';
import { API_BASE_URL } from '../../config/api';

const { width, height } = Dimensions.get('window');

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
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Email dan password harus diisi!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Format email tidak valid!');
      return;
    }

    setLoading(true);

    try {
      const data = await login({
        email: email.trim(),
        password: password,
      });

      console.log('Login Response:', JSON.stringify(data, null, 2));

      if (data.success && data.data) {
        console.log('Login Success!');
        console.log('User ID:', data.data.user.id_user);
        console.log('User Name:', data.data.user.nama);
        console.log('User Email:', data.data.user.email);

        // CRITICAL FIX: CLEAR OLD DATA FIRST
        console.log('Clearing old user data from storage...');
        await AsyncStorage.removeItem('userData');
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('currentUser');

        // SAVE NEW USER DATA PROPERLY
        const userDataToSave = {
          user: {
            id_user: data.data.user.id_user,
            nama: data.data.user.nama,
            email: data.data.user.email,
            role: data.data.user.role,
            no_telepon: data.data.user.no_telepon || '',
            alamat: data.data.user.alamat || '',
          },
          token: data.data.token,
          loginTime: new Date().toISOString(),
        };

        console.log('Saving user data to AsyncStorage:', userDataToSave);

        // Save di beberapa key untuk redundancy
        await AsyncStorage.setItem('userData', JSON.stringify(userDataToSave));
        await AsyncStorage.setItem('userToken', data.data.token);
        await AsyncStorage.setItem(
          'currentUser',
          JSON.stringify(data.data.user),
        );

        // Verify save berhasil
        const savedData = await AsyncStorage.getItem('userData');
        console.log('Verified saved data:', savedData ? 'SUCCESS' : 'FAILED');

        Alert.alert('Login Berhasil!', `Selamat datang ${data.data.user.nama}`);

        // Clear form
        setEmail('');
        setPassword('');

        // Pass complete user data
        onLoginSuccess({
          ...data.data,
          userId: data.data.user.id_user,
          user: data.data.user,
        });
      } else {
        console.log('Login Failed:', data.message);
        Alert.alert(
          'Login Gagal',
          data.message || 'Email atau password salah!',
        );
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      Alert.alert('Error', error.message || 'Tidak bisa connect ke server!');
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
          {/* Top Section with Background Pattern */}
          <ImageBackground
            source={require('../../assets/images/welcome-screen.png')}
            style={styles.topSection}
            resizeMode="cover"
            defaultSource={require('../../assets/images/welcome-screen.png')}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/Logo-Prin.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </ImageBackground>

          {/* Bottom Section - White Card dengan Login Form */}
          <View style={styles.bottomSection}>
            <View style={styles.loginCard}>
              {/* Login Title */}
              <Text style={styles.loginTitle}>Login</Text>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Icon
                    name="mail-outline"
                    size={22}
                    color="#5AB9EA"
                    style={styles.inputIcon}
                  />
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

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Icon
                    name="lock-closed-outline"
                    size={22}
                    color="#5AB9EA"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
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
                    <Icon
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={22}
                      color="#5AB9EA"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
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
                    <Text style={styles.loginButtonText}> Loading...</Text>
                  </View>
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>

              {/* Register Link */}
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Don't have account? </Text>
                <TouchableOpacity disabled={loading} onPress={onGoToRegister}>
                  <Text style={styles.registerLink}>Create one!</Text>
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
  topSection: {
    flex: 1,
    backgroundColor: '#5AB9EA',
    paddingTop: 50,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: height * 0.55,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoImage: {
    width: 200,
    height: 200,
    marginRight: 8,
  },
  bottomSection: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 28,
    minHeight: '45%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  loginCard: {
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5AB9EA',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F9FC',
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 56,
    borderWidth: 1,
    borderColor: '#E1EDF5',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#2C3E50',
  },
  eyeButton: {
    padding: 8,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#5AB9EA',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#5AB9EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  registerText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  registerLink: {
    fontSize: 14,
    color: '#5AB9EA',
    fontWeight: '700',
  },
});
