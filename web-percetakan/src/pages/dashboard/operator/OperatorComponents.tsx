// OperatorComponents.tsx - All Small Components
import React from 'react';
import {
  ClipboardList,
  Zap,
  Printer,
  CheckCircle,
  Eye,
  RefreshCw,
  Phone,
  Store,
  Globe,
  FolderOpen,
  Image as ImageIcon,
  FileText,
  Download,
  Package,
  Upload,
  X,
  AlertTriangle,
  Check,
} from 'lucide-react';
import type {
  Order,
  Stats,
  DesignFile,
  OrderItem,
  ItemUploadStatus,
} from './operatorTypes';
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
      <div
        className="stat-card"
        style={{
          background: 'white',
          color: '#1e293b',
          border: '2px solid #e2e8f0',
        }}
      >
        <div
          className="stat-icon"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ClipboardList size={32} />
        </div>
        <div className="stat-info">
          <div className="stat-label">Queue Hari Ini</div>
          <div className="stat-value">{stats.todayQueue}</div>
        </div>
      </div>

      <div
        className="stat-card"
        style={{
          background: 'white',
          color: '#1e293b',
          border: '2px solid #e2e8f0',
        }}
      >
        <div
          className="stat-icon"
          style={{
            background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
            color: 'white',
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Zap size={32} />
        </div>
        <div className="stat-info">
          <div className="stat-label">Express Priority</div>
          <div className="stat-value">{stats.expressQueue}</div>
        </div>
      </div>

      <div
        className="stat-card"
        style={{
          background: 'white',
          color: '#1e293b',
          border: '2px solid #e2e8f0',
        }}
      >
        <div
          className="stat-icon"
          style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            color: 'white',
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Printer size={32} />
        </div>
        <div className="stat-info">
          <div className="stat-label">Dalam Proses</div>
          <div className="stat-value">{stats.inProgress}</div>
        </div>
      </div>

      <div
        className="stat-card"
        style={{
          background: 'white',
          color: '#1e293b',
          border: '2px solid #e2e8f0',
        }}
      >
        <div
          className="stat-icon"
          style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            color: 'white',
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckCircle size={32} />
        </div>
        <div className="stat-info">
          <div className="stat-label">Selesai Hari Ini</div>
          <div className="stat-value">{stats.todayQueue}</div>
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
        <div
          className="empty-icon"
          style={{ fontSize: '4rem', color: '#2563eb' }}
        >
          <CheckCircle size={80} />
        </div>
        <h3 style={{ color: '#2563eb' }}>Tidak Ada Pesanan di Queue</h3>
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
                      ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
                      : 'transparent',
                  borderLeft:
                    order.status_order === 'selesai'
                      ? '4px solid #2563eb'
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
                      <span className="express-tag">
                        <Zap size={14} style={{ marginRight: '4px' }} />
                        EXPRESS
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="customer-info">
                    <div className="customer-name">{order.nama_customer}</div>
                    {order.telepon_customer && (
                      <div className="customer-phone">
                        <Phone size={14} style={{ marginRight: '4px' }} />
                        {order.telepon_customer}
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
                    {order.jenis_order === 'offline' ? (
                      <>
                        <Store size={14} style={{ marginRight: '4px' }} />
                        Offline
                      </>
                    ) : (
                      <>
                        <Globe size={14} style={{ marginRight: '4px' }} />
                        Online
                      </>
                    )}
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
                      <Eye size={16} style={{ marginRight: '6px' }} />
                      Detail
                    </button>

                    {['pending', 'dibayar', 'validasi'].includes(
                      order.status_order,
                    ) && (
                      <button
                        onClick={() => onUpdateStatus(order.id_order, 'start')}
                        disabled={updating}
                        className="btn-start"
                      >
                        <RefreshCw size={16} style={{ marginRight: '6px' }} />
                        Mulai Cetak
                      </button>
                    )}

                    {['diproses', 'cetak'].includes(order.status_order) && (
                      <button
                        onClick={() => onStartComplete(order.id_order)}
                        disabled={updating}
                        className="btn-complete"
                      >
                        <CheckCircle size={16} style={{ marginRight: '6px' }} />
                        Selesai Dikerjakan
                      </button>
                    )}

                    {order.status_order === 'selesai' && (
                      <span
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#2563eb',
                          color: 'white',
                          borderRadius: '6px',
                          fontWeight: '700',
                          fontSize: '0.85rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <CheckCircle size={16} />
                        SELESAI - Menunggu Kasir
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
          background: '#dbeafe',
          border: '1px solid #3b82f6',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <AlertTriangle size={20} color="#1e40af" />
        <p style={{ margin: 0, color: '#1e40af' }}>
          Pesanan ini tidak memerlukan file design
        </p>
      </div>
    );
  }

  return (
    <div
      className="detail-section"
      style={{
        background: '#eff6ff',
        border: '2px solid #3b82f6',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
      }}
    >
      <h3
        style={{
          color: '#1e40af',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <FolderOpen size={24} />
        File Design Customer ({files.length})
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
            <div style={{ fontSize: '2.5rem', color: '#3b82f6' }}>
              {file.tipe_file.match(/image/i) ? (
                <ImageIcon size={40} />
              ) : (
                <FileText size={40} />
              )}
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
                {formatFileSize(file.ukuran_file)} •{' '}
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
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Download size={16} />
              Download
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
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={24} />
          Item Pesanan
        </h3>
        <p className="no-items">Tidak ada item</p>
      </div>
    );
  }

  return (
    <div className="detail-section">
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Package size={24} />
        Item Pesanan
      </h3>
      <div className="items-list">
        {items.map((item, index) => (
          <div key={index} className="item-card">
            <div className="item-header">
              <strong>{item.nama_produk}</strong>
              <span
                style={{
                  background: '#3b82f6',
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
                Ukuran: <strong>{item.ukuran}</strong>
              </div>
            )}
            {item.harga_satuan && (
              <div className="item-detail">
                Harga: <strong>{formatRupiah(item.harga_satuan)} / pcs</strong>
              </div>
            )}
            {item.catatan_item && (
              <div
                className="item-detail"
                style={{
                  background: '#eff6ff',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  marginTop: '0.5rem',
                  color: '#1e40af',
                }}
              >
                {item.catatan_item}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ UPLOAD RESULT MODAL (PER ITEM) ============
interface UploadResultModalProps {
  show: boolean;
  uploading: boolean;
  items: ItemUploadStatus[];
  onClose: () => void;
  onFileChange: (itemId: string, file: File | null) => void;
  onUpload: () => void;
}

export const UploadResultModal: React.FC<UploadResultModalProps> = ({
  show,
  uploading,
  items,
  onClose,
  onFileChange,
  onUpload,
}) => {
  if (!show) return null;

  const allUploaded = items.every(item => item.file !== null);
  const uploadedCount = items.filter(item => item.file !== null).length;

  return (
    <div className="modal-overlay" onClick={() => !uploading && onClose()}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }}
      >
        <div className="modal-header">
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={24} />
              Upload File Hasil Per Item
            </h2>
            <p>
              Upload file hasil untuk setiap item pesanan ({uploadedCount}/
              {items.length} selesai)
            </p>
          </div>
          <button
            onClick={onClose}
            className="modal-close"
            disabled={uploading}
          >
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {/* Warning Info */}
          <div
            style={{
              background: '#dbeafe',
              border: '2px solid #3b82f6',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
            }}
          >
            <h3
              style={{
                margin: '0 0 0.5rem 0',
                fontSize: '1rem',
                color: '#1e40af',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={20} />
              PENTING
            </h3>
            <ul
              style={{
                margin: 0,
                paddingLeft: '1.5rem',
                color: '#1e40af',
                fontSize: '0.9rem',
                lineHeight: '1.6',
              }}
            >
              <li>
                <strong>Upload file hasil untuk SETIAP item</strong> yang
                dipesan customer
              </li>
              <li>File bisa berupa gambar (JPG/PNG) atau PDF</li>
              <li>Maksimal ukuran file per item: 20MB</li>
              <li>
                Button "Selesai" aktif setelah{' '}
                <strong>SEMUA item terisi</strong>
              </li>
            </ul>
          </div>

          {/* List Items untuk Upload */}
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {items.map((item, index) => (
              <div
                key={item.id_item}
                style={{
                  background: item.file ? '#dbeafe' : '#f8f9fa',
                  border: item.file
                    ? '2px solid #3b82f6'
                    : '2px dashed #93c5fd',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Item Info */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div
                    style={{
                      background: item.file ? '#3b82f6' : '#93c5fd',
                      color: 'white',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '1.2rem',
                    }}
                  >
                    {item.file ? <Check size={24} /> : index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4
                      style={{
                        margin: '0 0 0.25rem 0',
                        fontSize: '1.1rem',
                        color: '#333',
                      }}
                    >
                      {item.nama_produk}
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.9rem',
                        color: '#666',
                      }}
                    >
                      Jumlah: <strong>× {item.jumlah}</strong>
                    </p>
                  </div>
                  {item.file && (
                    <div
                      style={{
                        fontSize: '2rem',
                        color: '#3b82f6',
                      }}
                    >
                      <CheckCircle size={32} />
                    </div>
                  )}
                </div>

                {/* File Input */}
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      color: '#333',
                    }}
                  >
                    <FolderOpen size={16} />
                    Upload File Hasil *
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={e => {
                      const file = e.target.files?.[0] || null;
                      if (file) {
                        if (file.size > 20 * 1024 * 1024) {
                          alert('Ukuran file maksimal 20MB!');
                          e.target.value = '';
                          return;
                        }
                      }
                      onFileChange(item.id_item, file);
                    }}
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

                  {/* File Preview */}
                  {item.file && (
                    <div
                      style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem',
                        background: 'white',
                        border: '1px solid #3b82f6',
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
                        <div style={{ fontSize: '1.5rem', color: '#3b82f6' }}>
                          {item.file.type.includes('pdf') ? (
                            <FileText size={24} />
                          ) : (
                            <ImageIcon size={24} />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              margin: 0,
                              fontWeight: 'bold',
                              color: '#1e40af',
                              fontSize: '0.9rem',
                            }}
                          >
                            {item.file.name}
                          </p>
                          <p
                            style={{
                              margin: '0.25rem 0 0 0',
                              fontSize: '0.8rem',
                              color: '#1e40af',
                            }}
                          >
                            {(item.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}
            >
              <span style={{ fontWeight: 'bold' }}>Progress Upload:</span>
              <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>
                {uploadedCount} / {items.length} items
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '12px',
                background: '#e0e0e0',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(uploadedCount / items.length) * 100}%`,
                  height: '100%',
                  background: allUploaded
                    ? 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)'
                    : 'linear-gradient(90deg, #93c5fd 0%, #60a5fa 100%)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
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
              disabled={!allUploaded || uploading}
              style={{
                flex: 2,
                padding: '0.75rem',
                borderRadius: '6px',
                border: 'none',
                background:
                  !allUploaded || uploading
                    ? '#ccc'
                    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                cursor: !allUploaded || uploading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {uploading ? (
                <>
                  <RefreshCw size={16} className="spin" />
                  Mengupload...
                </>
              ) : allUploaded ? (
                <>
                  <CheckCircle size={16} />
                  Upload Semua & Selesaikan ({items.length} files)
                </>
              ) : (
                <>
                  <AlertTriangle size={16} />
                  Lengkapi {items.length - uploadedCount} item lagi
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
