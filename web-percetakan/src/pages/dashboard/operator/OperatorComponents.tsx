// OperatorComponents.tsx - All Small Components
import React from 'react';
import type { Order, Stats, DesignFile, OrderItem } from './operatorTypes';
import {
  formatRupiah,
  formatDate,
  formatFileSize,
  getStatusBadge,
} from './operatorUtils';

// ============ STATS CARDS ============
interface StatsCardsProps {
  stats: Stats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="stats-grid">
      <div className="stat-card stat-blue">
        <div className="stat-icon">📋</div>
        <div className="stat-info">
          <div className="stat-label">Queue Hari Ini</div>
          <div className="stat-value">{stats.todayQueue}</div>
        </div>
      </div>

      <div className="stat-card stat-pink">
        <div className="stat-icon">⚡</div>
        <div className="stat-info">
          <div className="stat-label">Express Priority</div>
          <div className="stat-value">{stats.expressQueue}</div>
        </div>
      </div>

      <div className="stat-card stat-cyan">
        <div className="stat-icon">🖨️</div>
        <div className="stat-info">
          <div className="stat-label">Dalam Proses</div>
          <div className="stat-value">{stats.inProgress}</div>
        </div>
      </div>

      <div className="stat-card stat-green">
        <div className="stat-icon">✅</div>
        <div className="stat-info">
          <div className="stat-label">Selesai Hari Ini</div>
          <div className="stat-value">{stats.todayCompleted}</div>
        </div>
      </div>
    </div>
  );
};

// ============ QUEUE TABLE ============
interface QueueTableProps {
  orders: Order[];
  loading: boolean;
  updating: boolean;
  onViewDetail: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: string) => void;
  onStartComplete: (orderId: string) => void;
}

export const QueueTable: React.FC<QueueTableProps> = ({
  orders,
  loading,
  updating,
  onViewDetail,
  onUpdateStatus,
  onStartComplete,
}) => {
  if (loading && orders.length === 0) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Memuat queue...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon" style={{ fontSize: '4rem' }}>
          ✅
        </div>
        <h3 style={{ color: '#28a745' }}>Tidak Ada Pesanan di Queue</h3>
        <p>Semua pesanan sudah selesai dicetak!</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="queue-table">
        <thead>
          <tr>
            <th>Priority</th>
            <th>Kode Order</th>
            <th>Customer</th>
            <th>Jenis</th>
            <th>Status</th>
            <th>Waktu</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => {
            const statusInfo = getStatusBadge(order.status_order);
            return (
              <tr
                key={order.id_order}
                className={
                  order.kecepatan_pengerjaan === 'express' ? 'express-row' : ''
                }
                style={{
                  background:
                    order.status_order === 'selesai'
                      ? 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)'
                      : 'transparent',
                  borderLeft:
                    order.status_order === 'selesai'
                      ? '4px solid #28a745'
                      : order.kecepatan_pengerjaan === 'express'
                      ? '4px solid #dc2626'
                      : 'none',
                }}
              >
                <td>
                  <div
                    className={`priority-badge ${
                      order.kecepatan_pengerjaan === 'express'
                        ? 'express'
                        : 'normal'
                    }`}
                  >
                    {index + 1}
                  </div>
                </td>
                <td>
                  <div className="order-code">
                    <strong>{order.kode_order}</strong>
                    {order.kecepatan_pengerjaan === 'express' && (
                      <span className="express-tag">⚡ EXPRESS</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="customer-info">
                    <div className="customer-name">{order.nama_customer}</div>
                    {order.telepon_customer && (
                      <div className="customer-phone">
                        📞 {order.telepon_customer}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <span
                    className={`jenis-badge ${
                      order.jenis_order === 'offline' ? 'offline' : 'online'
                    }`}
                  >
                    {order.jenis_order === 'offline'
                      ? '🏪 Offline'
                      : '🌐 Online'}
                  </span>
                </td>
                <td>
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: statusInfo.color,
                      fontWeight: '700',
                    }}
                  >
                    {statusInfo.label}
                  </span>
                </td>
                <td>{formatDate(order.tanggal_order)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => onViewDetail(order)}
                      className="btn-detail"
                    >
                      👁️ Detail
                    </button>

                    {['pending', 'dibayar', 'validasi'].includes(
                      order.status_order,
                    ) && (
                      <button
                        onClick={() => onUpdateStatus(order.id_order, 'start')}
                        disabled={updating}
                        className="btn-start"
                      >
                        🔄 Mulai Cetak
                      </button>
                    )}

                    {['diproses', 'cetak'].includes(order.status_order) && (
                      <button
                        onClick={() => onStartComplete(order.id_order)}
                        disabled={updating}
                        className="btn-complete"
                      >
                        ✅ Selesai Dikerjakan
                      </button>
                    )}

                    {order.status_order === 'selesai' && (
                      <span
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#28a745',
                          color: 'white',
                          borderRadius: '6px',
                          fontWeight: '700',
                          fontSize: '0.85rem',
                          display: 'inline-block',
                        }}
                      >
                        ✅ SELESAI - Menunggu Kasir
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ============ DESIGN FILES SECTION ============
interface DesignFilesSectionProps {
  files?: DesignFile[];
  onDownload: (fileUrl: string, fileName: string) => void;
}

export const DesignFilesSection: React.FC<DesignFilesSectionProps> = ({
  files,
  onDownload,
}) => {
  if (!files || files.length === 0) {
    return (
      <div
        style={{
          background: '#fff3cd',
          border: '1px solid #ffc107',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          textAlign: 'center',
        }}
      >
        <p style={{ margin: 0, color: '#856404' }}>
          ℹ️ Pesanan ini tidak memerlukan file design
        </p>
      </div>
    );
  }

  return (
    <div
      className="detail-section"
      style={{
        background: '#f0f9ff',
        border: '2px solid #3b82f6',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
      }}
    >
      <h3 style={{ color: '#1e40af', marginBottom: '1rem' }}>
        📁 File Design Customer ({files.length})
      </h3>

      {files.map((file, idx) => (
        <div
          key={file.id_file}
          style={{
            background: 'white',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div style={{ fontSize: '2.5rem' }}>
              {file.tipe_file.match(/image/i) ? '🖼️' : '📄'}
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontWeight: '600',
                  marginBottom: '0.25rem',
                  color: '#1e293b',
                }}
              >
                {idx + 1}. {file.nama_file}
              </p>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  marginBottom: '0.25rem',
                }}
              >
                📦 {formatFileSize(file.ukuran_file)} • 📅{' '}
                {formatDate(file.tanggal_upload)}
              </p>
            </div>
            <button
              onClick={() => onDownload(file.file_url, file.nama_file)}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              📥 Download
            </button>
          </div>

          {file.tipe_file.match(/image/i) && (
            <div style={{ marginTop: '1rem' }}>
              <img
                src={file.file_url}
                alt={file.nama_file}
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  objectFit: 'contain',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  background: 'white',
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ============ ORDER ITEMS SECTION ============
interface OrderItemsSectionProps {
  items?: OrderItem[];
}

export const OrderItemsSection: React.FC<OrderItemsSectionProps> = ({
  items,
}) => {
  if (!items || items.length === 0) {
    return (
      <div className="detail-section">
        <h3>📦 Item Pesanan</h3>
        <p className="no-items">Tidak ada item</p>
      </div>
    );
  }

  return (
    <div className="detail-section">
      <h3>📦 Item Pesanan</h3>
      <div className="items-list">
        {items.map((item, index) => (
          <div key={index} className="item-card">
            <div className="item-header">
              <strong>{item.nama_produk}</strong>
              <span
                style={{
                  background: '#667eea',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontWeight: '600',
                }}
              >
                × {item.jumlah}
              </span>
            </div>
            {item.ukuran && (
              <div className="item-detail">
                📐 Ukuran: <strong>{item.ukuran}</strong>
              </div>
            )}
            {item.harga_satuan && (
              <div className="item-detail">
                💰 Harga:{' '}
                <strong>{formatRupiah(item.harga_satuan)} / pcs</strong>
              </div>
            )}
            {item.catatan_item && (
              <div
                className="item-detail"
                style={{
                  background: '#f1f5f9',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  marginTop: '0.5rem',
                }}
              >
                💬 {item.catatan_item}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ UPLOAD RESULT MODAL ============
interface UploadResultModalProps {
  show: boolean;
  uploading: boolean;
  resultFile: File | null;
  onClose: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
}

export const UploadResultModal: React.FC<UploadResultModalProps> = ({
  show,
  uploading,
  resultFile,
  onClose,
  onFileChange,
  onUpload,
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={() => !uploading && onClose()}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '500px' }}
      >
        <div className="modal-header">
          <div>
            <h2>📤 Upload File Hasil</h2>
            <p>Upload file hasil pekerjaan operator</p>
          </div>
          <button
            onClick={onClose}
            className="modal-close"
            disabled={uploading}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div
            style={{
              background: '#fff3cd',
              border: '2px solid #ffc107',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
            }}
          >
            <h3
              style={{
                margin: '0 0 0.5rem 0',
                fontSize: '1rem',
                color: '#856404',
              }}
            >
              ⚠️ PENTING
            </h3>
            <ul
              style={{
                margin: 0,
                paddingLeft: '1.5rem',
                color: '#856404',
                fontSize: '0.9rem',
                lineHeight: '1.6',
              }}
            >
              <li>Upload file hasil cetakan yang sudah jadi</li>
              <li>File bisa berupa gambar (JPG/PNG) atau PDF</li>
              <li>Maksimal ukuran file: 20MB</li>
              <li>File akan dikirim ke kasir untuk customer</li>
            </ul>
          </div>

          <div
            style={{
              background: '#f8f9fa',
              padding: '1.5rem',
              borderRadius: '8px',
              border: resultFile ? '2px solid #28a745' : '2px dashed #667eea',
            }}
          >
            <label
              style={{
                display: 'block',
                marginBottom: '0.75rem',
                fontWeight: 'bold',
                fontSize: '1rem',
                color: '#333',
              }}
            >
              📁 Pilih File Hasil *
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={onFileChange}
              disabled={uploading}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #ddd',
                background: 'white',
                cursor: uploading ? 'not-allowed' : 'pointer',
              }}
            />

            {resultFile && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: '#d4edda',
                  border: '1px solid #28a745',
                  borderRadius: '6px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ fontSize: '2rem' }}>
                    {resultFile.type.includes('pdf') ? '📄' : '🖼️'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 'bold',
                        color: '#155724',
                      }}
                    >
                      {resultFile.name}
                    </p>
                    <p
                      style={{
                        margin: '0.25rem 0 0 0',
                        fontSize: '0.85rem',
                        color: '#155724',
                      }}
                    >
                      {(resultFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div style={{ fontSize: '1.5rem', color: '#28a745' }}>✅</div>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <button
              onClick={onClose}
              disabled={uploading}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #ddd',
                background: 'white',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
              }}
            >
              Batal
            </button>
            <button
              onClick={onUpload}
              disabled={!resultFile || uploading}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '6px',
                border: 'none',
                background: !resultFile || uploading ? '#ccc' : '#28a745',
                color: 'white',
                cursor: !resultFile || uploading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
              }}
            >
              {uploading ? '⏳ Mengupload...' : '✅ Upload & Selesaikan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
