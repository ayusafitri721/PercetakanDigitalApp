// App.tsx - Router dengan Role-based Navigation
import React, { useState } from 'react';
import WelcomeScreen from './screens/auth/WelcomeScreen';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import DashboardScreen from './screens/customer/DashboardScreen';
import KurirDashboardScreen from './screens/kurir/KurirDashboardScreen';
// import KasirDashboardScreen from './screens/kasir/KasirDashboardScreen'; // Uncomment jika sudah ada

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
  userId?: string; // Backward compatibility
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [userData, setUserData] = useState<UserData | null>(null);

  // Navigation functions
  const navigateTo = (screen: Screen, data?: UserData) => {
    if (data) {
      setUserData(data);
      console.log('📱 Navigation - User Data:', JSON.stringify(data, null, 2));
      console.log('📱 Navigation - User Role:', data.user.role);
      console.log('📱 Navigation - Target Screen:', screen);
    }
    setCurrentScreen(screen);
  };

  // Handle Login Success - Route berdasarkan role
  const handleLoginSuccess = (user: UserData) => {
    console.log(
      '🔐 Login Success - Full User Data:',
      JSON.stringify(user, null, 2),
    );
    console.log('🔐 User Role:', user.user.role);

    const role = user.user.role.toLowerCase();

    // Route ke dashboard yang sesuai berdasarkan role
    if (role === 'kurir') {
      console.log('✅ Routing to Kurir Dashboard');
      navigateTo('kurir_dashboard', user);
    } else if (role === 'kasir') {
      console.log('✅ Routing to Kasir Dashboard');
      navigateTo('kasir_dashboard', user);
    } else {
      console.log('✅ Routing to Customer Dashboard (default)');
      navigateTo('customer_dashboard', user);
    }
  };

  // Handle Register Success - Default ke customer dashboard
  const handleRegisterSuccess = (user: UserData) => {
    console.log(
      '📝 Register Success - User Data:',
      JSON.stringify(user, null, 2),
    );
    navigateTo('customer_dashboard', user);
  };

  // Handle Logout
  const handleLogout = () => {
    console.log('🚪 User logged out');
    setUserData(null);
    navigateTo('welcome');
  };

  // Render screen berdasarkan state
  switch (currentScreen) {
    case 'welcome':
      return (
        <WelcomeScreen
          onGoToLogin={() => navigateTo('login')}
          onGoToRegister={() => navigateTo('register')}
        />
      );

    case 'login':
      return (
        <LoginScreen
          onGoToRegister={() => navigateTo('register')}
          onLoginSuccess={handleLoginSuccess}
        />
      );

    case 'register':
      return (
        <RegisterScreen
          onGoToLogin={() => navigateTo('login')}
          onRegisterSuccess={handleRegisterSuccess}
        />
      );

    case 'customer_dashboard':
      return <DashboardScreen userData={userData} onLogout={handleLogout} />;

    case 'kurir_dashboard':
      if (!userData) {
        // Fallback jika data hilang
        navigateTo('welcome');
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
        // Fallback jika data hilang
        navigateTo('welcome');
        return null;
      }
      // TODO: Ganti dengan KasirDashboardScreen yang sebenarnya
      return <DashboardScreen userData={userData} onLogout={handleLogout} />;
    /* 
      // Uncomment ini ketika KasirDashboardScreen sudah dibuat:
      return (
        <KasirDashboardScreen
          userId={userData.user.id_user}
          userName={userData.user.nama}
          onLogout={handleLogout}
        />
      );
      */

    default:
      console.warn('⚠️ Unknown screen:', currentScreen);
      return (
        <WelcomeScreen
          onGoToLogin={() => navigateTo('login')}
          onGoToRegister={() => navigateTo('register')}
        />
      );
  }
}
