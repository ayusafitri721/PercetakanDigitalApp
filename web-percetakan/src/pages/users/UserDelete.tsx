import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

import { API_BASE_URL } from '../../config';

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
    // Konfirmasi dengan SweetAlert2
    const result = await Swal.fire({
      title: 'Hapus User?',
      html: `
        Apakah Anda yakin ingin menghapus user <strong>${user.nama}</strong>?<br>
        <span style="color: #d33; font-size: 14px;">Aksi ini akan menonaktifkan user dari sistem.</span>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

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
        // SweetAlert2 untuk delete berhasil
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil Dihapus!',
          text: 'User berhasil dihapus dari sistem.',
          timer: 1500,
          showConfirmButton: false,
        });

        // PENTING: Tutup modal dulu, baru reload
        onClose(true);

        // Tunggu sebentar agar modal tertutup, lalu reload halaman
        setTimeout(() => {
          window.location.reload();
        }, 300);
      } else {
        // SweetAlert2 untuk delete gagal
        await Swal.fire({
          icon: 'error',
          title: 'Gagal Menghapus',
          text: response.data.message || 'Gagal menghapus user',
          confirmButtonColor: '#3085d6',
        });
        onClose(false);
      }
    } catch (error: any) {
      console.error('Error:', error);
      console.error('Error Response:', error.response?.data);

      const errorMsg =
        error.response?.data?.message ||
        'Terjadi kesalahan saat menghapus user';

      // SweetAlert2 untuk error
      await Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: errorMsg,
        confirmButtonColor: '#3085d6',
      });
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
