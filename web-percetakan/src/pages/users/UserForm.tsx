import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost/api-percetakan/api';

interface User {
  id_user?: string;
  nama: string;
  email: string;
  role: string;
  no_telepon: string;
  alamat: string;
  status_aktif?: number;
}

interface UserFormProps {
  user: User | null;
  onClose: (success: boolean) => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose }) => {
  const [formData, setFormData] = useState<User>({
    nama: '',
    email: '',
    role: 'pelanggan',
    no_telepon: '',
    alamat: '',
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const isEdit = !!user;

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const validate = () => {
    const newErrors: any = {};

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama wajib diisi';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!isEdit) {
      if (!password) {
        newErrors.password = 'Password wajib diisi';
      } else if (password.length < 6) {
        newErrors.password = 'Password minimal 6 karakter';
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Password tidak cocok';
      }
    } else {
      // Jika edit dan password diisi
      if (password && password.length < 6) {
        newErrors.password = 'Password minimal 6 karakter';
      }
      if (password && password !== confirmPassword) {
        newErrors.confirmPassword = 'Password tidak cocok';
      }
    }

    if (!formData.role) {
      newErrors.role = 'Role wajib dipilih';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('nama', formData.nama);
      submitData.append('email', formData.email);
      submitData.append('role', formData.role);
      submitData.append('no_telepon', formData.no_telepon);
      submitData.append('alamat', formData.alamat);

      if (isEdit) {
        // Update user
        if (password) {
          submitData.append('password', password);
        }

        console.log(
          'UPDATE URL:',
          `${API_BASE_URL}/users.php?op=update&id=${user.id_user}`,
        );

        const response = await axios.post(
          `${API_BASE_URL}/users.php?op=update&id=${user.id_user}`,
          submitData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        console.log('Update Response:', response.data);

        if (response.data.status === 'success') {
          alert('User berhasil diupdate!');
          onClose(true);
        } else {
          alert(response.data.message || 'Gagal update user');
        }
      } else {
        // Create new user
        submitData.append('password', password);

        console.log('CREATE URL:', `${API_BASE_URL}/users.php?op=create`);
        console.log('Form Data:');
        submitData.forEach((value, key) => {
          console.log(`${key}: ${value}`);
        });

        const response = await axios.post(
          `${API_BASE_URL}/users.php?op=create`,
          submitData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        console.log('Create Response:', response.data);

        if (response.data.status === 'success') {
          alert('User berhasil ditambahkan!');
          onClose(true);
        } else {
          alert(response.data.message || 'Gagal menambahkan user');
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      console.error('Error Response:', error.response?.data);

      const errorMsg =
        error.response?.data?.message ||
        'Terjadi kesalahan saat menambahkan user';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit User' : 'Tambah User Baru'}</h2>
          <button className="btn-close" onClick={() => onClose(false)}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nama Lengkap *</label>
              <input
                type="text"
                value={formData.nama}
                onChange={e =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                placeholder="Masukkan nama lengkap"
                className={errors.nama ? 'error' : ''}
              />
              {errors.nama && <span className="error-text">{errors.nama}</span>}
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="user@example.com"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Role *</label>
              <select
                value={formData.role}
                onChange={e =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className={errors.role ? 'error' : ''}
              >
                <option value="pelanggan">Pelanggan</option>
                <option value="kasir">Kasir</option>
                <option value="operator">Operator</option>
                <option value="kurir">Kurir</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && <span className="error-text">{errors.role}</span>}
            </div>

            <div className="form-group">
              <label>No. Telepon</label>
              <input
                type="text"
                value={formData.no_telepon}
                onChange={e =>
                  setFormData({ ...formData, no_telepon: e.target.value })
                }
                placeholder="08123456789"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Alamat</label>
            <textarea
              value={formData.alamat}
              onChange={e =>
                setFormData({ ...formData, alamat: e.target.value })
              }
              placeholder="Masukkan alamat lengkap"
              rows={3}
            />
          </div>

          {!isEdit && (
            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && (
                  <span className="error-text">{errors.password}</span>
                )}
              </div>

              <div className="form-group">
                <label>Konfirmasi Password *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && (
                  <span className="error-text">{errors.confirmPassword}</span>
                )}
              </div>
            </div>
          )}

          {isEdit && (
            <div className="form-row">
              <div className="form-group">
                <label>Password Baru (kosongkan jika tidak diubah)</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && (
                  <span className="error-text">{errors.password}</span>
                )}
              </div>

              <div className="form-group">
                <label>Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && (
                  <span className="error-text">{errors.confirmPassword}</span>
                )}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => onClose(false)}
              disabled={loading}
            >
              Batal
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Menyimpan...' : isEdit ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
