import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost/api-percetakan/api';

interface User {
  id_user: string;
  nama: string;
  email: string;
  role: string;
}

interface UserDeleteProps {
  user: User;
  onClose: (success: boolean) => void;
}

const UserDelete: React.FC<UserDeleteProps> = ({ user, onClose }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      console.log('Deleting user:', user.id_user);
      console.log(
        'DELETE URL:',
        `${API_BASE_URL}/users.php?op=delete&id=${user.id_user}`,
      );

      // API delete pakai GET method
      const response = await axios.get(
        `${API_BASE_URL}/users.php?op=delete&id=${user.id_user}`,
        {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
          params: {
            _t: new Date().getTime(), // Anti-cache
          },
        },
      );

      console.log('Delete Response:', response.data);

      if (response.data.status === 'success') {
        alert('User berhasil dihapus!');

        // PENTING: Tutup modal dulu, baru reload
        onClose(true);

        // Tunggu sebentar agar modal tertutup, lalu reload halaman
        setTimeout(() => {
          window.location.reload();
        }, 300);
      } else {
        alert(response.data.message || 'Gagal menghapus user');
        onClose(false);
      }
    } catch (error: any) {
      console.error('Error:', error);
      console.error('Error Response:', error.response?.data);

      const errorMsg =
        error.response?.data?.message ||
        'Terjadi kesalahan saat menghapus user';
      alert(errorMsg);
      onClose(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div
        className="modal-content modal-delete"
        onClick={e => e.stopPropagation()}
      >
        <div className="delete-icon">⚠️</div>

        <h2>Hapus User?</h2>
        <p className="delete-message">
          Apakah Anda yakin ingin menghapus user <strong>{user.nama}</strong>?
          <br />
          <span className="delete-warning">
            Aksi ini akan menonaktifkan user dari sistem.
          </span>
        </p>

        <div className="user-info-delete">
          <div className="info-row">
            <span className="label">Email:</span>
            <span className="value">{user.email}</span>
          </div>
          <div className="info-row">
            <span className="label">Role:</span>
            <span className={`badge badge-${user.role}`}>{user.role}</span>
          </div>
        </div>

        <div className="form-actions">
          <button
            className="btn-cancel"
            onClick={() => onClose(false)}
            disabled={loading}
          >
            Batal
          </button>
          <button
            className="btn-delete-confirm"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDelete;
