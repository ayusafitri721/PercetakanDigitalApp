// FINAL VERSION - Operator Dashboard dengan Upload ke result_files
// File hasil operator masuk ke tabel result_files (bukan design_files)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

import { API_BASE_URL } from '../../../config';

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
  const [uploadingResult, setUploadingResult] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [orderToComplete, setOrderToComplete] = useState<string | null>(null);
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
            ['dibayar', 'diproses', 'validasi', 'cetak'].includes(
              o.status_order,
            ) ||
            (o.jenis_order === 'offline' && o.status_order !== 'pending');

          const notFinished = !['selesai', 'dikirim', 'dibatalkan'].includes(
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

    const inProgress = queue.filter(o =>
      ['diproses', 'cetak'].includes(o.status_order),
    ).length;

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

  const handleStartComplete = (orderId: string) => {
    setOrderToComplete(orderId);
    setShowUploadModal(true);
  };

  const handleFileResultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert('Ukuran file maksimal 20MB!');
        return;
      }

      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/pdf',
      ];
      if (!allowedTypes.includes(file.type)) {
        alert('Format file harus JPG, PNG, atau PDF!');
        return;
      }

      setResultFile(file);
    }
  };

  const handleUploadResultAndComplete = async () => {
    if (!resultFile) {
      alert('⚠️ Silakan upload file hasil terlebih dahulu!');
      return;
    }

    if (!orderToComplete) return;

    setUploadingResult(true);
    try {
      // 📤 Step 1: Upload file ke server terlebih dahulu
      const uploadFormData = new FormData();
      uploadFormData.append('file', resultFile);
      uploadFormData.append('folder', 'result_files');

      console.log('Step 1: Uploading file to server...', {
        fileName: resultFile.name,
        fileSize: resultFile.size,
        fileType: resultFile.type,
      });

      const fileUploadResponse = await axios.post(
        `${API_BASE_URL}/upload_file.php`,
        uploadFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        },
      );

      console.log('File upload response:', fileUploadResponse.data);

      if (fileUploadResponse.data.status !== 'success') {
        throw new Error(
          fileUploadResponse.data.message || 'Gagal upload file ke server',
        );
      }

      const uploadedFileUrl = fileUploadResponse.data.data.file_url;
      const uploadedFileName = fileUploadResponse.data.data.file_name;
      const fileSize = resultFile.size;
      const fileType = resultFile.type;

      console.log('File uploaded successfully:', uploadedFileUrl);

      // 🎯 Step 2: Simpan ke database result_files
      const resultFormData = new FormData();
      resultFormData.append('id_order', orderToComplete);
      resultFormData.append('nama_file', uploadedFileName);
      resultFormData.append('file_url', uploadedFileUrl);
      resultFormData.append('ukuran_file', fileSize.toString());
      resultFormData.append('tipe_file', fileType);
      resultFormData.append('keterangan', 'File hasil cetakan dari operator');

      console.log('Step 2: Creating result_files record...', {
        id_order: orderToComplete,
        nama_file: uploadedFileName,
        file_url: uploadedFileUrl,
      });

      const createResponse = await axios.post(
        `${API_BASE_URL}/result_files.php?op=create`,
        resultFormData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
        },
      );

      console.log('Create result_files response:', createResponse.data);

      if (createResponse.data.status !== 'success') {
        throw new Error(
          createResponse.data.message || 'Gagal menyimpan file hasil',
        );
      }

      // ✅ Update status ke "selesai"
      const statusFormData = new FormData();
      statusFormData.append('status_order', 'selesai');

      const statusResponse = await axios.post(
        `${API_BASE_URL}/orders.php?op=update&id=${orderToComplete}`,
        statusFormData,
        { headers: { Accept: 'application/json' } },
      );

      if (statusResponse.data.status === 'success') {
        alert(
          `✅ PESANAN SELESAI!\n\n📁 File hasil: ${resultFile.name}\n📦 Status: Selesai\n🎯 Pesanan sudah dikirim ke KASIR untuk diserahkan ke customer.\n\n✨ File hasil sudah tersimpan dan bisa di-download oleh kasir!`,
        );

        setShowUploadModal(false);
        setResultFile(null);
        setOrderToComplete(null);
        fetchQueue();
        if (showDetail) setShowDetail(false);
      } else {
        throw new Error('Gagal update status order');
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert(
        '❌ Gagal menyimpan hasil: ' +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setUploadingResult(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const statusMap: { [key: string]: { db: string; label: string } } = {
      start: { db: 'diproses', label: 'MULAI CETAK' },
      complete: { db: 'selesai', label: 'SELESAI DIKERJAKAN' },
    };

    const statusInfo = statusMap[newStatus];
    if (!statusInfo) return;

    if (!confirm(`Ubah status pesanan menjadi "${statusInfo.label}"?`)) return;

    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('status_order', statusInfo.db);

      const response = await axios.post(
        `${API_BASE_URL}/orders.php?op=update&id=${orderId}`,
        formData,
        { headers: { Accept: 'application/json' } },
      );

      if (response.data.status === 'success') {
        if (newStatus === 'complete') {
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
      dibayar: { label: '✅ Siap Dikerjakan', color: '#17a2b8' },
      validasi: { label: '✅ Siap Dikerjakan', color: '#17a2b8' },
      diproses: { label: '🖨️ Sedang Diproses', color: '#007bff' },
      cetak: { label: '🖨️ Sedang Dicetak', color: '#007bff' },
      selesai: { label: '✅ SELESAI', color: '#28a745' },
      dikirim: { label: '🚚 Dikirim', color: '#6c757d' },
      dibatalkan: { label: '❌ Dibatalkan', color: '#dc3545' },
    };
    const info = map[status] || { label: status, color: '#6c757d' };
    return (
      <span
        className="status-badge"
        style={{ backgroundColor: info.color, fontWeight: '700' }}
      >
        {info.label}
      </span>
    );
  };

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    try {
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
            <div className="empty-icon" style={{ fontSize: '4rem' }}>
              ✅
            </div>
            <h3 style={{ color: '#28a745' }}>Tidak Ada Pesanan di Queue</h3>
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

                        {['pending', 'dibayar', 'validasi'].includes(
                          order.status_order,
                        ) && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(order.id_order, 'start')
                            }
                            disabled={updating}
                            className="btn-start"
                          >
                            🔄 Mulai Cetak
                          </button>
                        )}

                        {['diproses', 'cetak'].includes(order.status_order) && (
                          <button
                            onClick={() => handleStartComplete(order.id_order)}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
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
                {['pending', 'dibayar', 'validasi'].includes(
                  selectedOrder.status_order,
                ) && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedOrder.id_order, 'start')
                    }
                    disabled={updating}
                    className="btn-start btn-block"
                  >
                    🔄 Mulai Cetak
                  </button>
                )}

                {['diproses', 'cetak'].includes(selectedOrder.status_order) && (
                  <button
                    onClick={() => handleStartComplete(selectedOrder.id_order)}
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

      {/* Modal Upload File Hasil */}
      {showUploadModal && (
        <div
          className="modal-overlay"
          onClick={() => !uploadingResult && setShowUploadModal(false)}
        >
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
                onClick={() => setShowUploadModal(false)}
                className="modal-close"
                disabled={uploadingResult}
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
                  border: resultFile
                    ? '2px solid #28a745'
                    : '2px dashed #667eea',
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
                  onChange={handleFileResultChange}
                  disabled={uploadingResult}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    background: 'white',
                    cursor: uploadingResult ? 'not-allowed' : 'pointer',
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
                      <div style={{ fontSize: '1.5rem', color: '#28a745' }}>
                        ✅
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div
                style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}
              >
                <button
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploadingResult}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    background: 'white',
                    cursor: uploadingResult ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleUploadResultAndComplete}
                  disabled={!resultFile || uploadingResult}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    background:
                      !resultFile || uploadingResult ? '#ccc' : '#28a745',
                    color: 'white',
                    cursor:
                      !resultFile || uploadingResult
                        ? 'not-allowed'
                        : 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem',
                  }}
                >
                  {uploadingResult
                    ? '⏳ Mengupload...'
                    : '✅ Upload & Selesaikan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorDashboard;
