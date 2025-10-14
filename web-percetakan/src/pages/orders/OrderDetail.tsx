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
}

interface Payment {
  id_pembayaran: string;
  metode_pembayaran: string;
  jumlah_bayar: number;
  status_pembayaran: string;
  tanggal_bayar: string;
  bukti_transfer: string;
}

interface Delivery {
  id_pengiriman: string;
  metode_pengiriman: string;
  biaya_pengiriman: number;
  status_pengiriman: string;
  tanggal_kirim: string;
  tanggal_terima: string;
  no_resi: string;
}

interface OrderDetailData {
  id_order: string;
  id_user: string;
  nama_customer: string;
  email_customer: string;
  telepon_customer: string;
  alamat_pengiriman: string;
  total_harga: number;
  status_order: string;
  status_pembayaran: string;
  tanggal_order: string;
  catatan: string;
  items: OrderItem[];
  payment: Payment | null;
  delivery: Delivery | null;
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
      const response = await axios.get(`${API_BASE_URL}/orders.php`, {
        params: { op: 'detail', id: orderId },
        headers: { Accept: 'application/json' },
        timeout: 10000,
      });

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
        alert('Status berhasil diupdate!');
        fetchOrderDetail();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error('Update error:', error);
      alert(
        'Gagal update status: ' +
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
          <h2>Detail Pesanan #{order.id_order}</h2>
          <button className="modal-close" onClick={() => onClose(false)}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Customer Info */}
          <section className="detail-section">
            <h3>📋 Informasi Customer</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Nama:</label>
                <span>{order.nama_customer}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{order.email_customer}</span>
              </div>
              <div className="info-item">
                <label>Telepon:</label>
                <span>{order.telepon_customer}</span>
              </div>
              <div className="info-item full-width">
                <label>Alamat Pengiriman:</label>
                <span>{order.alamat_pengiriman}</span>
              </div>
            </div>
          </section>

          {/* Order Info */}
          <section className="detail-section">
            <h3>🛒 Informasi Pesanan</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Tanggal Order:</label>
                <span>{formatDate(order.tanggal_order)}</span>
              </div>
              <div className="info-item">
                <label>Status Order:</label>
                <span>{getStatusBadge(order.status_order)}</span>
              </div>
              <div className="info-item">
                <label>Status Pembayaran:</label>
                <span>{getPaymentBadge(order.status_pembayaran)}</span>
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

          {/* Order Items */}
          <section className="detail-section">
            <h3>📦 Item Pesanan</h3>
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
                  {order.items.map(item => (
                    <tr key={item.id_item}>
                      <td>
                        <div className="item-name">{item.nama_produk}</div>
                        {item.catatan_item && (
                          <small className="item-note">
                            Note: {item.catatan_item}
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
                  <tr className="total-row">
                    <td colSpan={3} className="text-right">
                      <strong>TOTAL:</strong>
                    </td>
                    <td className="text-right">
                      <strong className="price-large">
                        {formatRupiah(order.total_harga)}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Payment Info */}
          {order.payment && (
            <section className="detail-section">
              <h3>💳 Informasi Pembayaran</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Metode:</label>
                  <span>{order.payment.metode_pembayaran}</span>
                </div>
                <div className="info-item">
                  <label>Jumlah:</label>
                  <span>{formatRupiah(order.payment.jumlah_bayar)}</span>
                </div>
                <div className="info-item">
                  <label>Status:</label>
                  <span>
                    {getPaymentBadge(order.payment.status_pembayaran)}
                  </span>
                </div>
                <div className="info-item">
                  <label>Tanggal Bayar:</label>
                  <span>{formatDate(order.payment.tanggal_bayar)}</span>
                </div>
                {order.payment.bukti_transfer && (
                  <div className="info-item full-width">
                    <label>Bukti Transfer:</label>
                    <a
                      href={order.payment.bukti_transfer}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-primary"
                    >
                      Lihat Bukti →
                    </a>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Delivery Info */}
          {order.delivery && (
            <section className="detail-section">
              <h3>🚚 Informasi Pengiriman</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Metode:</label>
                  <span>{order.delivery.metode_pengiriman}</span>
                </div>
                <div className="info-item">
                  <label>Biaya:</label>
                  <span>{formatRupiah(order.delivery.biaya_pengiriman)}</span>
                </div>
                <div className="info-item">
                  <label>Status:</label>
                  <span className="badge badge-info">
                    {order.delivery.status_pengiriman}
                  </span>
                </div>
                <div className="info-item">
                  <label>No. Resi:</label>
                  <span>{order.delivery.no_resi || '-'}</span>
                </div>
                <div className="info-item">
                  <label>Tanggal Kirim:</label>
                  <span>{formatDate(order.delivery.tanggal_kirim)}</span>
                </div>
                <div className="info-item">
                  <label>Tanggal Terima:</label>
                  <span>{formatDate(order.delivery.tanggal_terima)}</span>
                </div>
              </div>
            </section>
          )}

          {/* Status Update Actions */}
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
