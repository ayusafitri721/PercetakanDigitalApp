// FIXED VERSION - Kasir Dashboard dengan Status Sinkron Database
// Status order disesuaikan dengan ENUM: pending, dibayar, diproses, validasi, cetak, selesai, dikirim, dibatalkan
// FIXED: Offline order langsung selesai tanpa status "dikirim"

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
  keterangan?: string;
  is_result?: number;
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
}

const KasirDashboard: React.FC = () => {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
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

        // ✅ Filter pesanan yang selesai (status = "selesai" dari operator)
        // Kasir harus menyerahkan ke customer
        const ready = orders.filter((o: Order) => o.status_order === 'selesai');
        setReadyOrders(ready);

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
      filtered = allOrders.filter(order => {
        const orderDate = getDateOnly(order.tanggal_order);
        return orderDate === todayDate;
      });
    } else if (filterPeriod === 'week') {
      filtered = allOrders.filter(order => {
        const orderDate = getDateOnly(order.tanggal_order);
        return orderDate >= weekStartDate;
      });
    } else if (filterPeriod === 'month') {
      filtered = allOrders.filter(order => {
        const orderDate = getDateOnly(order.tanggal_order);
        return orderDate >= monthStartDate;
      });
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
    const todayOrdersCount = todayOrders.length;

    const isOrderPaid = (o: Order) => {
      if (o.jenis_order === 'offline') {
        return true;
      }

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

      // ✅ Status order yang menandakan sudah bayar
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
      if (o.status_pembayaran) {
        return o.status_pembayaran.toLowerCase() === 'pending';
      }
      return o.status_order === 'pending';
    }).length;

    // ✅ Pesanan yang diserahkan ke customer hari ini (status = selesai dengan tanggal_selesai)
    const completedToday = orders.filter(
      o =>
        o.status_order === 'selesai' &&
        o.tanggal_selesai &&
        getDateOnly(o.tanggal_selesai) === todayDate,
    ).length;

    setStats({
      todayOrders: todayOrdersCount,
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
        orderDetail.design_files = [];
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

  const handleSelesaikanOrder = async (orderId: string, kodeOrder: string) => {
    if (
      !confirm(
        `✅ Serahkan pesanan ${kodeOrder} ke customer?\n\nPesanan akan ditandai sebagai "Selesai".`,
      )
    )
      return;

    try {
      const formData = new FormData();
      // ✅ Status "selesai" = pesanan diserahkan langsung (untuk offline)
      formData.append('status_order', 'selesai');
      formData.append('mark_completed', '1'); // Flag untuk set tanggal_selesai

      const response = await axios.post(
        `${API_BASE_URL}/orders.php?op=update&id=${orderId}`,
        formData,
        { headers: { Accept: 'application/json' } },
      );

      if (response.data.status === 'success') {
        alert('✅ Pesanan berhasil diserahkan ke customer!');
        fetchOrders();
        if (showDetailModal) setShowDetailModal(false);
      }
    } catch (error: any) {
      alert('❌ Gagal: ' + (error.message || 'Terjadi kesalahan'));
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusLabel = (status: string) => {
    // ✅ Mapping status sesuai ENUM database (tanpa dikirim untuk offline)
    const labels: { [key: string]: string } = {
      pending: '⏳ Pending',
      dibayar: '💳 Dibayar',
      diproses: '🔄 Diproses',
      validasi: '✅ Validasi',
      cetak: '🖨️ Cetak',
      selesai: '✔️ Selesai - Diserahkan',
      dikirim: '🚚 Dikirim', // Untuk online order saja
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
    ) {
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

  const getResultFiles = (files?: DesignFile[]) => {
    return (
      files?.filter(
        f => f.is_result === 1 || f.keterangan === 'HASIL_OPERATOR',
      ) || []
    );
  };

  const getDesignFiles = (files?: DesignFile[]) => {
    return (
      files?.filter(
        f => f.is_result !== 1 && f.keterangan !== 'HASIL_OPERATOR',
      ) || []
    );
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

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#6c757d' }}>
            ✅
          </div>
          <div className="stat-info">
            <h3>Diserahkan Hari Ini</h3>
            <p className="stat-number">{stats.completedToday}</p>
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

      {/* Pesanan Siap Diambil Section */}
      {readyOrders.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              padding: '1.5rem',
              borderRadius: '12px',
              marginBottom: '1rem',
            }}
          >
            <h2
              style={{
                margin: '0 0 0.5rem 0',
                color: 'white',
                fontSize: '1.5rem',
              }}
            >
              📦 Pesanan Siap Diambil Customer ({readyOrders.length})
            </h2>
            <p style={{ margin: 0, color: 'white', opacity: 0.9 }}>
              Pesanan yang sudah selesai dikerjakan operator, siap diserahkan
              langsung ke customer
            </p>
          </div>

          <div className="table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Kode Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Jenis</th>
                  <th>Waktu</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {readyOrders.map(order => (
                  <tr
                    key={order.id_order}
                    style={{
                      background:
                        'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                      borderLeft: '4px solid #28a745',
                      fontWeight: '500',
                    }}
                  >
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
                    <td className="text-right">
                      <strong>{formatRupiah(order.total_harga)}</strong>
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
                    <td>{formatDate(order.tanggal_order)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleViewDetail(order)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                          }}
                        >
                          👁️ Detail
                        </button>
                        <button
                          onClick={() =>
                            handleSelesaikanOrder(
                              order.id_order,
                              order.kode_order,
                            )
                          }
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                          }}
                        >
                          ✅ Serahkan
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                        style={{
                          background: getStatusColor(order.status_order),
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          display: 'inline-block',
                          border: 'none',
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
                          border: 'none',
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
                          title="Cetak Invoice"
                        >
                          🖨️
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleViewDetail(order)}
                          title="Lihat Detail"
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

      {/* Detail Modal - CONTINUED IN NEXT PART */}
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

            <div style={{ padding: '1.5rem' }}>
              {/* File Hasil Operator */}
              {getResultFiles(selectedOrder.design_files).length > 0 && (
                <div
                  style={{
                    background:
                      'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginBottom: '1.5rem',
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 1rem 0',
                      color: 'white',
                      fontSize: '1.2rem',
                    }}
                  >
                    ✅ File Hasil dari Operator (
                    {getResultFiles(selectedOrder.design_files).length})
                  </h3>

                  {getResultFiles(selectedOrder.design_files).map(
                    (file, idx) => (
                      <div
                        key={file.id_file}
                        style={{
                          background: 'white',
                          padding: '1rem',
                          borderRadius: '8px',
                          marginBottom:
                            idx <
                            getResultFiles(selectedOrder.design_files).length -
                              1
                              ? '1rem'
                              : '0',
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
                                fontWeight: '600',
                                fontSize: '1rem',
                              }}
                            >
                              {file.nama_file}
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: '0.85rem',
                                color: '#666',
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
                              background: '#007bff',
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
                                maxHeight: '400px',
                                objectFit: 'contain',
                                border: '1px solid #e0e0e0',
                                borderRadius: '6px',
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ),
                  )}
                </div>
              )}

              {/* File Design Customer */}
              {getDesignFiles(selectedOrder.design_files).length > 0 && (
                <div
                  style={{
                    background: '#f0f9ff',
                    border: '2px solid #3b82f6',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 1rem 0',
                      color: '#1e40af',
                      fontSize: '1.1rem',
                    }}
                  >
                    📁 File Design Customer (
                    {getDesignFiles(selectedOrder.design_files).length})
                  </h3>

                  {getDesignFiles(selectedOrder.design_files).map(
                    (file, idx) => (
                      <div
                        key={file.id_file}
                        style={{
                          background: 'white',
                          padding: '1rem',
                          borderRadius: '6px',
                          marginBottom:
                            idx <
                            getDesignFiles(selectedOrder.design_files).length -
                              1
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
                          <div style={{ fontSize: '2rem' }}>
                            {file.tipe_file.match(/image/i) ? '🖼️' : '📄'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p
                              style={{
                                margin: '0 0 0.25rem 0',
                                fontWeight: '600',
                              }}
                            >
                              {file.nama_file}
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: '0.85rem',
                                color: '#64748b',
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
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '0.9rem',
                            }}
                          >
                            📥 Download
                          </button>
                        </div>
                      </div>
                    ),
                  )}
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

              {/* Total */}
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

              {/* Action Buttons */}
              {selectedOrder.status_order === 'selesai' && (
                <div
                  style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}
                >
                  <button
                    onClick={() => handlePrintInvoice(selectedOrder)}
                    style={{
                      flex: 1,
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
                  <button
                    onClick={() =>
                      handleSelesaikanOrder(
                        selectedOrder.id_order,
                        selectedOrder.kode_order,
                      )
                    }
                    style={{
                      flex: 1,
                      padding: '1rem',
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1rem',
                    }}
                  >
                    ✅ Serahkan ke Customer
                  </button>
                </div>
              )}
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
