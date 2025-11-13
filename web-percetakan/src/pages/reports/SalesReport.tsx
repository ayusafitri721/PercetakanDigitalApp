import React, { useState, useEffect } from 'react';

import { API_BASE_URL } from '../../config';

interface OrderDetail {
  id_order: string;
  kode_order: string;
  tanggal_order: string;
  nama_customer: string;
  email_customer: string;
  status_order: string;
  total_harga: number;
  jumlah_item: number;
}

interface StatisticsData {
  total_penjualan: number;
  jumlah_transaksi: number;
  total_item: number;
  produk_terlaris: Array<{
    nama_product: string;
    total_terjual: number;
    total_pendapatan: number;
  }>;
}

const SalesReport: React.FC = () => {
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('=== FETCHING SALES DATA ===');

      // Build query params
      const params = new URLSearchParams();
      if (dateRange.start) params.append('start_date', dateRange.start);
      if (dateRange.end) params.append('end_date', dateRange.end);
      params.append('_t', Date.now().toString());

      // 1. Fetch statistics
      const statsUrl = `${API_BASE_URL}/orders.php?op=statistics&${params}`;
      console.log('Fetching stats from:', statsUrl);

      const statsRes = await fetch(statsUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      const statsJson = await statsRes.json();

      console.log('Statistics response:', statsJson);

      if (statsJson.status === 'success' && statsJson.data) {
        setStatistics(statsJson.data);
        console.log('✅ Statistics loaded:', statsJson.data);
      } else {
        console.warn('⚠️ Unexpected statistics response:', statsJson);
      }

      // 2. Fetch sales report (detail orders)
      const reportUrl = `${API_BASE_URL}/orders.php?op=sales_report&${params}`;
      console.log('Fetching report from:', reportUrl);

      const reportRes = await fetch(reportUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      const reportJson = await reportRes.json();

      console.log('Sales report response:', reportJson);

      if (reportJson.status === 'success' && reportJson.data) {
        const ordersData = reportJson.data.orders || [];
        setOrders(ordersData);
        console.log('✅ Orders loaded:', ordersData.length);
      } else {
        console.warn('⚠️ Unexpected report response:', reportJson);
        setOrders([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching sales data:', error);
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
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeClass = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'badge-warning',
      diproses: 'badge-info',
      selesai: 'badge-success',
      dibayar: 'badge-success',
      dibatalkan: 'badge-danger',
    };
    return statusMap[status.toLowerCase()] || 'badge-secondary';
  };

  const handleFilter = () => {
    fetchData();
  };

  const resetFilter = () => {
    setDateRange({ start: '', end: '' });
    // Auto fetch after reset
    setTimeout(() => fetchData(), 100);
  };

  if (loading) {
    return (
      <div
        className="loading"
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
          className="spinner"
          style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite',
          }}
        ></div>
        <p>Memuat laporan penjualan...</p>
      </div>
    );
  }

  return (
    <div className="sales-report">
      {/* Header Actions */}
      <div className="report-header-actions" style={{ marginBottom: '20px' }}>
        <button
          className="btn-refresh-report"
          onClick={fetchData}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* Date Filters */}
      <div
        className="report-filters"
        style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '25px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          alignItems: 'flex-end',
        }}
      >
        <div className="filter-group">
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
            className="form-control"
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
          />
        </div>
        <div className="filter-group">
          <label
            style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}
          >
            Sampai Tanggal:
          </label>
          <input
            type="date"
            value={dateRange.end}
            onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
            className="form-control"
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
          />
        </div>
        <button
          className="btn-primary"
          onClick={handleFilter}
          style={{
            padding: '8px 20px',
            backgroundColor: '#4CAF50',
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
            className="btn-secondary"
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

      {/* Statistics Summary */}
      {statistics && (
        <div
          className="report-summary-box"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '30px',
          }}
        >
          <div
            className="summary-card"
            style={{
              padding: '20px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '1px solid #e0e0e0',
            }}
          >
            <h3 style={{ color: '#2196F3', marginBottom: '10px' }}>
              💰 Total Penjualan
            </h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
              {formatRupiah(statistics.total_penjualan)}
            </p>
          </div>

          <div
            className="summary-card"
            style={{
              padding: '20px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '1px solid #e0e0e0',
            }}
          >
            <h3 style={{ color: '#4CAF50', marginBottom: '10px' }}>
              📊 Jumlah Transaksi
            </h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
              {statistics.jumlah_transaksi} transaksi
            </p>
          </div>

          <div
            className="summary-card"
            style={{
              padding: '20px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '1px solid #e0e0e0',
            }}
          >
            <h3 style={{ color: '#FF9800', marginBottom: '10px' }}>
              📦 Total Item Terjual
            </h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
              {statistics.total_item} pcs
            </p>
          </div>
        </div>
      )}

      {/* Produk Terlaris */}
      {statistics && statistics.produk_terlaris.length > 0 && (
        <div
          className="top-products"
          style={{
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ marginBottom: '15px' }}>🔥 Produk Terlaris</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            {statistics.produk_terlaris.map((product, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                }}
              >
                <div>
                  <strong>{product.nama_product}</strong>
                  <small style={{ display: 'block', color: '#666' }}>
                    Terjual: {product.total_terjual} pcs
                  </small>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>{formatRupiah(product.total_pendapatan)}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div
          className="empty-state"
          style={{
            padding: '50px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
          }}
        >
          <p style={{ fontSize: '18px', color: '#666' }}>
            Tidak ada data penjualan
          </p>
        </div>
      ) : (
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table
            className="report-table"
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderBottom: '2px solid #ddd',
                  }}
                >
                  ID Order
                </th>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderBottom: '2px solid #ddd',
                  }}
                >
                  Kode Order
                </th>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderBottom: '2px solid #ddd',
                  }}
                >
                  Tanggal
                </th>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderBottom: '2px solid #ddd',
                  }}
                >
                  Customer
                </th>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'center',
                    borderBottom: '2px solid #ddd',
                  }}
                >
                  Jumlah Item
                </th>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'right',
                    borderBottom: '2px solid #ddd',
                  }}
                >
                  Total
                </th>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'center',
                    borderBottom: '2px solid #ddd',
                  }}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr
                  key={order.id_order}
                  style={{ borderBottom: '1px solid #eee' }}
                >
                  <td style={{ padding: '12px' }}>#{order.id_order}</td>
                  <td style={{ padding: '12px' }}>
                    <strong>{order.kode_order}</strong>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {formatDate(order.tanggal_order)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div>
                      <strong>{order.nama_customer}</strong>
                      {order.email_customer && (
                        <small style={{ display: 'block', color: '#666' }}>
                          {order.email_customer}
                        </small>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <strong>{order.jumlah_item}</strong>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <strong style={{ color: '#2196F3' }}>
                      {formatRupiah(order.total_harga)}
                    </strong>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span
                      className={`badge ${getStatusBadgeClass(
                        order.status_order,
                      )}`}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
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
      )}

      {/* Footer Summary */}
      {statistics && (
        <div
          className="sales-summary-footer"
          style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div className="summary-item">
            <span className="label" style={{ color: '#666' }}>
              Total Item Terjual:
            </span>
            <span
              className="value"
              style={{ marginLeft: '10px', fontWeight: 'bold' }}
            >
              {statistics.total_item} pcs
            </span>
          </div>
          <div className="summary-item">
            <span className="label" style={{ color: '#666' }}>
              Transaksi Lunas:
            </span>
            <span
              className="value"
              style={{
                marginLeft: '10px',
                fontWeight: 'bold',
                color: '#4CAF50',
              }}
            >
              {statistics.jumlah_transaksi} transaksi
            </span>
          </div>
          <div
            className="summary-item summary-total"
            style={{
              padding: '10px 20px',
              backgroundColor: '#2196F3',
              color: 'white',
              borderRadius: '5px',
            }}
          >
            <span className="label">TOTAL PENJUALAN:</span>
            <span
              className="value"
              style={{
                marginLeft: '10px',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
            >
              {formatRupiah(statistics.total_penjualan)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesReport;
