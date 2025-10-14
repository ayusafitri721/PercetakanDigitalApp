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
      // Log semua info untuk debug
      const fullUrl = `${API_BASE_URL}${API_LOGIN}`;
      console.log('=== LOGIN DEBUG ===');
      console.log('1. Full URL:', fullUrl);
      console.log('2. Email:', email);
      console.log('3. Password:', password);

      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      console.log('4. Sending request...');

      const response = await axios.post<LoginResponse>(fullUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('5. Response Status:', response.status);
      console.log('6. Response Data:', response.data);
      console.log('7. Success?', response.data.success);
      console.log('8. Message:', response.data.message);

      if (response.data.success) {
        console.log('9. User Data:', response.data.data?.user);
        console.log('10. User Role:', response.data.data?.user.role);

        // Validasi role admin
        if (response.data.data?.user.role !== 'admin') {
          console.log('11. Role validation failed!');
          setError('Akses ditolak. Hanya admin yang bisa login.');
          return;
        }

        console.log('12. Saving to localStorage...');
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));

        console.log('13. Login success!');
        alert(`Login berhasil! Welcome ${response.data.data.user.nama}`);

        // Redirect ke dashboard
        window.location.href = '/dashboard';
      } else {
        console.log('14. Login failed - success is false');
        console.log('15. Error message:', response.data.message);
        setError(response.data.message || 'Login gagal');
      }
    } catch (err: any) {
      console.error('=== LOGIN ERROR ===');
      console.error('Error:', err);
      console.error('Error Message:', err.message);
      console.error('Error Response:', err.response);
      console.error('Error Response Data:', err.response?.data);
      console.error('Error Response Status:', err.response?.status);
      console.error('Error Request:', err.request);

      if (err.response) {
        // Server responded with error
        console.log('Server Error Response:', err.response.data);
        setError(err.response.data?.message || 'Email atau password salah');
      } else if (err.request) {
        // Request made but no response
        console.log('No response from server');
        setError('Tidak dapat terhubung ke server. Pastikan API berjalan.');
      } else {
        // Something else happened
        console.log('Unknown error:', err.message);
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
          <h1>Login Admin</h1>
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
              placeholder="admin@percetakan.com"
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
          <small>Email: admin@percetakan.com</small>
          <br />
          <small>Password: password</small>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
