// screens/customer/DashboardScreen.tsx - FIXED TRACKING
import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Alert } from 'react-native';
import HomeScreen from './HomeScreen';
import CatalogScreen from './CatalogScreen';
import OrderFormScreen from './OrderFormScreen';
import CartOrderFormScreen from './CartOrderFormScreen';
import CartScreen from './CartScreen';
import CheckoutScreen from './CheckoutScreen';
import OrderHistoryScreen from './OrderHistoryScreen';
import OrderTrackingScreen from './OrderTrackingScreen';
import OrderListToTrackScreen from './OrderListToTrackScreen';
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

export type CustomerScreen =
  | 'home'
  | 'catalog'
  | 'order'
  | 'cart_order'
  | 'cart'
  | 'checkout'
  | 'history'
  | 'tracking_list' // 👈 List order untuk tracking
  | 'tracking' // 👈 Detail tracking
  | 'profile';

export default function DashboardScreen({
  userData,
  onLogout,
}: DashboardScreenProps) {
  const [currentScreen, setCurrentScreen] = useState<CustomerScreen>('home');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  if (!userData) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      </View>
    );
  }

  const { user } = userData;

  const navigate = (screen: CustomerScreen, data?: any) => {
    if (data) {
      if (typeof data === 'string') {
        setSelectedOrderId(data);
      } else {
        setSelectedService(data);
      }
    }
    setCurrentScreen(screen);
  };

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
              if (mode === 'cart') {
                navigate('cart_order');
              } else {
                navigate('order');
              }
            }}
            onViewCart={() => navigate('cart')}
          />
        );

      case 'order':
        return (
          <OrderFormScreen
            service={selectedService}
            onBack={() => navigate('catalog')}
          />
        );

      case 'cart_order':
        return (
          <CartOrderFormScreen
            service={selectedService}
            onBack={() => navigate('cart')}
          />
        );

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

      // 👉 LIST ORDER UNTUK TRACKING (dari menu bottom nav)
      case 'tracking_list':
        return (
          <OrderListToTrackScreen
            userId={user.id_user}
            onBack={() => navigate('home')}
            onSelectOrder={orderId => {
              setSelectedOrderId(orderId);
              navigate('tracking');
            }}
          />
        );

      // 👉 DETAIL TRACKING SCREEN
      case 'tracking':
        if (!selectedOrderId) {
          // Kalau belum pilih order, balik ke list
          navigate('tracking_list');
          return null;
        }

        return (
          <OrderTrackingScreen
            orderId={selectedOrderId}
            onBack={() => {
              setSelectedOrderId(null);
              navigate('tracking_list'); // Balik ke list tracking
            }}
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
