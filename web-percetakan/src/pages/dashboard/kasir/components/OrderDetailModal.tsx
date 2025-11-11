// OrderDetailModal.tsx
import React from 'react';

interface DesignFile {
  id_file: string;
  nama_file: string;
  file_url: string;
  ukuran_file: number;
  tipe_file: string;
  tanggal_upload: string;
}

interface ResultFile {
  id_result: string;
  nama_file: string;
  file_url: string;
  ukuran_file: number;
  tipe_file: string;
  tanggal_upload: string;
  keterangan?: string;
  uploaded_by?: string;
}

interface OrderItem {
  id_item: string;
  nama_produk: string;
  jumlah: number;
  ukuran: string;
  catatan_item: string;
  harga_satuan?: number;
}

interface Order {
  id_order: string;
  kode_order: string;
  nama_customer: string;
  email_customer?: string;
  telepon_customer?: string;
  total_harga: number;
  status_order: string;
  status_pembayaran?: string;
  jenis_order?: string;
  tanggal_order: string;
  tanggal_selesai?: string;
  items?: OrderItem[];
  design_files?: DesignFile[];
  result_files?: ResultFile[];
}

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onDownloadFile: (fileUrl: string, fileName: string) => void;
  onPrintInvoice: (order: Order) => void;
  formatRupiah: (amount: number) => string;
  formatDate: (dateString: string) => string;
  formatFileSize: (bytes: number) => string;
  getStatusLabel: (status: string) => string;
  getStatusPembayaran: (order: Order) => string;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onDownloadFile,
  onPrintInvoice,
  formatRupiah,
  formatDate,
  formatFileSize,
  getStatusLabel,
  getStatusPembayaran,
}) => {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.5rem',
            borderBottom: '1px solid #e0e0e0',
            position: 'sticky',
            top: 0,
            background: 'white',
            zIndex: 10,
          }}
        >
          <div>
            <h2 style={{ margin: '0 0 0.5rem 0' }}>Detail Pesanan</h2>
            <p style={{ margin: 0, color: '#666' }}>
              <strong>{order.kode_order}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          {/* FILE HASIL OPERATOR - PRIORITAS */}
          {order.result_files && order.result_files.length > 0 && (
            <div
              style={{
                background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                border: '3px solid #28a745',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 12px rgba(40, 167, 69, 0.2)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ fontSize: '2rem' }}>✅</div>
                <h3
                  style={{
                    margin: 0,
                    color: '#155724',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                  }}
                >
                  FILE HASIL OPERATOR - SIAP DISERAHKAN KE CUSTOMER
                </h3>
              </div>
              <div
                style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '2px solid #28a745',
                }}
              >
                <p
                  style={{
                    margin: '0 0 1rem 0',
                    fontSize: '0.95rem',
                    color: '#155724',
                    fontWeight: '600',
                  }}
                >
                  📦 Total {order.result_files.length} file hasil dari operator
                </p>
                {order.result_files.map((file, idx) => (
                  <div
                    key={file.id_result}
                    style={{
                      background: '#f8f9fa',
                      padding: '1rem',
                      borderRadius: '6px',
                      marginBottom:
                        idx < order.result_files!.length - 1 ? '1rem' : '0',
                      border: '1px solid #dee2e6',
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
                            margin: '0 0 0.25rem 0',
                            fontWeight: '700',
                            fontSize: '1rem',
                            color: '#155724',
                          }}
                        >
                          {idx + 1}. {file.nama_file}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.85rem',
                            color: '#6c757d',
                          }}
                        >
                          📦 {formatFileSize(file.ukuran_file)} • 📅{' '}
                          {formatDate(file.tanggal_upload)}
                        </p>
                        {file.keterangan && (
                          <p
                            style={{
                              margin: '0.25rem 0 0 0',
                              fontSize: '0.8rem',
                              color: '#6c757d',
                              fontStyle: 'italic',
                            }}
                          >
                            💬 {file.keterangan}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          onDownloadFile(file.file_url, file.nama_file)
                        }
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '700',
                          fontSize: '0.95rem',
                          boxShadow: '0 2px 6px rgba(40, 167, 69, 0.3)',
                        }}
                      >
                        📥 Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Design Customer - Referensi */}
          {order.design_files && order.design_files.length > 0 && (
            <div
              style={{
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
              }}
            >
              <h3
                style={{
                  margin: '0 0 1rem 0',
                  color: '#6c757d',
                  fontSize: '1rem',
                }}
              >
                📁 File Design Awal dari Customer (Referensi)
              </h3>
              {order.design_files.map((file, idx) => (
                <div
                  key={file.id_file}
                  style={{
                    background: 'white',
                    padding: '1rem',
                    borderRadius: '6px',
                    marginBottom:
                      idx < order.design_files!.length - 1 ? '1rem' : '0',
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
                    <div style={{ fontSize: '1.5rem' }}>
                      {file.tipe_file.match(/image/i) ? '🖼️' : '📄'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          margin: '0 0 0.25rem 0',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                        }}
                      >
                        {file.nama_file}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.8rem',
                          color: '#6c757d',
                        }}
                      >
                        📦 {formatFileSize(file.ukuran_file)}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        onDownloadFile(file.file_url, file.nama_file)
                      }
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                      }}
                    >
                      📥
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Customer */}
          <div
            style={{
              background: '#f8f9fa',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>
              👤 Informasi Customer
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    color: '#666',
                    marginBottom: '0.25rem',
                  }}
                >
                  Nama:
                </label>
                <strong>{order.nama_customer}</strong>
              </div>
              {order.telepon_customer && (
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      color: '#666',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Telepon:
                  </label>
                  <strong>{order.telepon_customer}</strong>
                </div>
              )}
              {order.email_customer && (
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      color: '#666',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Email:
                  </label>
                  <strong>{order.email_customer}</strong>
                </div>
              )}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    color: '#666',
                    marginBottom: '0.25rem',
                  }}
                >
                  Jenis Order:
                </label>
                <strong>
                  {order.jenis_order === 'offline' ? '🏪 Offline' : '🌐 Online'}
                </strong>
              </div>
            </div>
          </div>

          {/* Items */}
          <div
            style={{
              background: '#f8f9fa',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>
              📦 Item Pesanan
            </h3>
            {order.items && order.items.length > 0 ? (
              order.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'white',
                    padding: '1rem',
                    borderRadius: '6px',
                    marginBottom: idx < order.items!.length - 1 ? '1rem' : '0',
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <strong style={{ fontSize: '1rem' }}>
                      {item.nama_produk}
                    </strong>
                    <span
                      style={{
                        background: '#667eea',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                      }}
                    >
                      × {item.jumlah}
                    </span>
                  </div>
                  {item.ukuran && (
                    <div
                      style={{
                        fontSize: '0.9rem',
                        color: '#666',
                        marginBottom: '0.25rem',
                      }}
                    >
                      📐 Ukuran: {item.ukuran}
                    </div>
                  )}
                  {item.harga_satuan && (
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      💰 {formatRupiah(item.harga_satuan)} / pcs
                    </div>
                  )}
                  {item.catatan_item && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        background: '#f1f5f9',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        color: '#666',
                      }}
                    >
                      💬 {item.catatan_item}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p style={{ margin: 0, color: '#666' }}>Tidak ada item</p>
            )}
          </div>

          {/* Total Pembayaran */}
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '1.5rem',
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <h3
              style={{
                margin: '0 0 0.5rem 0',
                color: 'white',
                fontSize: '1rem',
                opacity: 0.9,
              }}
            >
              TOTAL PEMBAYARAN
            </h3>
            <p
              style={{
                margin: 0,
                color: 'white',
                fontSize: '2.5rem',
                fontWeight: 'bold',
              }}
            >
              {formatRupiah(order.total_harga)}
            </p>
            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                }}
              >
                {getStatusLabel(order.status_order)}
              </span>
              <span
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                }}
              >
                {getStatusPembayaran(order)}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div style={{ marginTop: '1.5rem' }}>
            <button
              onClick={() => onPrintInvoice(order)}
              style={{
                width: '100%',
                padding: '1rem',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
              }}
            >
              🖨️ Cetak Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
