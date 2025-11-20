// App.tsx - FIXED VERSION dengan CartProvider
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartProvider } from './screens/customer/contexts/CartContext';
import WelcomeScreen from './screens/auth/WelcomeScreen';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import DashboardScreen from './screens/customer/DashboardScreen';
import KurirDashboardScreen from './screens/kurir/KurirDashboardScreen';

type Screen =
  | 'welcome'
  | 'login'
  | 'register'
  | 'customer_dashboard'
  | 'kurir_dashboard'
  | 'kasir_dashboard';

interface UserData {
  user: {
    id_user: string;
    nama: string;
    email: string;
    role: string;
    no_telepon?: string;
    alamat?: string;
  };
  token: string;
  userId?: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // ⭐⭐⭐ CHECK IF USER ALREADY LOGGED IN ⭐⭐⭐
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      console.log('🔍 Checking if user is already logged in...');
      const savedUserData = await AsyncStorage.getItem('userData');

      if (savedUserData) {
        const parsed = JSON.parse(savedUserData);
        console.log('✅ Found saved user session:', parsed.user.email);
        setUserData(parsed);

        // Route ke dashboard yang sesuai
        const role = parsed.user.role.toLowerCase();
        if (role === 'kurir') {
          setCurrentScreen('kurir_dashboard');
        } else if (role === 'kasir') {
          setCurrentScreen('kasir_dashboard');
        } else {
          setCurrentScreen('customer_dashboard');
        }
      } else {
        console.log('⚠️ No saved session found');
        setCurrentScreen('welcome');
      }
    } catch (error) {
      console.error('❌ Error checking login status:', error);
      setCurrentScreen('welcome');
    } finally {
      setLoading(false);
    }
  };

  // ⭐⭐⭐ SAVE USER DATA TO STORAGE ⭐⭐⭐
  const saveUserData = async (user: UserData) => {
    try {
      console.log('💾 Saving user data to AsyncStorage...');
      console.log('📦 Data to save:', {
        id: user.user.id_user,
        nama: user.user.nama,
        email: user.user.email,
        role: user.user.role,
      });

      // ⚠️ CRITICAL: Clear old data first
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('currentUser');

      // Save new data
      const dataToSave = {
        user: user.user,
        token: user.token,
        loginTime: new Date().toISOString(),
      };

      await AsyncStorage.setItem('userData', JSON.stringify(dataToSave));
      await AsyncStorage.setItem('userToken', user.token);
      await AsyncStorage.setItem('currentUser', JSON.stringify(user.user));

      // Verify save
      const verify = await AsyncStorage.getItem('userData');
      if (verify) {
        console.log('✅ User data saved successfully!');
        const parsed = JSON.parse(verify);
        console.log('✅ Verified:', parsed.user.email);
      } else {
        console.error('❌ Failed to save user data!');
      }
    } catch (error) {
      console.error('❌ Error saving user data:', error);
      Alert.alert('Error', 'Gagal menyimpan session. Silakan login ulang.');
    }
  };

  // ⭐⭐⭐ HANDLE LOGIN SUCCESS ⭐⭐⭐
  const handleLoginSuccess = async (user: UserData) => {
    console.log('🔐 Login Success Handler Called');
    console.log('📦 User Data:', {
      id: user.user.id_user,
      nama: user.user.nama,
      email: user.user.email,
      role: user.user.role,
    });

    // ⭐ SAVE TO STORAGE FIRST!
    await saveUserData(user);

    // ⭐ THEN SET STATE
    setUserData(user);

    // ⭐ THEN ROUTE
    const role = user.user.role.toLowerCase();
    if (role === 'kurir') {
      console.log('✅ Routing to Kurir Dashboard');
      setCurrentScreen('kurir_dashboard');
    } else if (role === 'kasir') {
      console.log('✅ Routing to Kasir Dashboard');
      setCurrentScreen('kasir_dashboard');
    } else {
      console.log('✅ Routing to Customer Dashboard');
      setCurrentScreen('customer_dashboard');
    }
  };

  // ⭐⭐⭐ HANDLE REGISTER SUCCESS ⭐⭐⭐
  const handleRegisterSuccess = async (user: UserData) => {
    console.log('📝 Register Success Handler Called');

    // Save to storage
    await saveUserData(user);

    // Set state
    setUserData(user);

    // Route to customer dashboard
    setCurrentScreen('customer_dashboard');
  };

  // ⭐⭐⭐ HANDLE LOGOUT ⭐⭐⭐
  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...');
      console.log('🧹 Current user:', userData?.user.email);

      // Clear AsyncStorage
      console.log('🗑️ Clearing AsyncStorage...');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('currentUser');

      // Optional: nuclear option untuk clear ALL
      // await AsyncStorage.clear();

      // Verify cleared
      const check = await AsyncStorage.getItem('userData');
      console.log('✅ Storage cleared:', check === null ? 'SUCCESS' : 'FAILED');

      // Reset state
      setUserData(null);
      setCurrentScreen('welcome');

      console.log('✅ Logout complete!');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Force reset anyway
      setUserData(null);
      setCurrentScreen('welcome');
    }
  };

  // ⭐ LOADING STATE
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5AB9EA" />
      </View>
    );
  }

  // ⭐⭐⭐ WRAP WITH CART PROVIDER ⭐⭐⭐
  return <CartProvider>{renderScreen()}</CartProvider>;

  // ⭐ RENDER SCREENS
  function renderScreen() {
    switch (currentScreen) {
      case 'welcome':
        return (
          <WelcomeScreen
            onGoToLogin={() => setCurrentScreen('login')}
            onGoToRegister={() => setCurrentScreen('register')}
          />
        );

      case 'login':
        return (
          <LoginScreen
            onGoToRegister={() => setCurrentScreen('register')}
            onLoginSuccess={handleLoginSuccess}
          />
        );

      case 'register':
        return (
          <RegisterScreen
            onGoToLogin={() => setCurrentScreen('login')}
            onRegisterSuccess={handleRegisterSuccess}
          />
        );

      case 'customer_dashboard':
        return <DashboardScreen userData={userData} onLogout={handleLogout} />;

      case 'kurir_dashboard':
        if (!userData) {
          setCurrentScreen('welcome');
          return null;
        }
        return (
          <KurirDashboardScreen
            userId={userData.user.id_user}
            userName={userData.user.nama}
            onLogout={handleLogout}
          />
        );

      case 'kasir_dashboard':
        if (!userData) {
          setCurrentScreen('welcome');
          return null;
        }
        return <DashboardScreen userData={userData} onLogout={handleLogout} />;

      default:
        console.warn('⚠️ Unknown screen:', currentScreen);
        return (
          <WelcomeScreen
            onGoToLogin={() => setCurrentScreen('login')}
            onGoToRegister={() => setCurrentScreen('register')}
          />
        );
    }
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
});
