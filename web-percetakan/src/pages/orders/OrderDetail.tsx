import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './orders.css';

const API_BASE_URL = 'http://localhost/api-percetakan/api';

interface OrderItem {
  id_item: string;
  id_produk: string;
  nama_produk: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
  catatan_item: string;
  ukuran?: string;
}

interface OrderDetailData {
  id_order: string;
  kode_order: string;
  id_user: string;
  nama_customer: string;
  email_customer: string;
  telepon_customer: string;
  alamat_pengiriman: string;
  total_harga: number;
  subtotal: number;
  diskon: number;
  ongkir: number;
  status_order: string;
  status_pembayaran: string;
  tanggal_order: string;
  catatan: string;
  jenis_order: string;
  kecepatan_pengerjaan: string;
  nama_kasir?: string;
  items: OrderItem[];
}

interface OrderDetailProps {
  orderId: string;
  onClose: (success: boolean) => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ orderId, onClose }) => {
  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching order detail:', orderId);
      const response = await axios.get(`${API_BASE_URL}/orders.php`, {
        params: { op: 'detail', id: orderId },
        headers: { Accept: 'application/json' },
        timeout: 10000,
      });

      console.log('Order detail response:', response.data);

      if (response.data.status === 'success') {
        setOrder(response.data.data);
      } else {
        throw new Error(response.data.message || 'Gagal memuat detail');
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      setError('Gagal memuat detail pesanan');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!confirm(`Ubah status pesanan menjadi "${newStatus}"?`)) return;

    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('status_order', newStatus);

      const response = await axios.post(
        `${API_BASE_URL}/orders.php?op=update&id=${orderId}`,
        formData,
        { headers: { Accept: 'application/json' } },
      );

      if (response.data.status === 'success') {
        alert('✅ Status berhasil diupdate!');
        fetchOrderDetail();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error('Update error:', error);
      alert(
        '❌ Gagal update status: ' +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setUpdating(false);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; class: string } } = {
      pending: { label: 'Pending', class: 'badge-warning' },
      dikonfirmasi: { label: 'Dikonfirmasi', class: 'badge-info' },
      proses: { label: 'Proses', class: 'badge-primary' },
      selesai: { label: 'Selesai', class: 'badge-success' },
      dibatalkan: { label: 'Dibatalkan', class: 'badge-danger' },
    };
    const statusInfo = statusMap[status] || {
      label: status,
      class: 'badge-secondary',
    };
    return (
      <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>
    );
  };

  const getPaymentBadge = (status: string) => {
    const paymentMap: { [key: string]: { label: string; class: string } } = {
      pending: { label: 'Belum Bayar', class: 'badge-warning' },
      dibayar: { label: 'Lunas', class: 'badge-success' },
      gagal: { label: 'Gagal', class: 'badge-danger' },
    };
    const paymentInfo = paymentMap[status] || {
      label: status,
      class: 'badge-secondary',
    };
    return (
      <span className={`badge ${paymentInfo.class}`}>{paymentInfo.label}</span>
    );
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content modal-large">
          <div className="loading">
            <div className="spinner"></div>
            <p>Memuat detail pesanan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="alert alert-danger">
            <p>{error || 'Data tidak ditemukan'}</p>
          </div>
          <button className="btn-secondary" onClick={() => onClose(false)}>
            Tutup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div
        className="modal-content modal-large"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>Detail Pesanan #{order.id_order}</h2>
            <p
              style={{
                margin: '0.5rem 0 0 0',
                color: '#718096',
                fontSize: '0.9rem',
              }}
            >
              Kode: <strong>{order.kode_order}</strong>
            </p>
          </div>
          <button className="modal-close" onClick={() => onClose(false)}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Status Cards - IMPROVED */}
          <section className="detail-section">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#F7FAFC',
                  borderRadius: '8px',
                  border: '2px solid #E2E8F0',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#718096',
                    marginBottom: '0.5rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  Status Order
                </div>
                {getStatusBadge(order.status_order)}
              </div>
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#F7FAFC',
                  borderRadius: '8px',
                  border: '2px solid #E2E8F0',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#718096',
                    marginBottom: '0.5rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  Status Pembayaran
                </div>
                {getPaymentBadge(order.status_pembayaran)}
              </div>
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#F7FAFC',
                  borderRadius: '8px',
                  border: '2px solid #E2E8F0',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#718096',
                    marginBottom: '0.5rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  Jenis Order
                </div>
                <span
                  style={{
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    color:
                      order.jenis_order === 'offline' ? '#E67E22' : '#3498DB',
                  }}
                >
                  {order.jenis_order === 'offline' ? '🏪 Offline' : '🌐 Online'}
                </span>
              </div>
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#F7FAFC',
                  borderRadius: '8px',
                  border: '2px solid #E2E8F0',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#718096',
                    marginBottom: '0.5rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  Kecepatan
                </div>
                <span
                  style={{
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    color:
                      order.kecepatan_pengerjaan === 'express'
                        ? '#E67E22'
                        : '#2ECC71',
                  }}
                >
                  {order.kecepatan_pengerjaan === 'express'
                    ? '⚡ Express'
                    : '⏱️ Normal'}
                </span>
              </div>
            </div>
          </section>

          {/* Customer Info */}
          <section className="detail-section">
            <h3>👤 Informasi Customer</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Nama:</label>
                <span>{order.nama_customer || '-'}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{order.email_customer || '-'}</span>
              </div>
              <div className="info-item">
                <label>Telepon:</label>
                <span>{order.telepon_customer || '-'}</span>
              </div>
              {order.alamat_pengiriman && (
                <div className="info-item full-width">
                  <label>Alamat Pengiriman:</label>
                  <span>{order.alamat_pengiriman}</span>
                </div>
              )}
              {order.nama_kasir && (
                <div className="info-item">
                  <label>Kasir:</label>
                  <span>👨‍💼 {order.nama_kasir}</span>
                </div>
              )}
            </div>
          </section>

          {/* Order Info */}
          <section className="detail-section">
            <h3>📋 Informasi Pesanan</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Tanggal Order:</label>
                <span>{formatDate(order.tanggal_order)}</span>
              </div>
              <div className="info-item">
                <label>Total Harga:</label>
                <span className="price-large">
                  {formatRupiah(order.total_harga)}
                </span>
              </div>
              {order.catatan && (
                <div className="info-item full-width">
                  <label>Catatan:</label>
                  <span className="note-text">{order.catatan}</span>
                </div>
              )}
            </div>
          </section>

          {/* Order Items - IMPROVED */}
          <section className="detail-section">
            <h3>📦 Item Pesanan</h3>
            {order.items && order.items.length > 0 ? (
              <div className="items-table-wrapper">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Produk</th>
                      <th>Jumlah</th>
                      <th>Harga Satuan</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="item-name">{item.nama_produk}</div>
                          {item.ukuran && (
                            <small
                              style={{
                                color: '#718096',
                                display: 'block',
                                marginTop: '0.25rem',
                              }}
                            >
                              📐 Ukuran: {item.ukuran}
                            </small>
                          )}
                          {item.catatan_item && (
                            <small className="item-note">
                              💬 Note: {item.catatan_item}
                            </small>
                          )}
                        </td>
                        <td className="text-center">{item.jumlah}</td>
                        <td className="text-right">
                          {formatRupiah(item.harga_satuan)}
                        </td>
                        <td className="text-right">
                          <strong>{formatRupiah(item.subtotal)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div
                style={{
                  padding: '3rem',
                  textAlign: 'center',
                  backgroundColor: '#F7FAFC',
                  borderRadius: '8px',
                  border: '1px dashed #CBD5E0',
                }}
              >
                <div
                  style={{
                    fontSize: '3rem',
                    marginBottom: '1rem',
                    opacity: 0.5,
                  }}
                >
                  📭
                </div>
                <p style={{ margin: 0, color: '#A0AEC0', fontSize: '1.1rem' }}>
                  Tidak ada item pesanan
                </p>
                <small
                  style={{
                    color: '#CBD5E0',
                    display: 'block',
                    marginTop: '0.5rem',
                  }}
                >
                  Data item mungkin belum tersinkronisasi
                </small>
              </div>
            )}
          </section>

          {/* Pricing Summary - IMPROVED */}
          <section className="detail-section">
            <h3>💰 Ringkasan Pembayaran</h3>
            <div
              style={{
                backgroundColor: '#F8F9FA',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #DEE2E6',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid #E2E8F0',
                }}
              >
                <span style={{ color: '#4A5568' }}>Subtotal:</span>
                <span style={{ fontWeight: 600 }}>
                  {formatRupiah(order.subtotal)}
                </span>
              </div>
              {order.diskon > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid #E2E8F0',
                    color: '#E74C3C',
                  }}
                >
                  <span>🎁 Diskon:</span>
                  <span style={{ fontWeight: 600 }}>
                    - {formatRupiah(order.diskon)}
                  </span>
                </div>
              )}
              {order.ongkir > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid #E2E8F0',
                  }}
                >
                  <span style={{ color: '#4A5568' }}>🚚 Ongkir:</span>
                  <span style={{ fontWeight: 600 }}>
                    + {formatRupiah(order.ongkir)}
                  </span>
                </div>
              )}
              {order.kecepatan_pengerjaan === 'express' && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid #E2E8F0',
                    color: '#F39C12',
                  }}
                >
                  <span>⚡ Express (+50%):</span>
                  <span style={{ fontWeight: 600 }}>Included</span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  fontSize: '1.2rem',
                }}
              >
                <span style={{ fontWeight: 700 }}>TOTAL:</span>
                <span style={{ fontWeight: 700, color: '#2D3748' }}>
                  {formatRupiah(order.total_harga)}
                </span>
              </div>
            </div>
          </section>

          {/* Status Update Actions */}
          {order.status_order !== 'selesai' &&
            order.status_order !== 'dibatalkan' && (
              <section className="detail-section">
                <h3>⚙️ Ubah Status Pesanan</h3>
                <div className="status-actions">
                  {order.status_order === 'pending' && (
                    <>
                      <button
                        className="btn-success"
                        onClick={() => updateOrderStatus('dikonfirmasi')}
                        disabled={updating}
                      >
                        ✅ Konfirmasi Pesanan
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => updateOrderStatus('dibatalkan')}
                        disabled={updating}
                      >
                        ❌ Batalkan
                      </button>
                    </>
                  )}
                  {order.status_order === 'dikonfirmasi' && (
                    <button
                      className="btn-primary"
                      onClick={() => updateOrderStatus('proses')}
                      disabled={updating}
                    >
                      🔄 Mulai Proses
                    </button>
                  )}
                  {order.status_order === 'proses' && (
                    <button
                      className="btn-success"
                      onClick={() => updateOrderStatus('selesai')}
                      disabled={updating}
                    >
                      ✅ Selesai
                    </button>
                  )}
                </div>
              </section>
            )}
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={() => onClose(false)}
            disabled={updating}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
