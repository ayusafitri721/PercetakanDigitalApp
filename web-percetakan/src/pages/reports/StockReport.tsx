import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost/api-percetakan/api';

interface Material {
  id_material: string;
  nama_bahan: string;
  jenis_bahan: string;
  stok_sisa: number;
  stok_minimum: number;
  satuan: string;
  status_stok: string;
}

const StockReport: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/materials.php`, {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
        params: {
          _t: new Date().getTime(), // Cache buster
        },
      });

      console.log('Stock Report - Materials Response:', response.data);

      let materialsData: Material[] = [];

      // Parse response
      if (response.data.status === 'success') {
        if (response.data.materials && Array.isArray(response.data.materials)) {
          materialsData = response.data.materials;
        } else if (
          response.data.data &&
          Array.isArray(response.data.data.materials)
        ) {
          materialsData = response.data.data.materials;
        } else if (Array.isArray(response.data.data)) {
          materialsData = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        materialsData = response.data;
      }

      console.log('Parsed materials:', materialsData);
      setMaterials(materialsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching materials for report:', error);
      setLoading(false);
    }
  };

  const lowStockCount = materials.filter(
    m => m.status_stok === 'rendah',
  ).length;

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Memuat laporan stok...</p>
      </div>
    );
  }

  return (
    <div className="stock-report">
      <div className="report-header-actions">
        <button className="btn-refresh-report" onClick={fetchMaterials}>
          🔄 Refresh Data
        </button>
      </div>

      <div className="report-summary">
        <h3>Total Bahan: {materials.length}</h3>
        <p className={lowStockCount > 0 ? 'text-danger' : ''}>
          Stok Rendah: <strong>{lowStockCount}</strong> bahan
        </p>
      </div>

      {materials.length === 0 ? (
        <div className="empty-state">
          <p>Tidak ada data bahan</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>Nama Bahan</th>
                <th>Jenis</th>
                <th>Stok Sisa</th>
                <th>Stok Min</th>
                <th>Satuan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {materials
                .sort((a, b) => {
                  // Sort: stok rendah dulu
                  if (a.status_stok === 'rendah' && b.status_stok !== 'rendah')
                    return -1;
                  if (a.status_stok !== 'rendah' && b.status_stok === 'rendah')
                    return 1;
                  return a.stok_sisa - b.stok_sisa;
                })
                .map(material => (
                  <tr
                    key={material.id_material}
                    className={
                      material.status_stok === 'rendah' ? 'row-warning' : ''
                    }
                  >
                    <td>{material.nama_bahan}</td>
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
                    <td>
                      {material.status_stok === 'rendah' ? (
                        <span className="badge badge-danger">Rendah</span>
                      ) : (
                        <span className="badge badge-success">Normal</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StockReport;
    