import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MaterialForm from './MaterialForm';
import MaterialDelete from './MaterialDelete';
import './materials.css';

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
  status_stok: string;
  tanggal_update: string;
}

const MaterialList: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'rendah' | 'normal'>(
    'all',
  );

  // Fetch materials dengan error handling yang lebih baik
  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching from:', `${API_BASE_URL}/materials.php`);

      const response = await axios.get(`${API_BASE_URL}/materials.php`, {
        params: {
          _t: new Date().getTime(), // Cache buster
        },
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
        timeout: 10000, // 10 detik timeout
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Accept status code yang lebih luas untuk debugging
        },
      });

      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      });

      // Validasi response
      if (response.status !== 200) {
        throw new Error(
          `Server returned status ${response.status}: ${response.statusText}`,
        );
      }

      let materialsData: Material[] = [];

      // Parse data sesuai struktur API
      if (response.data.status === 'success') {
        if (response.data.data && Array.isArray(response.data.data.materials)) {
          materialsData = response.data.data.materials;
        } else if (Array.isArray(response.data.data)) {
          materialsData = response.data.data;
        } else {
          console.warn('Unexpected data structure:', response.data);
        }
      } else {
        throw new Error(response.data.message || 'Format response tidak valid');
      }

      console.log(`Successfully loaded ${materialsData.length} materials`);
      setMaterials(materialsData);
    } catch (error: any) {
      console.error('Fetch error:', {
        message: error.message,
        code: error.code,
        response: error.response,
        request: error.request,
      });

      let errorMsg = 'Gagal memuat data bahan';

      if (error.code === 'ECONNABORTED') {
        errorMsg = '⏱️ Koneksi timeout. Server tidak merespons dalam 10 detik.';
      } else if (error.code === 'ERR_NETWORK' || !error.response) {
        errorMsg =
          `🔌 Tidak dapat terhubung ke server!\n\n` +
          `Pastikan:\n` +
          `✓ XAMPP/Apache sedang berjalan\n` +
          `✓ File ada di: htdocs/api-percetakan/api/materials.php\n` +
          `✓ Akses ${API_BASE_URL}/materials.php di browser untuk test\n\n` +
          `Error: ${error.message}`;
      } else if (error.response) {
        errorMsg = `⚠️ Server Error ${error.response.status}:\n${
          error.response.data?.message || error.response.statusText
        }`;
      } else {
        errorMsg = `❌ Error: ${error.message}`;
      }

      setError(errorMsg);

      // Hanya alert untuk network error
      if (error.code === 'ERR_NETWORK' || !error.response) {
        alert(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Format Rupiah
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Handle Add
  const handleAdd = () => {
    setSelectedMaterial(null);
    setShowForm(true);
  };

  // Handle Edit
  const handleEdit = (material: Material) => {
    setSelectedMaterial(material);
    setShowForm(true);
  };

  // Handle Delete
  const handleDelete = (material: Material) => {
    setSelectedMaterial(material);
    setShowDeleteModal(true);
  };

  // Filter materials
  const filteredMaterials = materials.filter(material => {
    const matchSearch =
      material.nama_bahan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.jenis_bahan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.supplier?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      filterStatus === 'all' || material.status_stok === filterStatus;

    return matchSearch && matchStatus;
  });

  // Count low stock
  const lowStockCount = materials.filter(
    m => m.status_stok === 'rendah',
  ).length;

  return (
    <div className="materials-container">
      <div className="materials-header">
        <div>
          <h1>Manajemen Stok Bahan</h1>
          <p className="subtitle">Kelola stok bahan cetak</p>
        </div>
        <button className="btn-add" onClick={handleAdd}>
          + Tambah Bahan
        </button>
      </div>

      {/* Error Alert dengan tombol retry */}
      {error && (
        <div className="alert alert-danger">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              fill="#E53E3E"
            />
          </svg>
          <div style={{ flex: 1, whiteSpace: 'pre-line' }}>{error}</div>
          <button
            onClick={fetchMaterials}
            style={{
              padding: '8px 16px',
              background: '#fff',
              border: '1px solid #E53E3E',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#E53E3E',
              fontWeight: 'bold',
            }}
          >
            🔄 Coba Lagi
          </button>
        </div>
      )}

      {/* Alert Low Stock */}
      {!error && lowStockCount > 0 && (
        <div className="alert alert-warning">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              fill="#ED8936"
            />
          </svg>
          <span>
            <strong>Peringatan!</strong> Ada {lowStockCount} bahan dengan stok
            rendah
          </span>
        </div>
      )}

      {/* Search & Filter */}
      <div className="filter-section">
        <input
          type="text"
          className="search-input"
          placeholder="Cari bahan, jenis, atau supplier..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            Semua ({materials.length})
          </button>
          <button
            className={`filter-btn ${
              filterStatus === 'normal' ? 'active' : ''
            }`}
            onClick={() => setFilterStatus('normal')}
          >
            Normal ({materials.filter(m => m.status_stok === 'normal').length})
          </button>
          <button
            className={`filter-btn filter-btn-warning ${
              filterStatus === 'rendah' ? 'active' : ''
            }`}
            onClick={() => setFilterStatus('rendah')}
          >
            Stok Rendah ({lowStockCount})
          </button>
        </div>
      </div>

      {/* Material Table */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Memuat data...</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="materials-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Bahan</th>
                <th>Jenis</th>
                <th>Stok Sisa</th>
                <th>Stok Min</th>
                <th>Satuan</th>
                <th>Harga/Unit</th>
                <th>Supplier</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center">
                    {error ? (
                      <div style={{ padding: '20px' }}>
                        <p>Tidak dapat memuat data. Silakan coba lagi.</p>
                      </div>
                    ) : searchTerm || filterStatus !== 'all' ? (
                      'Tidak ada bahan yang sesuai filter'
                    ) : materials.length === 0 ? (
                      'Belum ada data bahan. Klik "Tambah Bahan" untuk menambahkan.'
                    ) : (
                      'Tidak ada data'
                    )}
                  </td>
                </tr>
              ) : (
                filteredMaterials.map(material => (
                  <tr key={material.id_material}>
                    <td>{material.id_material}</td>
                    <td>
                      <div className="material-name">{material.nama_bahan}</div>
                    </td>
                    <td>
                      <span className="badge badge-category">
                        {material.jenis_bahan}
                      </span>
                    </td>
                    <td
                      className={
                        material.status_stok === 'rendah' ? 'text-danger' : ''
                      }
                    >
                      <strong>{material.stok_sisa}</strong>
                    </td>
                    <td>{material.stok_minimum}</td>
                    <td>{material.satuan}</td>
                    <td className="text-right">
                      {formatRupiah(material.harga_per_unit)}
                    </td>
                    <td>{material.supplier || '-'}</td>
                    <td>
                      {material.status_stok === 'rendah' ? (
                        <span className="badge badge-danger">Stok Rendah</span>
                      ) : (
                        <span className="badge badge-success">Normal</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(material)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(material)}
                          title="Hapus"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {!error && (
        <div className="summary">
          Total: <strong>{filteredMaterials.length}</strong> bahan
          {(searchTerm || filterStatus !== 'all') &&
            ` (dari ${materials.length} total)`}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <MaterialForm
          material={selectedMaterial}
          onClose={success => {
            setShowForm(false);
            setSelectedMaterial(null);
            if (success) fetchMaterials();
          }}
        />
      )}

      {showDeleteModal && selectedMaterial && (
        <MaterialDelete
          material={selectedMaterial}
          onClose={success => {
            setShowDeleteModal(false);
            setSelectedMaterial(null);
            if (success) fetchMaterials();
          }}
        />
      )}
    </div>
  );
};

export default MaterialList;