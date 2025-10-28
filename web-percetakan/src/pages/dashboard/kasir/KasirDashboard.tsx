import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CreateOrderKasir from './CreateOrderKasir';
import './kasir.css';

const API_BASE_URL = 'http://localhost/api-percetakan/api';

// ✅ FIXED INTERFACE - Match dengan orders.php response
interface Order {
  id_order: string;
  kode_order: string;
  nama_customer: string; // ✅ Konsisten dengan backend
  email_customer?: string;
  telepon_customer?: string;
  total_harga: number;
  status_order: string;
  status_pembayaran?: string;
  jenis_order?: string;
  tanggal_order: string;
}

const KasirDashboard: React.FC = () => {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month'>(
    'today',
  );
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    pendingPayment: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrdersByPeriod();
  }, [filterPeriod, allOrders]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/orders.php`);

      if (response.data.status === 'success') {
        const orders = response.data.data?.orders || [];
        console.log('Orders fetched:', orders);
        setAllOrders(orders);
        calculateStats(orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrdersByPeriod = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const startOfWeek = new Date(now);
    startOfWeek.setDate(
      now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1),
    );
    const weekStart = startOfWeek.toISOString().split('T')[0];

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStart = startOfMonth.toISOString().split('T')[0];

    let filtered: Order[] = [];

    if (filterPeriod === 'today') {
      filtered = allOrders.filter(order =>
        order.tanggal_order.startsWith(today),
      );
    } else if (filterPeriod === 'week') {
      filtered = allOrders.filter(order => order.tanggal_order >= weekStart);
    } else if (filterPeriod === 'month') {
      filtered = allOrders.filter(order => order.tanggal_order >= monthStart);
    }

    setFilteredOrders(filtered);
  };

  const calculateStats = (orders: Order[]) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const startOfWeek = new Date(now);
    startOfWeek.setDate(
      now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1),
    );
    const weekStart = startOfWeek.toISOString().split('T')[0];

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStart = startOfMonth.toISOString().split('T')[0];

    // Today stats
    const todayOrders = orders.filter(o => o.tanggal_order.startsWith(today));
    const todayOrdersCount = todayOrders.length;
    const todayRevenue = todayOrders
      .filter(
        o =>
          o.status_pembayaran === 'dibayar' ||
          ['dibayar', 'proses', 'selesai'].includes(o.status_order),
      )
      .reduce((sum, o) => sum + parseFloat(o.total_harga.toString()), 0);

    // Week stats
    const weekOrders = orders.filter(o => o.tanggal_order >= weekStart);
    const weekRevenue = weekOrders
      .filter(
        o =>
          o.status_pembayaran === 'dibayar' ||
          ['dibayar', 'proses', 'selesai'].includes(o.status_order),
      )
      .reduce((sum, o) => sum + parseFloat(o.total_harga.toString()), 0);

    // Month stats
    const monthOrders = orders.filter(o => o.tanggal_order >= monthStart);
    const monthRevenue = monthOrders
      .filter(
        o =>
          o.status_pembayaran === 'dibayar' ||
          ['dibayar', 'proses', 'selesai'].includes(o.status_order),
      )
      .reduce((sum, o) => sum + parseFloat(o.total_harga.toString()), 0);

    // Pending payment - cek status_pembayaran dulu, fallback ke status_order
    const pendingPayment = orders.filter(
      o =>
        o.status_pembayaran === 'pending' ||
        (o.status_order === 'pending' && !o.status_pembayaran),
    ).length;

    setStats({
      todayOrders: todayOrdersCount,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      pendingPayment,
    });
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
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split('T')[0];

    if (dateString.startsWith(today)) {
      return (
        'Hari ini, ' +
        date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      );
    } else if (dateString.startsWith(yesterday)) {
      return (
        'Kemarin, ' +
        date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      );
    } else {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: '#ffc107',
      dikonfirmasi: '#17a2b8',
      proses: '#007bff',
      selesai: '#28a745',
      dibatalkan: '#dc3545',
      dibayar: '#28a745',
    };
    return colors[status] || '#6c757d';
  };

  const getStatusPembayaran = (order: Order) => {
    // Cek status_pembayaran dulu (prioritas)
    if (order.status_pembayaran) {
      return order.status_pembayaran === 'dibayar' ? 'Lunas' : 'Pending';
    }
    // Fallback ke status_order (untuk data lama)
    if (['dibayar', 'proses', 'selesai'].includes(order.status_order)) {
      return 'Lunas';
    }
    return 'Pending';
  };

  const getStatusPembayaranColor = (order: Order) => {
    const status = getStatusPembayaran(order);
    return status === 'Lunas' ? '#28a745' : '#ffc107';
  };

  const handlePrintInvoice = (order: Order) => {
    window.open(`/invoice/${order.id_order}`, '_blank');
  };

  return (
    <div className="kasir-container">
      {/* Header Stats */}
      <div className="kasir-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#667eea' }}>
            📋
          </div>
          <div className="stat-info">
            <h3>Pesanan Hari Ini</h3>
            <p className="stat-number">{stats.todayOrders}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#43e97b' }}>
            💰
          </div>
          <div className="stat-info">
            <h3>Pendapatan Hari Ini</h3>
            <p className="stat-number">{formatRupiah(stats.todayRevenue)}</p>
            <small
              style={{
                fontSize: '0.75rem',
                color: '#718096',
                marginTop: '0.25rem',
                display: 'block',
              }}
            >
              Minggu: {formatRupiah(stats.weekRevenue)} • Bulan:{' '}
              {formatRupiah(stats.monthRevenue)}
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fa709a' }}>
            ⏳
          </div>
          <div className="stat-info">
            <h3>Menunggu Pembayaran</h3>
            <p className="stat-number">{stats.pendingPayment}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="kasir-actions">
        <button
          className="btn-primary btn-large"
          onClick={() => setShowCreateOrder(true)}
        >
          <span className="btn-icon">➕</span>
          Buat Pesanan Baru
        </button>
      </div>

      {/* Orders Table with Filter */}
      <div className="kasir-orders">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <h2>Riwayat Pesanan</h2>

          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setFilterPeriod('today')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border:
                  filterPeriod === 'today'
                    ? '2px solid #667eea'
                    : '1px solid #ddd',
                background: filterPeriod === 'today' ? '#667eea' : 'white',
                color: filterPeriod === 'today' ? 'white' : '#333',
                cursor: 'pointer',
                fontWeight: filterPeriod === 'today' ? '600' : '400',
                fontSize: '0.875rem',
              }}
            >
              📅 Hari Ini
            </button>
            <button
              onClick={() => setFilterPeriod('week')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border:
                  filterPeriod === 'week'
                    ? '2px solid #667eea'
                    : '1px solid #ddd',
                background: filterPeriod === 'week' ? '#667eea' : 'white',
                color: filterPeriod === 'week' ? 'white' : '#333',
                cursor: 'pointer',
                fontWeight: filterPeriod === 'week' ? '600' : '400',
                fontSize: '0.875rem',
              }}
            >
              📊 Minggu Ini
            </button>
            <button
              onClick={() => setFilterPeriod('month')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border:
                  filterPeriod === 'month'
                    ? '2px solid #667eea'
                    : '1px solid #ddd',
                background: filterPeriod === 'month' ? '#667eea' : 'white',
                color: filterPeriod === 'month' ? 'white' : '#333',
                cursor: 'pointer',
                fontWeight: filterPeriod === 'month' ? '600' : '400',
                fontSize: '0.875rem',
              }}
            >
              📈 Bulan Ini
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">⏳ Memuat data...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada pesanan di periode ini</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Kode Order</th>
                  <th>Pelanggan</th>
                  <th>Total</th>
                  <th>Status Pesanan</th>
                  <th>Status Bayar</th>
                  <th>Waktu</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id_order}>
                    <td>
                      <strong>{order.kode_order}</strong>
                    </td>
                    <td>{order.nama_customer}</td>
                    <td className="text-right">
                      <strong>{formatRupiah(order.total_harga)}</strong>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: getStatusColor(order.status_order),
                        }}
                      >
                        {order.status_order}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{ background: getStatusPembayaranColor(order) }}
                      >
                        {getStatusPembayaran(order)}
                      </span>
                    </td>
                    <td>{formatDate(order.tanggal_order)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-print"
                          onClick={() => handlePrintInvoice(order)}
                          title="Cetak Invoice"
                        >
                          🖨️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        {filteredOrders.length > 0 && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <strong>Total {filteredOrders.length} pesanan</strong>
            {filterPeriod === 'today' && ' hari ini'}
            {filterPeriod === 'week' && ' minggu ini'}
            {filterPeriod === 'month' && ' bulan ini'}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateOrder && (
        <CreateOrderKasir
          onClose={success => {
            setShowCreateOrder(false);
            if (success) fetchOrders();
          }}
        />
      )}
    </div>
  );
};

export default KasirDashboard;
