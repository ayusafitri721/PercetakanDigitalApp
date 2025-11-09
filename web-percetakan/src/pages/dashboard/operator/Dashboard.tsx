// FINAL VERSION - Operator Dashboard
// Tanpa debug panel, download langsung ke folder

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const API_BASE_URL = 'http://localhost/api-percetakan/api';

interface DesignFile {
  id_file: string;
  nama_file: string;
  file_url: string;
  ukuran_file: number;
  tipe_file: string;
  tanggal_upload: string;
}

interface OrderItem {
  id_item: string;
  nama_produk: string;
  jumlah: number;
  ukuran: string;
  catatan_item: string;
  harga_satuan?: number;
  file_desain?: string;
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
  file_design?: string;
  catatan?: string;
  items: OrderItem[];
  design_files?: DesignFile[];
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
            (o.status_pembayaran &&
              ['dibayar', 'diterima', 'lunas', 'confirmed'].includes(
                o.status_pembayaran.toLowerCase(),
              )) ||
            ['dikonfirmasi', 'proses', 'diproses', 'dikerjakan'].includes(
              o.status_order,
            ) ||
            (o.jenis_order === 'offline' && o.status_order !== 'pending');

          const notFinished = ![
            'siap_diambil',
            'selesai',
            'dibatalkan',
          ].includes(o.status_order);

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
      o =>
        ['siap_diambil', 'selesai'].includes(o.status_order) &&
        o.tanggal_order.startsWith(today),
    ).length;

    setStats({ todayQueue, inProgress, todayCompleted, expressQueue });
  };

  const handleViewDetail = async (order: Order) => {
    try {
      const orderResponse = await axios.get(`${API_BASE_URL}/orders.php`, {
        params: { op: 'detail', id: order.id_order },
        headers: { Accept: 'application/json' },
      });

      if (orderResponse.data.status !== 'success') {
        throw new Error('Gagal ambil detail order');
      }

      let orderDetail = orderResponse.data.data;

      try {
        const filesResponse = await axios.get(
          `${API_BASE_URL}/design_files.php`,
          {
            params: { op: 'by_order', id_order: order.id_order },
            headers: { Accept: 'application/json' },
          },
        );

        if (filesResponse.data.status === 'success') {
          orderDetail.design_files = filesResponse.data.data?.files || [];
        }
      } catch (fileError) {
        console.warn('Tidak ada file design:', fileError);
        orderDetail.design_files = [];
      }

      setSelectedOrder(orderDetail);
      setShowDetail(true);
    } catch (error: any) {
      console.error('Error fetching detail:', error);
      alert('Gagal memuat detail pesanan');
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const statusLabel: { [key: string]: string } = {
      proses: 'MULAI CETAK',
      siap_diambil: 'SELESAI DIKERJAKAN',
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
        if (newStatus === 'siap_diambil') {
          alert(
            '✅ Pesanan selesai dikerjakan!\n📦 Pesanan sudah dikirim ke kasir untuk diserahkan ke customer.',
          );
        } else {
          alert('✅ Status berhasil diupdate!');
        }
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
      pending: { label: '⏳ Menunggu', color: '#ffc107' },
      dikonfirmasi: { label: '✅ Siap Dikerjakan', color: '#17a2b8' },
      proses: { label: '🖨️ Sedang Diproses', color: '#007bff' },
      diproses: { label: '🖨️ Sedang Diproses', color: '#007bff' },
      dikerjakan: { label: '🖨️ Sedang Diproses', color: '#007bff' },
    };
    const info = map[status] || { label: status, color: '#6c757d' };
    return (
      <span className="status-badge" style={{ backgroundColor: info.color }}>
        {info.label}
      </span>
    );
  };

  // ✅ FIXED: Download via PHP script
  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    try {
      // Use PHP download script
      const downloadUrl = `${API_BASE_URL}/download_file.php?file=${encodeURIComponent(
        fileUrl,
      )}`;

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('Download triggered:', fileName);
    } catch (error) {
      console.error('Download error:', error);
      alert('Gagal download file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
                              handleUpdateStatus(order.id_order, 'siap_diambil')
                            }
                            disabled={updating}
                            className="btn-complete"
                          >
                            ✅ Selesai Dikerjakan
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
              {selectedOrder.design_files &&
                selectedOrder.design_files.length > 0 && (
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
                      📁 File Design Customer (
                      {selectedOrder.design_files.length})
                    </h3>

                    {selectedOrder.design_files.map((file, idx) => (
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
                            onClick={() =>
                              handleDownloadFile(file.file_url, file.nama_file)
                            }
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
                )}

              {(!selectedOrder.design_files ||
                selectedOrder.design_files.length === 0) && (
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
              )}

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
                    <label>Jenis Order:</label>
                    <span style={{ fontWeight: 'bold' }}>
                      {selectedOrder.jenis_order === 'offline'
                        ? '🏪 Offline'
                        : '🌐 Online'}
                    </span>
                  </div>
                  <div>
                    <label>Kecepatan:</label>
                    <span
                      style={{
                        fontWeight: 'bold',
                        color:
                          selectedOrder.kecepatan_pengerjaan === 'express'
                            ? '#dc2626'
                            : '#16a34a',
                      }}
                    >
                      {selectedOrder.kecepatan_pengerjaan === 'express'
                        ? '⚡ EXPRESS'
                        : '🕐 NORMAL'}
                    </span>
                  </div>
                  <div>
                    <label>Total Harga:</label>
                    <span
                      style={{
                        fontWeight: 'bold',
                        color: '#667eea',
                        fontSize: '1.125rem',
                      }}
                    >
                      {formatRupiah(selectedOrder.total_harga)}
                    </span>
                  </div>
                </div>

                {selectedOrder.catatan && (
                  <div
                    style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      background: '#fff3cd',
                      borderRadius: '6px',
                      border: '1px solid #ffc107',
                    }}
                  >
                    <strong style={{ color: '#856404' }}>💬 Catatan:</strong>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#856404' }}>
                      {selectedOrder.catatan}
                    </p>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h3>📦 Item Pesanan</h3>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="items-list">
                    {selectedOrder.items.map((item, index) => (
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
                            <strong>
                              {formatRupiah(item.harga_satuan)} / pcs
                            </strong>
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
                      handleUpdateStatus(selectedOrder.id_order, 'siap_diambil')
                    }
                    disabled={updating}
                    className="btn-complete btn-block"
                  >
                    ✅ Selesai Dikerjakan
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
