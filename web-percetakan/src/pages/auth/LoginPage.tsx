import React, { useState } from 'react';
import axios from 'axios';
import './LoginPage.css';

// GANTI IP INI dengan IP komputer kamu!
import { API_BASE_URL } from '../../config';
const API_LOGIN = '/auth.php?op=login';

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: {
      id_user: string;
      nama: string;
      email: string;
      role: string;
    };
  };
}

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Email dan password wajib diisi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullUrl = `${API_BASE_URL}${API_LOGIN}`;
      console.log('=== LOGIN DEBUG ===');
      console.log('1. Full URL:', fullUrl);
      console.log('2. Email:', email);

      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const response = await axios.post<LoginResponse>(fullUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Response:', response.data);

      if (response.data.success) {
        const userData = response.data.data?.user;
        const userRole = userData?.role;

        console.log('User Role:', userRole);

        // ✅ VALIDASI ROLE: Admin, Kasir, dan Operator bisa login
        const allowedRoles = ['admin', 'kasir', 'operator'];
        if (!allowedRoles.includes(userRole || '')) {
          console.log('Role validation failed!');
          setError(
            'Akses ditolak. Hanya admin, kasir, dan operator yang bisa login.',
          );
          return;
        }

        // ✅ SIMPAN DATA KE LOCALSTORAGE
        localStorage.setItem('token', response.data.data!.token);
        localStorage.setItem('user', JSON.stringify(userData));

        console.log('Login success!');
        alert(`Login berhasil! Welcome ${userData?.nama}`);

        // ✅ REDIRECT BERDASARKAN ROLE
        if (userRole === 'kasir') {
          console.log('Redirecting to kasir dashboard...');
          window.location.href = '/dashboard/kasir';
        } else if (userRole === 'operator') {
          console.log('Redirecting to operator dashboard...');
          window.location.href = '/dashboard/operator';
        } else if (userRole === 'admin') {
          console.log('Redirecting to admin dashboard...');
          window.location.href = '/dashboard';
        }
      } else {
        console.log('Login failed - success is false');
        setError(response.data.message || 'Login gagal');
      }
    } catch (err: any) {
      console.error('=== LOGIN ERROR ===');
      console.error('Error:', err);

      if (err.response) {
        setError(err.response.data?.message || 'Email atau password salah');
      } else if (err.request) {
        setError('Tidak dapat terhubung ke server. Pastikan API berjalan.');
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* LEFT SIDE - Form */}
        <div className="login-left">
          <div className="login-form-wrapper">
            {/* Logo PrintyGo di atas title Login */}
            <div className="login-brand">
              <img
                src="/images/logoprin.png"
                alt="PrintyGo Logo"
                className="login-brand-icon"
              />
              <span className="login-brand-name">PrintyGo</span>
            </div>

            <h2 className="login-title">Login</h2>
            <p className="login-subtitle">
              Silakan masuk untuk melanjutkan ke dashboard Anda.
            </p>

            {error && (
              <div className="alert alert-error">
                <span>⚠️ {error}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <button type="submit" className="btn-signin" disabled={loading}>
                {loading ? 'Loading...' : 'Sign In'}
              </button>
            </form>

            {/* Demo Accounts (Hidden by default) */}
            <details className="demo-accounts">
              <summary>Demo Accounts</summary>
              <div className="demo-content">
                <p>
                  <strong>Admin:</strong> admin@percetakan.com / password
                </p>
                <p>
                  <strong>Kasir:</strong> kasir@percetakan.com / password
                </p>
                <p>
                  <strong>Operator:</strong> operator@percetakan.com / password
                </p>
              </div>
            </details>
          </div>
        </div>

        {/* RIGHT SIDE - Illustration */}
        <div className="login-right">
          <div className="illustration">
            <img src="/images/Login-Screen.png" alt="Login Illustration" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
