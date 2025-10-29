import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const API_BASE_URL = 'http://localhost/api-percetakan/api';

interface OrderItem {
  id_item: string;
  nama_produk: string;
  jumlah: number;
  ukuran: string;
  catatan_item: string;
}

interface Order {
  id_order: string;
  kode_order: string;
  nama_customer: string;
  email_customer: string;
  telepon_customer: string;
  total_harga: number;
  status_order: string;
  status_pembayaran: string;
  tanggal_order: string;
  jenis_order: string;
  kecepatan_pengerjaan: string;
  items: OrderItem[];
}

const OperatorDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({
    todayQueue: 0,
    inProgress: 0,
    todayCompleted: 0,
    expressQueue: 0,
  });

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/orders.php`, {
        headers: { Accept: 'application/json' },
      });

      if (response.data.status === 'success') {
        const allOrders = response.data.data.orders || [];

        const queue = allOrders.filter((o: Order) => {
          const isPaid =
            o.status_pembayaran === 'dibayar' ||
            ['dibayar', 'proses', 'dikonfirmasi'].includes(o.status_order);
          const notFinished = !['selesai', 'dibatalkan'].includes(
            o.status_order,
          );
          return isPaid && notFinished;
        });

        queue.sort((a: Order, b: Order) => {
          if (
            a.kecepatan_pengerjaan === 'express' &&
            b.kecepatan_pengerjaan !== 'express'
          )
            return -1;
          if (
            a.kecepatan_pengerjaan !== 'express' &&
            b.kecepatan_pengerjaan === 'express'
          )
            return 1;
          return (
            new Date(a.tanggal_order).getTime() -
            new Date(b.tanggal_order).getTime()
          );
        });

        setOrders(queue);
        calculateStats(queue, allOrders);
      }
    } catch (error) {
      console.error('Fetch queue error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (queue: Order[], allOrders: Order[]) => {
    const today = new Date().toISOString().split('T')[0];

    const todayQueue = queue.filter(o =>
      o.tanggal_order.startsWith(today),
    ).length;
    const inProgress = queue.filter(o => o.status_order === 'proses').length;
    const expressQueue = queue.filter(
      o => o.kecepatan_pengerjaan === 'express',
    ).length;

    const todayCompleted = allOrders.filter(
      o => o.status_order === 'selesai' && o.tanggal_order.startsWith(today),
    ).length;

    setStats({ todayQueue, inProgress, todayCompleted, expressQueue });
  };

  const handleViewDetail = async (order: Order) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders.php`, {
        params: { op: 'detail', id: order.id_order },
        headers: { Accept: 'application/json' },
      });

      if (response.data.status === 'success') {
        setSelectedOrder(response.data.data);
        setShowDetail(true);
      }
    } catch (error) {
      console.error('Error fetching detail:', error);
      alert('Gagal memuat detail pesanan');
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const statusLabel: { [key: string]: string } = {
      proses: 'PROSES (Mulai Cetak)',
      selesai: 'SELESAI',
    };

    if (!confirm(`Ubah status pesanan menjadi "${statusLabel[newStatus]}"?`))
      return;

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
        fetchQueue();
        if (showDetail) setShowDetail(false);
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
    const date = new Date(dateString);
    const today = new Date().toISOString().split('T')[0];

    if (dateString.startsWith(today)) {
      return (
        'Hari ini, ' +
        date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      );
    }
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const map: { [key: string]: { label: string; color: string } } = {
      pending: { label: '⏳ Waiting', color: '#ffc107' },
      dikonfirmasi: { label: '✅ Ready', color: '#17a2b8' },
      proses: { label: '🖨️ Printing', color: '#007bff' },
    };
    const info = map[status] || { label: status, color: '#6c757d' };
    return (
      <span className="status-badge" style={{ backgroundColor: info.color }}>
        {info.label}
      </span>
    );
  };

  return (
    <div className="operator-container">
      <div className="operator-header">
        <div>
          <h1>🖨️ Operator Dashboard</h1>
          <p>Queue pesanan yang siap untuk dicetak</p>
        </div>
        <button onClick={fetchQueue} disabled={loading} className="btn-refresh">
          {loading ? '⏳ Loading...' : '🔄 Refresh'}
        </button>
      </div>

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

      <div className="queue-section">
        <div className="queue-header">
          <div>
            <h2>Queue Pesanan</h2>
            <p>
              {orders.length} pesanan siap dicetak • Auto-refresh setiap 30
              detik
            </p>
          </div>
        </div>

        {loading && orders.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Memuat queue...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>Tidak Ada Pesanan</h3>
            <p>Semua pesanan sudah selesai dicetak!</p>
          </div>
        ) : (
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
                {orders.map((order, index) => (
                  <tr
                    key={order.id_order}
                    className={
                      order.kecepatan_pengerjaan === 'express'
                        ? 'express-row'
                        : ''
                    }
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
                        <div className="customer-name">
                          {order.nama_customer}
                        </div>
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
                    <td>{getStatusBadge(order.status_order)}</td>
                    <td>{formatDate(order.tanggal_order)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleViewDetail(order)}
                          className="btn-detail"
                        >
                          👁️ Detail
                        </button>

                        {(order.status_order === 'pending' ||
                          order.status_order === 'dikonfirmasi') && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(order.id_order, 'proses')
                            }
                            disabled={updating}
                            className="btn-start"
                          >
                            🔄 Mulai Cetak
                          </button>
                        )}

                        {order.status_order === 'proses' && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(order.id_order, 'selesai')
                            }
                            disabled={updating}
                            className="btn-complete"
                          >
                            ✅ Selesai
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showDetail && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Detail Pesanan</h2>
                <p>
                  <strong>{selectedOrder.kode_order}</strong>
                  {selectedOrder.kecepatan_pengerjaan === 'express' && (
                    <span className="express-tag">⚡ EXPRESS</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="modal-close"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>👤 Customer</h3>
                <div className="detail-grid">
                  <div>
                    <label>Nama:</label>
                    <span>{selectedOrder.nama_customer}</span>
                  </div>
                  <div>
                    <label>Email:</label>
                    <span>{selectedOrder.email_customer || '-'}</span>
                  </div>
                  {selectedOrder.telepon_customer && (
                    <div>
                      <label>Telepon:</label>
                      <span>{selectedOrder.telepon_customer}</span>
                    </div>
                  )}
                  <div>
                    <label>Total Harga:</label>
                    <span style={{ fontWeight: 'bold', color: '#667eea' }}>
                      {formatRupiah(selectedOrder.total_harga)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>📦 Item Pesanan</h3>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="items-list">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="item-card">
                        <div className="item-header">
                          <strong>{item.nama_produk}</strong>
                          <span>× {item.jumlah}</span>
                        </div>
                        {item.ukuran && (
                          <div className="item-detail">
                            📐 Ukuran: {item.ukuran}
                          </div>
                        )}
                        {item.catatan_item && (
                          <div className="item-detail">
                            💬 {item.catatan_item}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-items">Tidak ada item</p>
                )}
              </div>

              <div className="modal-actions">
                {(selectedOrder.status_order === 'pending' ||
                  selectedOrder.status_order === 'dikonfirmasi') && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedOrder.id_order, 'proses')
                    }
                    disabled={updating}
                    className="btn-start btn-block"
                  >
                    🔄 Mulai Cetak
                  </button>
                )}

                {selectedOrder.status_order === 'proses' && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedOrder.id_order, 'selesai')
                    }
                    disabled={updating}
                    className="btn-complete btn-block"
                  >
                    ✅ Tandai Selesai
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorDashboard;
