import React, { useState } from 'react';
import axios from 'axios';
import './LoginPage.css';

// GANTI IP INI dengan IP komputer kamu!
const API_BASE_URL = 'http://localhost/api-percetakan/api';
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

        // ✅ VALIDASI ROLE: Hanya admin dan kasir yang bisa login
        if (userRole !== 'admin' && userRole !== 'kasir') {
          console.log('Role validation failed!');
          setError('Akses ditolak. Hanya admin dan kasir yang bisa login.');
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
      <div className="login-card">
        <div className="login-header">
          <h1>Login</h1>
          <p>Sistem Percetakan Digital</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="email@percetakan.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Loading...</span>
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Demo Account:</p>
          <small>
            <strong>Admin:</strong> admin@percetakan.com / password
          </small>
          <br />
          <small>
            <strong>Kasir:</strong> kasir@percetakan.com / password
          </small>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
