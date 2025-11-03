import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost/api-percetakan/api';

interface Order {
  id_order: string;
  kode_order: string;
  tanggal_order: string;
  total_harga: number;
  status_order: string;
  nama_customer?: string;
  jumlah_item?: number;
}

interface FinanceStats {
  total_pemasukan: number;
  pending_revenue: number;
  paid_transactions: number;
  pending_transactions: number;
  avg_transaction: number;
}

const FinanceReport: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      console.log('=== FETCHING FINANCE DATA ===');

      // Build query params
      const params = new URLSearchParams();
      if (dateRange.start) params.append('start_date', dateRange.start);
      if (dateRange.end) params.append('end_date', dateRange.end);
      params.append('_t', Date.now().toString());

      // Fetch sales report (sudah include semua order)
      const reportUrl = `${API_BASE_URL}/orders.php?op=sales_report&${params}`;
      console.log('Fetching from:', reportUrl);

      const response = await axios.get(reportUrl, {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      console.log('Finance API Response:', response.data);

      if (response.data.status === 'success' && response.data.data) {
        const data = response.data.data;
        const ordersData = data.orders || [];

        setOrders(ordersData);

        // Calculate stats dari data yang ada
        calculateStats(ordersData);

        console.log('✅ Finance data loaded:', ordersData.length, 'orders');
      } else {
        console.warn('⚠️ Unexpected response:', response.data);
        setOrders([]);
        setStats(null);
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching finance data:', error);
      setLoading(false);
    }
  };

  const calculateStats = (ordersData: Order[]) => {
    // Filter order yang lunas (paid)
    const paidOrders = ordersData.filter(
      o => o.status_order === 'selesai' || o.status_order === 'dibayar',
    );

    // Filter order yang pending
    const pendingOrders = ordersData.filter(
      o => o.status_order === 'pending' || o.status_order === 'diproses',
    );

    // Calculate totals
    const totalPemasukan = paidOrders.reduce(
      (sum, o) => sum + o.total_harga,
      0,
    );
    const pendingRevenue = pendingOrders.reduce(
      (sum, o) => sum + o.total_harga,
      0,
    );
    const avgTransaction =
      paidOrders.length > 0 ? totalPemasukan / paidOrders.length : 0;

    setStats({
      total_pemasukan: totalPemasukan,
      pending_revenue: pendingRevenue,
      paid_transactions: paidOrders.length,
      pending_transactions: pendingOrders.length,
      avg_transaction: avgTransaction,
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
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleFilter = () => {
    fetchFinanceData();
  };

  const resetFilter = () => {
    setDateRange({ start: '', end: '' });
    setTimeout(() => fetchFinanceData(), 100);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#FFA726',
      diproses: '#42A5F5',
      selesai: '#66BB6A',
      dibayar: '#66BB6A',
      dibatalkan: '#EF5350',
    };
    return colors[status.toLowerCase()] || '#9E9E9E';
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '50px',
          gap: '15px',
        }}
      >
        <div
          style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #4CAF50',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite',
          }}
        ></div>
        <p>Memuat laporan keuangan...</p>
      </div>
    );
  }

  const totalOrders = orders.length;
  const totalPotensi = stats
    ? stats.total_pemasukan + stats.pending_revenue
    : 0;

  return (
    <div className="finance-report" style={{ padding: '20px' }}>
      {/* Header Actions */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={fetchFinanceData}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* Date Filters */}
      <div
        style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <label
            style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}
          >
            Dari Tanggal:
          </label>
          <input
            type="date"
            value={dateRange.start}
            onChange={e =>
              setDateRange({ ...dateRange, start: e.target.value })
            }
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
          />
        </div>
        <div>
          <label
            style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}
          >
            Sampai Tanggal:
          </label>
          <input
            type="date"
            value={dateRange.end}
            onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
          />
        </div>
        <button
          onClick={handleFilter}
          style={{
            padding: '8px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Filter
        </button>
        {(dateRange.start || dateRange.end) && (
          <button
            onClick={resetFilter}
            style={{
              padding: '8px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        )}
      </div>

      {/* Financial Summary Cards */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              padding: '25px',
              backgroundColor: '#fff',
              borderRadius: '10px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              borderLeft: '5px solid #4CAF50',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px',
              }}
            >
              <span style={{ fontSize: '32px' }}>💰</span>
              <h3 style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                Total Pemasukan
              </h3>
            </div>
            <p
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#4CAF50',
                margin: '10px 0',
              }}
            >
              {formatRupiah(stats.total_pemasukan)}
            </p>
            <small style={{ color: '#999' }}>
              {stats.paid_transactions} transaksi lunas
            </small>
          </div>

          <div
            style={{
              padding: '25px',
              backgroundColor: '#fff',
              borderRadius: '10px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              borderLeft: '5px solid #FFA726',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px',
              }}
            >
              <span style={{ fontSize: '32px' }}>⏳</span>
              <h3 style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                Pendapatan Pending
              </h3>
            </div>
            <p
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#FFA726',
                margin: '10px 0',
              }}
            >
              {formatRupiah(stats.pending_revenue)}
            </p>
            <small style={{ color: '#999' }}>
              {stats.pending_transactions} transaksi belum lunas
            </small>
          </div>

          <div
            style={{
              padding: '25px',
              backgroundColor: '#fff',
              borderRadius: '10px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              borderLeft: '5px solid #2196F3',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px',
              }}
            >
              <span style={{ fontSize: '32px' }}>📊</span>
              <h3 style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                Rata-rata Transaksi
              </h3>
            </div>
            <p
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#2196F3',
                margin: '10px 0',
              }}
            >
              {formatRupiah(stats.avg_transaction)}
            </p>
            <small style={{ color: '#999' }}>Per transaksi</small>
          </div>

          <div
            style={{
              padding: '25px',
              backgroundColor: '#fff',
              borderRadius: '10px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              borderLeft: '5px solid #9C27B0',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px',
              }}
            >
              <span style={{ fontSize: '32px' }}>📈</span>
              <h3 style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                Total Transaksi
              </h3>
            </div>
            <p
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#9C27B0',
                margin: '10px 0',
              }}
            >
              {totalOrders}
            </p>
            <small style={{ color: '#999' }}>Semua status</small>
          </div>
        </div>
      )}

      {/* Profit Summary */}
      {stats && (
        <div
          style={{
            padding: '25px',
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            marginBottom: '30px',
          }}
        >
          <h3 style={{ marginBottom: '20px', color: '#333' }}>
            💵 Ringkasan Keuangan
          </h3>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '5px',
              }}
            >
              <span style={{ fontWeight: '500' }}>
                Total Pemasukan (Lunas):
              </span>
              <span
                style={{
                  fontWeight: 'bold',
                  color: '#4CAF50',
                  fontSize: '18px',
                }}
              >
                {formatRupiah(stats.total_pemasukan)}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '5px',
              }}
            >
              <span style={{ fontWeight: '500' }}>Pending (Belum Lunas):</span>
              <span
                style={{
                  fontWeight: 'bold',
                  color: '#FFA726',
                  fontSize: '18px',
                }}
              >
                {formatRupiah(stats.pending_revenue)}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '20px',
                backgroundColor: '#2196F3',
                borderRadius: '5px',
                color: 'white',
              }}
            >
              <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
                Potensi Total:
              </span>
              <span style={{ fontWeight: 'bold', fontSize: '24px' }}>
                {formatRupiah(totalPotensi)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {orders.length > 0 && (
        <div
          style={{
            padding: '25px',
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            marginBottom: '30px',
          }}
        >
          <h3 style={{ marginBottom: '20px', color: '#333' }}>
            📋 Transaksi Terbaru
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: '#f8f9fa',
                    borderBottom: '2px solid #ddd',
                  }}
                >
                  <th style={{ padding: '12px', textAlign: 'left' }}>
                    Kode Order
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>
                    Tanggal
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>
                    Customer
                  </th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Total</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map(order => (
                  <tr
                    key={order.id_order}
                    style={{ borderBottom: '1px solid #eee' }}
                  >
                    <td style={{ padding: '12px' }}>
                      <strong>{order.kode_order}</strong>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {formatDate(order.tanggal_order)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {order.nama_customer || '-'}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        textAlign: 'right',
                        fontWeight: 'bold',
                      }}
                    >
                      {formatRupiah(order.total_harga)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span
                        style={{
                          padding: '5px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor:
                            getStatusColor(order.status_order) + '20',
                          color: getStatusColor(order.status_order),
                        }}
                      >
                        {order.status_order}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length > 10 && (
            <p
              style={{ textAlign: 'center', marginTop: '15px', color: '#666' }}
            >
              Menampilkan 10 dari {orders.length} transaksi
            </p>
          )}
        </div>
      )}

      {/* Coming Soon Features */}
      <div
        style={{
          padding: '25px',
          backgroundColor: '#f8f9fa',
          borderRadius: '10px',
          border: '2px dashed #ddd',
        }}
      >
        <h3 style={{ marginBottom: '15px', color: '#666' }}>
          🚀 Fitur Segera Hadir
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {[
            '💵 Pengeluaran & Biaya Operasional',
            '📊 Profit & Loss Statement Detail',
            '💳 Cash Flow Analysis',
            '📄 Export ke PDF/Excel',
            '📈 Grafik Trend Keuangan Bulanan',
          ].map((feature, index) => (
            <li
              key={index}
              style={{
                padding: '10px',
                marginBottom: '8px',
                backgroundColor: 'white',
                borderRadius: '5px',
                color: '#666',
              }}
            >
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FinanceReport;
