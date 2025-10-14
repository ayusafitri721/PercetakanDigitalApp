import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost/api-percetakan/api';

interface Material {
  id_material: string;
  nama_bahan: string;
  jenis_bahan: string;
  stok_awal: number;
  stok_sisa: number;
  stok_minimum: number;
  satuan: string;
  harga_per_unit: number;
  supplier: string;
}

interface MaterialFormProps {
  material: Material | null;
  onClose: (success: boolean) => void;
}

const MaterialForm: React.FC<MaterialFormProps> = ({ material, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_bahan: material?.nama_bahan || '',
    jenis_bahan: material?.jenis_bahan || 'kertas',
    stok_awal: material?.stok_awal || 0,
    stok_sisa: material?.stok_sisa || 0,
    stok_minimum: material?.stok_minimum || 10,
    satuan: material?.satuan || 'lembar',
    harga_per_unit: material?.harga_per_unit || 0,
    supplier: material?.supplier || '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: [
        'stok_awal',
        'stok_sisa',
        'stok_minimum',
        'harga_per_unit',
      ].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi
    if (!formData.nama_bahan.trim()) {
      alert('Nama bahan wajib diisi!');
      return;
    }

    if (formData.stok_minimum <= 0) {
      alert('Stok minimum harus lebih dari 0!');
      return;
    }

    setLoading(true);

    try {
      // Prepare form data
      const params = new URLSearchParams();
      Object.entries(formData).forEach(([key, value]) => {
        params.append(key, String(value));
      });

      // Build URL
      let url = `${API_BASE_URL}/materials.php`;
      if (material) {
        url += `?op=update&id=${material.id_material}`;
      } else {
        url += `?op=create`;
      }

      console.log('Submitting to:', url);
      console.log('Form data:', Object.fromEntries(params));

      const response = await axios.post(url, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        timeout: 10000,
      });

      console.log('Submit response:', response.data);

      if (
        response.data.status === 'success' ||
        response.data.status === 'created'
      ) {
        alert(
          material
            ? '✅ Bahan berhasil diupdate!'
            : '✅ Bahan berhasil ditambahkan!',
        );
        onClose(true);
      } else {
        throw new Error(response.data.message || 'Terjadi kesalahan');
      }
    } catch (error: any) {
      console.error('Submit error:', error);

      let errorMsg = 'Gagal menyimpan data';

      if (error.code === 'ERR_NETWORK') {
        errorMsg =
          '🔌 Tidak dapat terhubung ke server.\nPastikan XAMPP/Apache berjalan.';
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
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{material ? 'Edit Bahan' : 'Tambah Bahan'}</h2>
          <button
            className="btn-close"
            onClick={() => onClose(false)}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          {/* Nama Bahan */}
          <div className="form-group">
            <label>
              Nama Bahan <span className="required">*</span>
            </label>
            <input
              type="text"
              name="nama_bahan"
              value={formData.nama_bahan}
              onChange={handleChange}
              placeholder="Contoh: Kertas HVS 80gsm"
              required
              className="form-control"
              disabled={loading}
            />
          </div>

          {/* Row: Jenis & Supplier */}
          <div className="form-row">
            <div className="form-group">
              <label>Jenis Bahan</label>
              <select
                name="jenis_bahan"
                value={formData.jenis_bahan}
                onChange={handleChange}
                className="form-control"
                disabled={loading}
              >
                <option value="kertas">Kertas</option>
                <option value="vinyl">Vinyl</option>
                <option value="flexi">Flexi</option>
                <option value="tinta">Tinta</option>
                <option value="laminasi">Laminasi</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>

            <div className="form-group">
              <label>Supplier</label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                placeholder="Nama supplier"
                className="form-control"
                disabled={loading}
              />
            </div>
          </div>

          {/* Row: Stok Awal & Stok Sisa */}
          <div className="form-row">
            <div className="form-group">
              <label>Stok Awal</label>
              <input
                type="number"
                name="stok_awal"
                value={formData.stok_awal}
                onChange={handleChange}
                min="0"
                className="form-control"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Stok Sisa</label>
              <input
                type="number"
                name="stok_sisa"
                value={formData.stok_sisa}
                onChange={handleChange}
                min="0"
                className="form-control"
                disabled={loading}
              />
            </div>
          </div>

          {/* Row: Stok Minimum & Satuan */}
          <div className="form-row">
            <div className="form-group">
              <label>
                Stok Minimum <span className="required">*</span>
              </label>
              <input
                type="number"
                name="stok_minimum"
                value={formData.stok_minimum}
                onChange={handleChange}
                required
                min="1"
                className="form-control"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Satuan</label>
              <select
                name="satuan"
                value={formData.satuan}
                onChange={handleChange}
                className="form-control"
                disabled={loading}
              >
                <option value="lembar">lembar</option>
                <option value="meter">meter</option>
                <option value="roll">roll</option>
                <option value="rim">rim</option>
                <option value="liter">liter</option>
                <option value="kg">kg</option>
                <option value="pcs">pcs</option>
              </select>
            </div>
          </div>

          {/* Harga per Unit */}
          <div className="form-group">
            <label>Harga per Unit (Rp)</label>
            <input
              type="number"
              name="harga_per_unit"
              value={formData.harga_per_unit}
              onChange={handleChange}
              placeholder="0"
              min="0"
              className="form-control"
              disabled={loading}
            />
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
              {loading ? 'Menyimpan...' : material ? 'Update' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialForm;
