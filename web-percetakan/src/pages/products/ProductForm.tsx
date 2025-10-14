import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './products.css';

const API_BASE_URL = 'http://localhost/api-percetakan/api';

interface Category {
  id_category: string;
  nama_category: string;
}

interface Product {
  id_product: string;
  id_category: string;
  nama_product: string;
  deskripsi: string;
  media_cetak: string;
  ukuran_standar: string;
  satuan: string;
  harga_dasar: number;
  gambar_preview: string;
}

interface ProductFormProps {
  product: Product | null;
  onClose: (success: boolean) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id_category: product?.id_category || '',
    nama_product: product?.nama_product || '',
    deskripsi: product?.deskripsi || '',
    media_cetak: product?.media_cetak || '',
    ukuran_standar: product?.ukuran_standar || '',
    satuan: product?.satuan || 'lembar',
    harga_dasar: product?.harga_dasar || 0,
    gambar_preview: product?.gambar_preview || '',
  });

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories.php`);

      console.log('Categories Response:', response.data);

      // Handle berbagai struktur response
      let categoriesData: Category[] = [];

      if (response.data.status === 'success') {
        // Cek apakah ada data.categories
        if (
          response.data.data &&
          Array.isArray(response.data.data.categories)
        ) {
          categoriesData = response.data.data.categories;
        }
        // Cek apakah data langsung array
        else if (Array.isArray(response.data.data)) {
          categoriesData = response.data.data;
        }
        // Cek apakah response.data.categories
        else if (Array.isArray(response.data.categories)) {
          categoriesData = response.data.categories;
        }
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      }

      console.log('Categories parsed:', categoriesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Gagal memuat kategori');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'harga_dasar' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi
    if (!formData.id_category || !formData.nama_product) {
      alert('Kategori dan Nama Produk wajib diisi!');
      return;
    }

    if (formData.harga_dasar <= 0) {
      alert('Harga Dasar harus lebih dari 0!');
      return;
    }

    setLoading(true);

    try {
      console.log('Sending data:', formData); // Debug

      // Gunakan URLSearchParams untuk FormData
      const params = new URLSearchParams();
      Object.entries(formData).forEach(([key, value]) => {
        params.append(key, String(value));
      });

      const url = product
        ? `${API_BASE_URL}/products.php?op=update&id=${product.id_product}`
        : `${API_BASE_URL}/products.php?op=create`;

      console.log('Request URL:', url); // Debug

      const response = await axios.post(url, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log('Full Response:', response); // Debug full response
      console.log('Save Response:', response.data); // Debug log

      if (
        response.data.status === 'success' ||
        response.data.status === 'created'
      ) {
        alert(
          product
            ? 'Produk berhasil diupdate!'
            : 'Produk berhasil ditambahkan!',
        );
        onClose(true);
      } else {
        alert(response.data.message || 'Terjadi kesalahan');
        console.error('Error response:', response.data);
      }
    } catch (error: any) {
      console.error('Full Error:', error); // Full error object
      console.error('Error saving product:', error.message);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);

      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        'Gagal menyimpan produk';
      alert('Error: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? '✏️ Edit Produk' : '➕ Tambah Produk'}</h2>
          <button className="btn-close" onClick={() => onClose(false)}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          {/* Kategori */}
          <div className="form-group">
            <label>
              Kategori <span className="required">*</span>
            </label>
            <select
              name="id_category"
              value={formData.id_category}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map(cat => (
                <option key={cat.id_category} value={cat.id_category}>
                  {cat.nama_category}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <small className="text-muted">Loading categories...</small>
            )}
          </div>

          {/* Nama Produk */}
          <div className="form-group">
            <label>
              Nama Produk <span className="required">*</span>
            </label>
            <input
              type="text"
              name="nama_product"
              value={formData.nama_product}
              onChange={handleChange}
              placeholder="Contoh: Banner 2x1 Meter"
              required
              className="form-control"
            />
          </div>

          {/* Deskripsi */}
          <div className="form-group">
            <label>Deskripsi</label>
            <textarea
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleChange}
              placeholder="Deskripsi produk (opsional)"
              rows={3}
              className="form-control"
            />
          </div>

          {/* Row: Media Cetak & Ukuran */}
          <div className="form-row">
            <div className="form-group">
              <label>Media Cetak</label>
              <input
                type="text"
                name="media_cetak"
                value={formData.media_cetak}
                onChange={handleChange}
                placeholder="Contoh: Flexi 340gsm"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Ukuran Standar</label>
              <input
                type="text"
                name="ukuran_standar"
                value={formData.ukuran_standar}
                onChange={handleChange}
                placeholder="Contoh: 2x1"
                className="form-control"
              />
            </div>
          </div>

          {/* Row: Satuan & Harga */}
          <div className="form-row">
            <div className="form-group">
              <label>Satuan</label>
              <select
                name="satuan"
                value={formData.satuan}
                onChange={handleChange}
                className="form-control"
              >
                <option value="lembar">lembar</option>
                <option value="meter">meter</option>
                <option value="pcs">pcs</option>
                <option value="rim">rim</option>
                <option value="box">box</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                Harga Dasar (Rp) <span className="required">*</span>
              </label>
              <input
                type="number"
                name="harga_dasar"
                value={formData.harga_dasar}
                onChange={handleChange}
                placeholder="0"
                required
                min="0"
                className="form-control"
              />
            </div>
          </div>

          {/* URL Gambar Preview */}
          <div className="form-group">
            <label>URL Gambar Preview</label>
            <input
              type="url"
              name="gambar_preview"
              value={formData.gambar_preview}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="form-control"
            />
            {formData.gambar_preview && (
              <div className="image-preview">
                <img src={formData.gambar_preview} alt="Preview" />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => onClose(false)}
              disabled={loading}
            >
              Batal
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading
                ? '⏳ Menyimpan...'
                : product
                ? '💾 Update'
                : '➕ Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
