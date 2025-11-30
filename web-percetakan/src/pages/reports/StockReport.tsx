import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  RefreshCw,
  Package,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
} from 'lucide-react';

import { API_BASE_URL } from '../../config';

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

  const normalStockCount = materials.length - lowStockCount;

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Memuat laporan stok...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerActions}>
        <button style={styles.refreshBtn} onClick={fetchMaterials}>
          <RefreshCw size={16} />
          <span>Refresh Data</span>
        </button>
      </div>

      <div style={styles.summaryCards}>
        <div style={styles.summaryCard}>
          <div style={{ ...styles.summaryIcon, backgroundColor: '#eff6ff' }}>
            <Package size={24} color="#3b82f6" />
          </div>
          <div style={styles.summaryInfo}>
            <p style={styles.summaryLabel}>Total Bahan</p>
            <h2 style={styles.summaryNumber}>{materials.length}</h2>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={{ ...styles.summaryIcon, backgroundColor: '#fef2f2' }}>
            <TrendingDown size={24} color="#ef4444" />
          </div>
          <div style={styles.summaryInfo}>
            <p style={styles.summaryLabel}>Stok Rendah</p>
            <h2
              style={{
                ...styles.summaryNumber,
                color: lowStockCount > 0 ? '#ef4444' : '#1e293b',
              }}
            >
              {lowStockCount}
            </h2>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={{ ...styles.summaryIcon, backgroundColor: '#f0fdf4' }}>
            <CheckCircle size={24} color="#22c55e" />
          </div>
          <div style={styles.summaryInfo}>
            <p style={styles.summaryLabel}>Stok Normal</p>
            <h2 style={styles.summaryNumber}>{normalStockCount}</h2>
          </div>
        </div>
      </div>

      {materials.length === 0 ? (
        <div style={styles.emptyState}>
          <Package size={64} color="#cbd5e1" />
          <p style={styles.emptyText}>Tidak ada data bahan</p>
          <small style={styles.emptySubtext}>
            Data akan muncul setelah menambahkan bahan
          </small>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.tableHeader}>Nama Bahan</th>
                  <th style={styles.tableHeader}>Jenis</th>
                  <th style={{ ...styles.tableHeader, textAlign: 'center' }}>
                    Stok Sisa
                  </th>
                  <th style={{ ...styles.tableHeader, textAlign: 'center' }}>
                    Stok Min
                  </th>
                  <th style={{ ...styles.tableHeader, textAlign: 'center' }}>
                    Satuan
                  </th>
                  <th style={{ ...styles.tableHeader, textAlign: 'center' }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {materials
                  .sort((a, b) => {
                    // Sort: stok rendah dulu
                    if (
                      a.status_stok === 'rendah' &&
                      b.status_stok !== 'rendah'
                    )
                      return -1;
                    if (
                      a.status_stok !== 'rendah' &&
                      b.status_stok === 'rendah'
                    )
                      return 1;
                    return a.stok_sisa - b.stok_sisa;
                  })
                  .map(material => (
                    <tr
                      key={material.id_material}
                      style={{
                        ...styles.tableRow,
                        ...(material.status_stok === 'rendah'
                          ? styles.tableRowWarning
                          : {}),
                      }}
                    >
                      <td style={styles.tableCell}>
                        <div style={styles.materialName}>
                          {material.status_stok === 'rendah' && (
                            <AlertTriangle
                              size={16}
                              color="#ef4444"
                              style={{ marginRight: '8px' }}
                            />
                          )}
                          {material.nama_bahan}
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={styles.badgeBlue}>
                          {material.jenis_bahan}
                        </span>
                      </td>
                      <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                        <strong
                          style={{
                            color:
                              material.status_stok === 'rendah'
                                ? '#ef4444'
                                : '#1e293b',
                            fontSize: '15px',
                          }}
                        >
                          {material.stok_sisa}
                        </strong>
                      </td>
                      <td
                        style={{
                          ...styles.tableCell,
                          textAlign: 'center',
                          color: '#64748b',
                        }}
                      >
                        {material.stok_minimum}
                      </td>
                      <td
                        style={{
                          ...styles.tableCell,
                          textAlign: 'center',
                          color: '#64748b',
                        }}
                      >
                        {material.satuan}
                      </td>
                      <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                        {material.status_stok === 'rendah' ? (
                          <span style={styles.badgeDanger}>
                            <AlertTriangle size={14} />
                            Rendah
                          </span>
                        ) : (
                          <span style={styles.badgeSuccess}>
                            <CheckCircle size={14} />
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '0',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px',
    backgroundColor: 'white',
    borderRadius: '12px',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    color: '#64748b',
    fontSize: '14px',
  },
  headerActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '24px',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  summaryCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  summaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  summaryIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '56px',
    height: '56px',
    borderRadius: '12px',
  },
  summaryInfo: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: '13px',
    color: '#64748b',
    margin: '0 0 4px 0',
    fontWeight: '500',
  },
  summaryNumber: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  emptyText: {
    marginTop: '16px',
    fontSize: '16px',
    color: '#64748b',
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: '13px',
    color: '#94a3b8',
    marginTop: '4px',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  tableWrapper: {
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  tableHeaderRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
  },
  tableHeader: {
    padding: '16px',
    textAlign: 'left' as const,
    fontSize: '13px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  tableRow: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s',
  },
  tableRowWarning: {
    backgroundColor: '#fef2f2',
  },
  tableCell: {
    padding: '16px',
    fontSize: '14px',
    color: '#1e293b',
  },
  materialName: {
    display: 'flex',
    alignItems: 'center',
    fontWeight: '500',
  },
  badgeBlue: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
  },
  badgeDanger: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
  },
  badgeSuccess: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: '#dcfce7',
    color: '#16a34a',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
  },
};

// Add keyframe animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
  
  button:active {
    transform: translateY(0);
  }
  
  table tbody tr:hover {
    background-color: #f8fafc;
  }
  
  table tbody tr[style*="background-color: rgb(254, 242, 242)"]:hover {
    background-color: #fee2e2 !important;
  }
`;
document.head.appendChild(styleSheet);

export default StockReport;
