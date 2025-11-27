import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './SettingsProfile.css';
import type { User } from '../types/User';

interface SettingsProfileProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
}

const UserIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const PhoneIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MapPinIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const LockIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const SaveIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const SettingsProfile: React.FC<SettingsProfileProps> = ({
  user,
  onUpdateUser,
}) => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    no_telepon: '',
    alamat: '',
    kota: '',
    provinsi: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserDetail();
    }
  }, [user]);

 const fetchUserDetail = async () => {
   if (!user) return;

   try {
     setLoading(true);
     const response = await axios.get(`${API_BASE_URL}/users.php`, {
       params: { op: 'detail', id: user.id_user },
     });

     if (response.data.status === 'success') {
       // Gunakan data dari user yang login (dari localStorage/props)
       // bukan dari response API
       setUserData(user);
       setFormData({
         nama: user.nama || '',
         email: user.email || '',
         no_telepon: user.no_telepon || '',
         alamat: user.alamat || '',
         kota: user.kota || '',
         provinsi: user.provinsi || '',
         password: '',
         confirmPassword: '',
       });
     }
   } catch (error) {
     console.error('Error fetching user detail:', error);
   } finally {
     setLoading(false);
   }
 };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error saat user mulai mengetik
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama wajib diisi';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setSuccessMessage('');

      const formDataToSend = new FormData();
      formDataToSend.append('nama', formData.nama);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('no_telepon', formData.no_telepon);
      formDataToSend.append('alamat', formData.alamat);
      formDataToSend.append('kota', formData.kota);
      formDataToSend.append('provinsi', formData.provinsi);

      if (formData.password) {
        formDataToSend.append('password', formData.password);
      }

      const response = await axios.post(
        `${API_BASE_URL}/users.php?op=update&id=${user?.id_user}`,
        formDataToSend,
      );

      if (response.data.status === 'success') {
        setSuccessMessage('Profil berhasil diperbarui!');
        setIsEditing(false);

        // Update user data di localStorage
        const updatedUser = {
          ...user!,
          nama: formData.nama,
          email: formData.email,
          no_telepon: formData.no_telepon,
          alamat: formData.alamat,
          kota: formData.kota,
          provinsi: formData.provinsi,
        };

        localStorage.setItem('user', JSON.stringify(updatedUser));
        onUpdateUser(updatedUser);

        // Clear password fields
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));

        // Refresh data
        fetchUserDetail();

        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setErrors({
        submit: error.response?.data?.message || 'Gagal memperbarui profil',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userData) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Memuat data profil...</p>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Pengaturan Akun</h2>
        <p>Kelola informasi profil dan keamanan akun Anda</p>
      </div>

      {successMessage && (
        <div className="alert alert-success">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {errors.submit && (
        <div className="alert alert-error">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{errors.submit}</span>
        </div>
      )}

      <div className="settings-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar-large">
            {user?.nama?.charAt(0) || 'U'}
          </div>
          <h3>{user?.nama}</h3>
          <p className="profile-role">{user?.role}</p>
          <p className="profile-email">{user?.email}</p>
        </div>

        {/* Form Card */}
        <div className="settings-form-card">
          <div className="form-header">
            <h3>Informasi Profil</h3>
            {!isEditing && (
              <button className="btn-edit" onClick={() => setIsEditing(true)}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Profil
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Nama */}
            <div className="form-group">
              <label>
                <UserIcon />
                Nama Lengkap
              </label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                disabled={!isEditing}
                className={errors.nama ? 'error' : ''}
              />
              {errors.nama && <span className="error-text">{errors.nama}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label>
                <MailIcon />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            {/* No Telepon */}
            <div className="form-group">
              <label>
                <PhoneIcon />
                No. Telepon
              </label>
              <input
                type="text"
                name="no_telepon"
                value={formData.no_telepon}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="08xxxxxxxxxx"
              />
            </div>

            {/* Alamat */}
            <div className="form-group">
              <label>
                <MapPinIcon />
                Alamat
              </label>
              <textarea
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                disabled={!isEditing}
                rows={3}
                placeholder="Alamat lengkap"
              />
            </div>

            <div className="form-row">
              {/* Kota */}
              <div className="form-group">
                <label>Kota</label>
                <input
                  type="text"
                  name="kota"
                  value={formData.kota}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Nama kota"
                />
              </div>

              {/* Provinsi */}
              <div className="form-group">
                <label>Provinsi</label>
                <input
                  type="text"
                  name="provinsi"
                  value={formData.provinsi}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Nama provinsi"
                />
              </div>
            </div>

            {isEditing && (
              <>
                <div className="divider">
                  <span>Ubah Password (Opsional)</span>
                </div>

                {/* Password Baru */}
                <div className="form-group">
                  <label>
                    <LockIcon />
                    Password Baru
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Kosongkan jika tidak ingin mengubah"
                    className={errors.password ? 'error' : ''}
                  />
                  {errors.password && (
                    <span className="error-text">{errors.password}</span>
                  )}
                </div>

                {/* Konfirmasi Password */}
                <div className="form-group">
                  <label>
                    <LockIcon />
                    Konfirmasi Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Ulangi password baru"
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                  {errors.confirmPassword && (
                    <span className="error-text">{errors.confirmPassword}</span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => {
                      setIsEditing(false);
                      fetchUserDetail();
                      setErrors({});
                    }}
                    disabled={loading}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn-save" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="spinner-small"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <SaveIcon />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Info Card */}
        <div className="info-card">
          <h4>Informasi Akun</h4>
          <div className="info-item">
            <span className="info-label">Role:</span>
            <span className="info-value">{user?.role}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Status:</span>
            <span className="badge badge-active">Aktif</span>
          </div>
        </div>      
      </div>
    </div>
  );
};

export default SettingsProfile;
