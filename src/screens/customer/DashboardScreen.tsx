// screens/customer/DashboardScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import HomeScreen from './HomeScreen';
import CatalogScreen from './CatalogScreen';
import OrderFormScreen from './OrderFormScreen';
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

export type CustomerScreen =
  | 'home'
  | 'catalog'
  | 'order'
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
            onSelectService={service => navigate('order', service)}
          />
        );

      case 'order':
        return (
          <OrderFormScreen
            service={selectedService}
            onBack={() => navigate('catalog')}
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
