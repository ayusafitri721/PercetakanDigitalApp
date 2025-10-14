import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost/api-percetakan/api';

interface Product {
  id_product: string;
  nama_product: string;
  nama_category: string;
  harga_dasar: number;
  ukuran_standar: string;
  satuan: string;
}

interface ProductDeleteProps {
  product: Product;
  onClose: (success: boolean) => void;
}

const ProductDelete: React.FC<ProductDeleteProps> = ({ product, onClose }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/products.php?op=delete&id=${
          product.id_product
        }&_t=${new Date().getTime()}`,
        {
          headers: {
            'Cache-Control': 'no-cache',
          },
        },
      );

      console.log('Delete Response:', response.data);

      if (response.data.status === 'success') {
        alert('Produk berhasil dihapus!');
        onClose(true);
      } else {
        alert(response.data.message || 'Gagal menghapus produk');
        onClose(false);
      }
    } catch (error: any) {
      console.error('Error:', error);
      const errorMsg =
        error.response?.data?.message ||
        'Terjadi kesalahan saat menghapus produk';
      alert(errorMsg);
      onClose(false);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div
        className="modal-content modal-delete"
        onClick={e => e.stopPropagation()}
      >
        <div className="delete-icon">⚠️</div>

        <h2>Hapus Produk?</h2>
        <p className="delete-message">
          Apakah Anda yakin ingin menghapus produk{' '}
          <strong>{product.nama_product}</strong>?
          <br />
          <span className="delete-warning">
            Aksi ini akan menonaktifkan produk dari sistem.
          </span>
        </p>

        <div className="product-info-delete">
          <div className="info-row">
            <span className="label">Kategori:</span>
            <span className="value">{product.nama_category}</span>
          </div>
          <div className="info-row">
            <span className="label">Harga Dasar:</span>
            <span className="value">{formatRupiah(product.harga_dasar)}</span>
          </div>
          <div className="info-row">
            <span className="label">Ukuran:</span>
            <span className="value">
              {product.ukuran_standar} {product.satuan}
            </span>
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

export default ProductDelete;
