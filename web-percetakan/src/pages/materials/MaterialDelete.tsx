import React, { useState } from 'react';
import axios from 'axios';

import { API_BASE_URL } from '../../config';

interface Material {
  id_material: string;
  nama_bahan: string;
  jenis_bahan: string;
  stok_sisa: number;
}

interface MaterialDeleteProps {
  material: Material;
  onClose: (success: boolean) => void;
}

const MaterialDelete: React.FC<MaterialDeleteProps> = ({
  material,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus bahan "${material.nama_bahan}"?`,
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const url = `${API_BASE_URL}/materials.php?op=delete&id=${material.id_material}`;

      console.log('Deleting:', url);

      const response = await axios.delete(url, {
        headers: {
          Accept: 'application/json',
        },
        timeout: 10000,
      });

      console.log('Delete response:', response.data);

      if (response.data.status === 'success') {
        alert('✅ Bahan berhasil dihapus!');
        onClose(true);
      } else {
        throw new Error(response.data.message || 'Gagal menghapus bahan');
      }
    } catch (error: any) {
      console.error('Delete error:', error);

      let errorMsg = 'Gagal menghapus bahan';

      if (error.code === 'ERR_NETWORK') {
        errorMsg = '🔌 Tidak dapat terhubung ke server';
      } else if (error.response) {
        errorMsg =
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
      } else {
        errorMsg = error.message;
      }

      alert('❌ Error: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => !loading && onClose(false)}>
      <div
        className="modal-content modal-delete"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>⚠️ Hapus Bahan</h2>
          <button
            className="btn-close"
            onClick={() => onClose(false)}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p>Apakah Anda yakin ingin menghapus bahan berikut?</p>

          <div className="delete-info">
            <div className="info-row">
              <strong>Nama Bahan:</strong>
              <span>{material.nama_bahan}</span>
            </div>
            <div className="info-row">
              <strong>Jenis:</strong>
              <span>{material.jenis_bahan}</span>
            </div>
            <div className="info-row">
              <strong>Stok Sisa:</strong>
              <span>{material.stok_sisa}</span>
            </div>
          </div>

          <div className="warning-message">
            ⚠️ <strong>Perhatian:</strong> Data yang dihapus tidak dapat
            dikembalikan!
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onClose(false)}
            disabled={loading}
          >
            Batal
          </button>
          <button
            className="btn-danger"
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

export default MaterialDelete;
