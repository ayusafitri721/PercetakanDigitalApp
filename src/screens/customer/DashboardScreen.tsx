// screens/customer/DashboardScreen.tsx (UPDATED)
import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Alert } from 'react-native';
import HomeScreen from './HomeScreen';
import CatalogScreen from './CatalogScreen';
import OrderFormScreen from './OrderFormScreen';
import CartOrderFormScreen from './CartOrderFormScreen'; // 👈 IMPORT FILE BARU
import CartScreen from './CartScreen';
import CheckoutScreen from './CheckoutScreen';
import OrderHistoryScreen from './OrderHistoryScreen';
import ProfileScreen from './ProfileScreen';

interface DashboardScreenProps {
  userData: {
    user: {
      id_user: string;
      nama: string;
      email: string;
      role: string;
      no_telepon?: string;
      alamat?: string;
    };
    token: string;
  } | null;
  onLogout: () => void;
}

// 👉 UPDATE TYPE dengan screen baru
export type CustomerScreen =
  | 'home'
  | 'catalog'
  | 'order' // Pesan langsung (3 step)
  | 'cart_order' // 👈 BARU! Tambah ke keranjang (1 step)
  | 'cart' // Lihat keranjang
  | 'checkout' // Checkout dari keranjang
  | 'history'
  | 'profile';

export default function DashboardScreen({
  userData,
  onLogout,
}: DashboardScreenProps) {
  const [currentScreen, setCurrentScreen] = useState<CustomerScreen>('home');
  const [selectedService, setSelectedService] = useState<any>(null);

  if (!userData) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      </View>
    );
  }

  const { user } = userData;

  // Navigation helper
  const navigate = (screen: CustomerScreen, data?: any) => {
    if (data) setSelectedService(data);
    setCurrentScreen(screen);
  };

  // Render screen based on current state
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen user={user} onNavigate={navigate} />;

      case 'catalog':
        return (
          <CatalogScreen
            onBack={() => navigate('home')}
            onSelectService={(service, mode) => {
              setSelectedService(service);
              // 👉 BEDAKAN MODE
              if (mode === 'cart') {
                navigate('cart_order'); // Pakai CartOrderFormScreen
              } else {
                navigate('order'); // Pakai OrderFormScreen
              }
            }}
            onViewCart={() => navigate('cart')} // 👈 Tombol cart di header
          />
        );

      // 👉 PESAN LANGSUNG (3 Step)
      case 'order':
        return (
          <OrderFormScreen
            service={selectedService}
            onBack={() => navigate('catalog')}
          />
        );

      // 👉 TAMBAH KE KERANJANG (1 Step - FILE BARU)
      case 'cart_order':
        return (
          <CartOrderFormScreen
            service={selectedService}
            onBack={() => navigate('cart')} // Setelah tambah, langsung ke cart
          />
        );

      // 👉 LIHAT KERANJANG
      case 'cart':
        return (
          <CartScreen
            onBack={() => navigate('catalog')}
            onCheckoutSuccess={(orderId, kodeOrder) => {
              Alert.alert(
                '✅ Pesanan Berhasil!',
                `Kode Order: ${kodeOrder}\n\nPesanan Anda sedang diproses.`,
                [
                  {
                    text: 'Lihat Riwayat',
                    onPress: () => navigate('history'),
                  },
                  {
                    text: 'Kembali ke Home',
                    onPress: () => navigate('home'),
                  },
                ],
              );
            }}
          />
        );

      // 👉 CHECKOUT (dari cart)
      case 'checkout':
        return (
          <CheckoutScreen
            onBack={() => navigate('cart')}
            onSuccess={() => {
              Alert.alert(
                '✅ Checkout Berhasil!',
                'Pesanan Anda sedang diproses.',
                [
                  {
                    text: 'OK',
                    onPress: () => navigate('home'),
                  },
                ],
              );
            }}
          />
        );

      case 'history':
        return (
          <OrderHistoryScreen
            userId={user.id_user}
            onBack={() => navigate('home')}
          />
        );

      case 'profile':
        return (
          <ProfileScreen
            user={user}
            onBack={() => navigate('home')}
            onLogout={onLogout}
          />
        );

      default:
        return <HomeScreen user={user} onNavigate={navigate} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
});
