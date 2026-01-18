import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './products.css';

import { API_BASE_URL } from '../../config';
const BASE_URL = 'http://localhost/api-percetakan';

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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    id_category: product?.id_category || '',
    nama_product: product?.nama_product || '',
    deskripsi: product?.deskripsi || '',
    media_cetak: product?.media_cetak || '',
    ukuran_standar: product?.ukuran_standar || '',
    satuan: product?.satuan || 'lembar',
    harga_dasar: product?.harga_dasar || 0,
  });

  // Set preview dari produk yang ada
  useEffect(() => {
    if (product?.gambar_preview) {
      // Jika ada gambar dari database, tampilkan dengan full URL
      const fullImageUrl = product.gambar_preview.startsWith('http')
        ? product.gambar_preview
        : `${BASE_URL}/${product.gambar_preview}`;

      setPreviewUrl(fullImageUrl);
      console.log('Loading existing image:', fullImageUrl);
    }
  }, [product]);

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories.php`);
      let categoriesData: Category[] = [];

      if (response.data.status === 'success') {
        if (
          response.data.data &&
          Array.isArray(response.data.data.categories)
        ) {
          categoriesData = response.data.data.categories;
        } else if (Array.isArray(response.data.data)) {
          categoriesData = response.data.data;
        } else if (Array.isArray(response.data.categories)) {
          categoriesData = response.data.categories;
        }
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      }

      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Kategori',
        text: 'Tidak dapat memuat daftar kategori',
        confirmButtonColor: '#3085d6',
      });
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeInMB: (file.size / 1024 / 1024).toFixed(2) + 'MB',
    });

    // Validasi tipe file
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!validTypes.includes(file.type)) {
      await Swal.fire({
        icon: 'error',
        title: 'Format Tidak Valid',
        text: 'Format gambar tidak valid! Gunakan JPG, PNG, GIF, atau WebP',
        confirmButtonColor: '#3085d6',
      });
      e.target.value = '';
      return;
    }

    // Validasi ukuran (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      await Swal.fire({
        icon: 'error',
        title: 'File Terlalu Besar',
        text: 'Ukuran file terlalu besar! Maksimal 5MB',
        confirmButtonColor: '#3085d6',
      });
      e.target.value = '';
      return;
    }

    // Set file
    setSelectedImage(file);
    console.log('File set to state:', file.name);

    // Buat preview URL
    const reader = new FileReader();
    reader.onload = event => {
      if (event.target?.result) {
        const preview = event.target.result as string;
        setPreviewUrl(preview);
        console.log('Preview created, length:', preview.length);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.id_category || !formData.nama_product) {
      await Swal.fire({
        icon: 'warning',
        title: 'Data Tidak Lengkap',
        text: 'Kategori dan Nama Produk wajib diisi!',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    if (formData.harga_dasar <= 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Harga Tidak Valid',
        text: 'Harga Dasar harus lebih dari 0!',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    // Konfirmasi hanya untuk edit/update
    if (product) {
      const result = await Swal.fire({
        title: 'Update Produk?',
        text: `Apakah Anda yakin ingin mengupdate produk ${formData.nama_product}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Update',
        cancelButtonText: 'Batal',
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Tambahkan semua field
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, String(value));
      });

      // Tambahkan file jika ada
      if (selectedImage) {
        formDataToSend.append('gambar_preview', selectedImage);
        console.log('Adding image to FormData:', {
          name: selectedImage.name,
          type: selectedImage.type,
          size: selectedImage.size,
        });
      } else {
        console.log('No image selected');
      }

      const url = product
        ? `${API_BASE_URL}/products.php?op=update&id=${product.id_product}`
        : `${API_BASE_URL}/products.php?op=create`;

      console.log('Sending request to:', url);

      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (let pair of formDataToSend.entries()) {
        if (pair[1] instanceof File) {
          console.log(pair[0] + ':', '(File)', pair[1].name);
        } else {
          console.log(pair[0] + ':', pair[1]);
        }
      }

      const response = await axios.post(url, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Response received:', response.data);

      if (
        response.data.status === 'success' ||
        response.data.status === 'created'
      ) {
        // Log path gambar yang dikembalikan dari server
        if (response.data.data?.gambar_preview) {
          console.log(
            'Uploaded image path:',
            response.data.data.gambar_preview,
          );
          console.log(
            'Full URL:',
            `${BASE_URL}/${response.data.data.gambar_preview}`,
          );
        }

        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: product
            ? 'Produk berhasil diupdate!'
            : 'Produk berhasil ditambahkan!',
          timer: 1500,
          showConfirmButton: false,
        });
        onClose(true); // Refresh parent component
      } else {
        console.error('Error response:', response.data);
        await Swal.fire({
          icon: 'error',
          title: 'Gagal Menyimpan',
          text: response.data.message || 'Terjadi kesalahan',
          confirmButtonColor: '#3085d6',
        });
      }
    } catch (error: any) {
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        'Gagal menyimpan produk';
      await Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: errorMsg,
        confirmButtonColor: '#3085d6',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? 'Edit Produk' : 'Tambah Produk'}</h2>
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

          {/* Upload Gambar */}
          <div className="form-group">
            <label>Gambar Produk</label>
            <div
              style={{
                border: '2px dashed #ddd',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#f9f9f9',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="file-upload"
              />

              {!previewUrl ? (
                <div>
                  <label
                    htmlFor="file-upload"
                    style={{
                      cursor: 'pointer',
                      padding: '10px 20px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      borderRadius: '5px',
                      display: 'inline-block',
                    }}
                  >
                    Pilih Gambar
                  </label>
                  <p
                    style={{
                      marginTop: '10px',
                      fontSize: '12px',
                      color: '#666',
                    }}
                  >
                    JPG, PNG, GIF, WebP (Max 5MB)
                  </p>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      borderRadius: '5px',
                      objectFit: 'contain',
                      border: '1px solid #ddd',
                    }}
                    onError={e => {
                      console.error('Failed to load image:', previewUrl);
                      e.currentTarget.src =
                        'https://via.placeholder.com/300x200?text=Error+Loading+Image';
                    }}
                  />
                  <div style={{ marginTop: '10px' }}>
                    <label
                      htmlFor="file-upload"
                      style={{
                        cursor: 'pointer',
                        padding: '8px 15px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        borderRadius: '5px',
                        marginRight: '10px',
                        display: 'inline-block',
                      }}
                    >
                      Ganti Gambar
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      style={{
                        cursor: 'pointer',
                        padding: '8px 15px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                  {selectedImage && (
                    <p
                      style={{
                        marginTop: '10px',
                        fontSize: '12px',
                        color: '#666',
                      }}
                    >
                      File baru: {selectedImage.name} (
                      {(selectedImage.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                  {!selectedImage && product?.gambar_preview && (
                    <p
                      style={{
                        marginTop: '10px',
                        fontSize: '12px',
                        color: '#666',
                      }}
                    >
                      Gambar saat ini dari database
                    </p>
                  )}
                </div>
              )}
            </div>
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
              {loading ? 'Menyimpan...' : product ? 'Update' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
