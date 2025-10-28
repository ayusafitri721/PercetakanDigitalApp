import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OrderDetail from './OrderDetail';
import './orders.css';

const API_BASE_URL = 'http://localhost/api-percetakan/api';

interface Order {
  id_order: string;
  id_user: string;
  nama_customer: string;
  email_customer: string;
  telepon_customer: string;
  alamat_pengiriman: string;
  total_harga: number;
  status_order: string;
  // ❌ REMOVED: status_pembayaran (pakai status_order aja)
  tanggal_order: string;
  catatan: string;
}

const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/orders.php`, {
        headers: {
          Accept: 'application/json',
        },
        timeout: 10000,
      });

      if (response.data.status === 'success') {
        const ordersData = response.data.data.orders || [];
        setOrders(ordersData);
      } else {
        throw new Error(response.data.message || 'Gagal memuat data');
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      let errorMsg = 'Gagal memuat data pesanan';

      if (error.code === 'ECONNABORTED') {
        errorMsg = '⏱️ Koneksi timeout. Server tidak merespons.';
      } else if (error.code === 'ERR_NETWORK' || !error.response) {
        errorMsg =
          '🔌 Tidak dapat terhubung ke server. Pastikan XAMPP berjalan.';
      } else if (error.response) {
        errorMsg = `⚠️ Server Error ${error.response.status}`;
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
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
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; class: string } } = {
      pending: { label: 'Pending', class: 'badge-warning' },
      dibayar: { label: 'Dibayar', class: 'badge-success' },
      dikonfirmasi: { label: 'Dikonfirmasi', class: 'badge-info' },
      diproses: { label: 'Diproses', class: 'badge-primary' },
      proses: { label: 'Proses', class: 'badge-primary' },
      validasi: { label: 'Validasi', class: 'badge-info' },
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

  // ✅ NEW: Fungsi untuk convert status_order ke status pembayaran
  const getStatusPembayaran = (status_order: string): string => {
    if (
      status_order === 'dibayar' ||
      status_order === 'diproses' ||
      status_order === 'proses' ||
      status_order === 'selesai'
    ) {
      return 'lunas';
    }
    if (status_order === 'dibatalkan') {
      return 'gagal';
    }
    return 'pending';
  };

  const getPaymentBadge = (status_order: string) => {
    const paymentStatus = getStatusPembayaran(status_order);

    const paymentMap: { [key: string]: { label: string; class: string } } = {
      pending: { label: 'Belum Bayar', class: 'badge-warning' },
      lunas: { label: 'Lunas', class: 'badge-success' },
      gagal: { label: 'Gagal', class: 'badge-danger' },
    };

    const paymentInfo = paymentMap[paymentStatus] || {
      label: paymentStatus,
      class: 'badge-secondary',
    };
    return (
      <span className={`badge ${paymentInfo.class}`}>{paymentInfo.label}</span>
    );
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowDetail(true);
  };

  // ✅ FIXED: Filter orders pakai status_order
  const filteredOrders = orders.filter(order => {
    const matchSearch =
      order.id_order?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.nama_customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email_customer?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      filterStatus === 'all' || order.status_order === filterStatus;

    // ✅ FIXED: Filter payment pakai getStatusPembayaran()
    const paymentStatus = getStatusPembayaran(order.status_order);
    const matchPayment =
      filterPayment === 'all' || paymentStatus === filterPayment;

    return matchSearch && matchStatus && matchPayment;
  });

  // ✅ FIXED: Stats pakai status_order
  const pendingCount = orders.filter(o => o.status_order === 'pending').length;
  const unpaidCount = orders.filter(
    o => getStatusPembayaran(o.status_order) === 'pending',
  ).length;

  return (
    <div className="orders-container">
      <div className="orders-header">
        <div>
          <h1>Manajemen Pesanan</h1>
          <p className="subtitle">Kelola semua pesanan pelanggan</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              fill="#E53E3E"
            />
          </svg>
          <div style={{ flex: 1 }}>{error}</div>
          <button onClick={fetchOrders} className="btn-retry">
            🔄 Coba Lagi
          </button>
        </div>
      )}

      {/* Alerts */}
      {!error && (pendingCount > 0 || unpaidCount > 0) && (
        <div className="alerts-grid">
          {pendingCount > 0 && (
            <div className="alert alert-warning">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                  fill="#ED8936"
                />
              </svg>
              <span>
                <strong>Perhatian!</strong> Ada {pendingCount} pesanan menunggu
                konfirmasi
              </span>
            </div>
          )}
          {unpaidCount > 0 && (
            <div className="alert alert-info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                  fill="#3182CE"
                />
              </svg>
              <span>
                <strong>Info!</strong> {unpaidCount} pesanan belum dibayar
              </span>
            </div>
          )}
        </div>
      )}

      {/* Search & Filter */}
      <div className="filter-section">
        <input
          type="text"
          className="search-input"
          placeholder="Cari ID Order, Nama Customer, Email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <div className="filter-buttons">
          <select
            className="filter-select"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="all">Semua Status ({orders.length})</option>
            <option value="pending">
              Pending ({orders.filter(o => o.status_order === 'pending').length}
              )
            </option>
            <option value="dibayar">
              Dibayar ({orders.filter(o => o.status_order === 'dibayar').length}
              )
            </option>
            <option value="dikonfirmasi">
              Dikonfirmasi (
              {orders.filter(o => o.status_order === 'dikonfirmasi').length})
            </option>
            <option value="diproses">
              Diproses (
              {orders.filter(o => o.status_order === 'diproses').length})
            </option>
            <option value="proses">
              Proses ({orders.filter(o => o.status_order === 'proses').length})
            </option>
            <option value="validasi">
              Validasi (
              {orders.filter(o => o.status_order === 'validasi').length})
            </option>
            <option value="selesai">
              Selesai ({orders.filter(o => o.status_order === 'selesai').length}
              )
            </option>
            <option value="dibatalkan">
              Dibatalkan (
              {orders.filter(o => o.status_order === 'dibatalkan').length})
            </option>
          </select>

          <select
            className="filter-select"
            value={filterPayment}
            onChange={e => setFilterPayment(e.target.value)}
          >
            <option value="all">Semua Pembayaran</option>
            <option value="pending">
              Belum Bayar (
              {
                orders.filter(
                  o => getStatusPembayaran(o.status_order) === 'pending',
                ).length
              }
              )
            </option>
            <option value="lunas">
              Lunas (
              {
                orders.filter(
                  o => getStatusPembayaran(o.status_order) === 'lunas',
                ).length
              }
              )
            </option>
            <option value="gagal">
              Gagal (
              {
                orders.filter(
                  o => getStatusPembayaran(o.status_order) === 'gagal',
                ).length
              }
              )
            </option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Memuat data pesanan...</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID Order</th>
                <th>Customer</th>
                <th>Tanggal</th>
                <th>Total</th>
                <th>Status Order</th>
                <th>Pembayaran</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center">
                    {error ? (
                      <div style={{ padding: '20px' }}>
                        <p>Tidak dapat memuat data. Silakan coba lagi.</p>
                      </div>
                    ) : searchTerm ||
                      filterStatus !== 'all' ||
                      filterPayment !== 'all' ? (
                      'Tidak ada pesanan yang sesuai filter'
                    ) : orders.length === 0 ? (
                      <div style={{ padding: '40px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                          📦
                        </div>
                        <p style={{ fontSize: '18px', color: '#666' }}>
                          Belum ada pesanan masuk
                        </p>
                      </div>
                    ) : (
                      'Tidak ada data'
                    )}
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id_order}>
                    <td>
                      <strong className="order-id">#{order.id_order}</strong>
                    </td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-name">
                          {order.nama_customer}
                        </div>
                        <div className="customer-contact">
                          {order.email_customer}
                        </div>
                      </div>
                    </td>
                    <td className="text-nowrap">
                      {formatDate(order.tanggal_order)}
                    </td>
                    <td className="text-right">
                      <strong>{formatRupiah(order.total_harga)}</strong>
                    </td>
                    <td>{getStatusBadge(order.status_order)}</td>
                    {/* ✅ FIXED: Pakai getPaymentBadge dengan status_order */}
                    <td>{getPaymentBadge(order.status_order)}</td>
                    <td>
                      <button
                        className="btn-detail"
                        onClick={() => handleViewDetail(order)}
                        title="Lihat Detail"
                      >
                        👁️ Detail
                      </button>
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
          Total: <strong>{filteredOrders.length}</strong> pesanan
          {(searchTerm || filterStatus !== 'all' || filterPayment !== 'all') &&
            ` (dari ${orders.length} total)`}
        </div>
      )}

      {/* Order Detail Modal */}
      {showDetail && selectedOrder && (
        <OrderDetail
          orderId={selectedOrder.id_order}
          onClose={success => {
            setShowDetail(false);
            setSelectedOrder(null);
            if (success) fetchOrders();
          }}
        />
      )}
    </div>
  );
};

export default OrdersList;
