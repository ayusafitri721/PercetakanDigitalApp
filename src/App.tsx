// App.tsx - Simple Router (No Library)
import React, { useState } from 'react';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import DashboardScreen from './screens/customer/DashboardScreen';

type Screen = 'login' | 'register' | 'dashboard';

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
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [userData, setUserData] = useState<UserData | null>(null);

  // Navigation functions
  const navigateTo = (screen: Screen, data?: UserData) => {
    if (data) setUserData(data);
    setCurrentScreen(screen);
  };

  // Render screen berdasarkan state
  switch (currentScreen) {
    case 'login':
      return (
        <LoginScreen
          onGoToRegister={() => navigateTo('register')}
          onLoginSuccess={user => navigateTo('dashboard', user)}
        />
      );

    case 'register':
      return (
        <RegisterScreen
          onGoToLogin={() => navigateTo('login')}
          onRegisterSuccess={user => navigateTo('dashboard', user)}
        />
      );

    case 'dashboard':
      return (
        <DashboardScreen
          userData={userData}
          onLogout={() => {
            setUserData(null);
            navigateTo('login');
          }}
        />
      );

    default:
      return (
        <LoginScreen
          onGoToRegister={() => navigateTo('register')}
          onLoginSuccess={user => navigateTo('dashboard', user)}
        />
      );
  }
}
