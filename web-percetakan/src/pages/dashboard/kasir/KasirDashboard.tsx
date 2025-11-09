// COMPLETE FIXED VERSION - Kasir Dashboard dengan File Hasil dari result_files
// File hasil operator diambil dari tabel result_files (bukan design_files)

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CreateOrderKasir from './CreateOrderKasir';
import './kasir.css';

const API_BASE_URL = 'http://localhost/api-percetakan/api';

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

const KasirDashboard: React.FC = () => {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month'>(
    'today',
  );
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    pendingPayment: 0,
    completedToday: 0,
  });

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
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
        setAllOrders(orders);
        calculateStats(orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateOnly = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const filterOrdersByPeriod = () => {
    const now = new Date();
    const todayDate = getDateOnly(now.toISOString());
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(now.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    const weekStartDate = getDateOnly(startOfWeek.toISOString());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStartDate = getDateOnly(startOfMonth.toISOString());

    let filtered: Order[] = [];
    if (filterPeriod === 'today') {
      filtered = allOrders.filter(
        order => getDateOnly(order.tanggal_order) === todayDate,
      );
    } else if (filterPeriod === 'week') {
      filtered = allOrders.filter(
        order => getDateOnly(order.tanggal_order) >= weekStartDate,
      );
    } else if (filterPeriod === 'month') {
      filtered = allOrders.filter(
        order => getDateOnly(order.tanggal_order) >= monthStartDate,
      );
    }
    setFilteredOrders(filtered);
  };

  const calculateStats = (orders: Order[]) => {
    const now = new Date();
    const todayDate = getDateOnly(now.toISOString());
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(now.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    const weekStartDate = getDateOnly(startOfWeek.toISOString());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStartDate = getDateOnly(startOfMonth.toISOString());

    const todayOrders = orders.filter(
      o => getDateOnly(o.tanggal_order) === todayDate,
    );
    const isOrderPaid = (o: Order) => {
      if (o.jenis_order === 'offline') return true;
      if (o.status_pembayaran) {
        const paidStatuses = [
          'dibayar',
          'diterima',
          'lunas',
          'confirmed',
          'paid',
        ];
        return paidStatuses.includes(o.status_pembayaran.toLowerCase());
      }
      return [
        'dibayar',
        'diproses',
        'validasi',
        'cetak',
        'selesai',
        'dikirim',
      ].includes(o.status_order);
    };

    const todayRevenue = todayOrders
      .filter(isOrderPaid)
      .reduce((sum, o) => sum + parseFloat(o.total_harga.toString()), 0);
    const weekOrders = orders.filter(
      o => getDateOnly(o.tanggal_order) >= weekStartDate,
    );
    const weekRevenue = weekOrders
      .filter(isOrderPaid)
      .reduce((sum, o) => sum + parseFloat(o.total_harga.toString()), 0);
    const monthOrders = orders.filter(
      o => getDateOnly(o.tanggal_order) >= monthStartDate,
    );
    const monthRevenue = monthOrders
      .filter(isOrderPaid)
      .reduce((sum, o) => sum + parseFloat(o.total_harga.toString()), 0);
    const pendingPayment = orders.filter(o => {
      if (o.status_pembayaran)
        return o.status_pembayaran.toLowerCase() === 'pending';
      return o.status_order === 'pending';
    }).length;
    const completedToday = orders.filter(
      o =>
        o.status_order === 'selesai' &&
        o.tanggal_selesai &&
        getDateOnly(o.tanggal_selesai) === todayDate,
    ).length;

    setStats({
      todayOrders: todayOrders.length,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      pendingPayment,
      completedToday,
    });
  };

  const handleViewDetail = async (order: Order) => {
    try {
      const orderResponse = await axios.get(`${API_BASE_URL}/orders.php`, {
        params: { op: 'detail', id: order.id_order },
        headers: { Accept: 'application/json' },
      });
      if (orderResponse.data.status !== 'success')
        throw new Error('Gagal ambil detail order');
      let orderDetail = orderResponse.data.data;

      // 🎯 Fetch design files (file awal dari customer)
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
        orderDetail.design_files = [];
      }

      // 🎯 Fetch result files (file hasil dari operator)
      try {
        const resultResponse = await axios.get(
          `${API_BASE_URL}/result_files.php`,
          {
            params: { op: 'by_order', id_order: order.id_order },
            headers: { Accept: 'application/json' },
          },
        );
        if (resultResponse.data.status === 'success') {
          orderDetail.result_files = resultResponse.data.data?.files || [];
        }
      } catch (resultError) {
        orderDetail.result_files = [];
      }

      setSelectedOrder(orderDetail);
      setShowDetailModal(true);
    } catch (error: any) {
      alert('Gagal memuat detail pesanan');
    }
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
    } catch (error) {
      alert('Gagal download file');
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
    const now = new Date();
    const todayDate = getDateOnly(now.toISOString());
    const yesterdayDate = getDateOnly(
      new Date(Date.now() - 86400000).toISOString(),
    );
    const orderDate = getDateOnly(dateString);

    if (orderDate === todayDate) {
      return (
        'Hari ini, ' +
        date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      );
    } else if (orderDate === yesterdayDate) {
      return (
        'Kemarin, ' +
        date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      );
    }
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: '⏳ Pending',
      dibayar: '💳 Dibayar',
      diproses: '🔄 Diproses',
      validasi: '✅ Validasi',
      cetak: '🖨️ Cetak',
      selesai: '✔️ Selesai',
      dikirim: '🚚 Dikirim',
      dibatalkan: '❌ Dibatalkan',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: '#ffc107',
      dibayar: '#17a2b8',
      diproses: '#007bff',
      validasi: '#17a2b8',
      cetak: '#007bff',
      selesai: '#28a745',
      dikirim: '#6c757d',
      dibatalkan: '#dc3545',
    };
    return colors[status] || '#6c757d';
  };

  const getStatusPembayaran = (order: Order) => {
    if (order.status_pembayaran) {
      const paidStatuses = ['dibayar', 'diterima', 'lunas', 'confirmed'];
      return paidStatuses.includes(order.status_pembayaran.toLowerCase())
        ? 'Lunas'
        : 'Pending';
    }
    if (
      [
        'dibayar',
        'diproses',
        'validasi',
        'cetak',
        'selesai',
        'dikirim',
      ].includes(order.status_order)
    )
      return 'Lunas';
    return 'Pending';
  };

  const getStatusPembayaranColor = (order: Order) => {
    return getStatusPembayaran(order) === 'Lunas' ? '#28a745' : '#ffc107';
  };

  const handlePrintInvoice = (order: Order) => {
    window.open(`/invoice/${order.id_order}`, '_blank');
  };

  return (
    <div className="kasir-container">
      {/* Stats Cards */}
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
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#28a745' }}>
            ✅
          </div>
          <div className="stat-info">
            <h3>Selesai Hari Ini</h3>
            <p className="stat-number">{stats.completedToday}</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="kasir-actions">
        <button
          className="btn-primary btn-large"
          onClick={() => setShowCreateOrder(true)}
        >
          <span className="btn-icon">➕</span>
          Buat Pesanan Baru
        </button>
      </div>

      {/* Orders Table */}
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
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['today', 'week', 'month'].map(period => (
              <button
                key={period}
                onClick={() => setFilterPeriod(period as any)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border:
                    filterPeriod === period
                      ? '2px solid #667eea'
                      : '1px solid #ddd',
                  background: filterPeriod === period ? '#667eea' : 'white',
                  color: filterPeriod === period ? 'white' : '#333',
                  cursor: 'pointer',
                  fontWeight: filterPeriod === period ? '600' : '400',
                  fontSize: '0.875rem',
                }}
              >
                {period === 'today' && '📅 Hari Ini'}
                {period === 'week' && '📊 Minggu Ini'}
                {period === 'month' && '📈 Bulan Ini'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading">⏳ Memuat data...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada pesanan di periode ini</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Kode Order</th>
                    <th>Pelanggan</th>
                    <th>Jenis</th>
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
                      <td>
                        {order.nama_customer}
                        {order.telepon_customer && (
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>
                            📞 {order.telepon_customer}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            background:
                              order.jenis_order === 'offline'
                                ? '#6c757d'
                                : '#17a2b8',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                          }}
                        >
                          {order.jenis_order === 'offline'
                            ? '🏪 Offline'
                            : '🌐 Online'}
                        </span>
                      </td>
                      <td className="text-right">
                        <strong>{formatRupiah(order.total_harga)}</strong>
                      </td>
                      <td>
                        <span
                          style={{
                            background: getStatusColor(order.status_order),
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            display: 'inline-block',
                          }}
                        >
                          {getStatusLabel(order.status_order)}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            background: getStatusPembayaranColor(order),
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            display: 'inline-block',
                          }}
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
                          >
                            🖨️
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => handleViewDetail(order)}
                            style={{ background: '#007bff' }}
                          >
                            👁️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <strong>Total {filteredOrders.length} pesanan </strong>
              {filterPeriod === 'today' && 'hari ini'}
              {filterPeriod === 'week' && 'minggu ini'}
              {filterPeriod === 'month' && 'bulan ini'}
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div
          onClick={() => setShowDetailModal(false)}
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
                  <strong>{selectedOrder.kode_order}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
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
              {/* 🎯 FILE HASIL OPERATOR - PRIORITAS (dari result_files) */}
              {selectedOrder.result_files &&
                selectedOrder.result_files.length > 0 && (
                  <div
                    style={{
                      background:
                        'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
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
                        📦 Total {selectedOrder.result_files.length} file hasil
                        dari operator
                      </p>
                      {selectedOrder.result_files.map((file, idx) => (
                        <div
                          key={file.id_result}
                          style={{
                            background: '#f8f9fa',
                            padding: '1rem',
                            borderRadius: '6px',
                            marginBottom:
                              idx < selectedOrder.result_files!.length - 1
                                ? '1rem'
                                : '0',
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
                                handleDownloadFile(
                                  file.file_url,
                                  file.nama_file,
                                )
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

              {/* File Design Customer - Referensi (dari design_files) */}
              {selectedOrder.design_files &&
                selectedOrder.design_files.length > 0 && (
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
                    {selectedOrder.design_files.map((file, idx) => (
                      <div
                        key={file.id_file}
                        style={{
                          background: 'white',
                          padding: '1rem',
                          borderRadius: '6px',
                          marginBottom:
                            idx < selectedOrder.design_files!.length - 1
                              ? '1rem'
                              : '0',
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
                              handleDownloadFile(file.file_url, file.nama_file)
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
                    <strong>{selectedOrder.nama_customer}</strong>
                  </div>
                  {selectedOrder.telepon_customer && (
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
                      <strong>{selectedOrder.telepon_customer}</strong>
                    </div>
                  )}
                  {selectedOrder.email_customer && (
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
                      <strong>{selectedOrder.email_customer}</strong>
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
                      {selectedOrder.jenis_order === 'offline'
                        ? '🏪 Offline'
                        : '🌐 Online'}
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
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'white',
                        padding: '1rem',
                        borderRadius: '6px',
                        marginBottom:
                          idx < selectedOrder.items!.length - 1 ? '1rem' : '0',
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
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                  {formatRupiah(selectedOrder.total_harga)}
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
                    {getStatusLabel(selectedOrder.status_order)}
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
                    {getStatusPembayaran(selectedOrder)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div style={{ marginTop: '1.5rem' }}>
                <button
                  onClick={() => handlePrintInvoice(selectedOrder)}
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
      )}

      {/* Create Order Modal */}
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
