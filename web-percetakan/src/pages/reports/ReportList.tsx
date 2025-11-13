import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SalesReport from './SalesReport';
import StockReport from './StockReport';
import FinanceReport from './FinanceReport';
import './reports.css';

import { API_BASE_URL } from '../../config';

type ReportType = 'overview' | 'sales' | 'stock' | 'finance';

const ReportList: React.FC = () => {
  const [activeReport, setActiveReport] = useState<ReportType>('overview');
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    lowStockCount: 0,
    pendingOrders: 0,
    avgOrdersPerDay: '0',
    topProduct: '-',
    activeCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      console.log('=== FETCHING SUMMARY DATA ===');

      // 1. Fetch orders
      const ordersRes = await axios.get(`${API_BASE_URL}/orders.php`, {
        params: { _t: Date.now() },
      });

      console.log('Orders Response:', ordersRes.data);

      // Parse orders dengan benar sesuai struktur API
      let orders = [];
      if (ordersRes.data.status === 'success' && ordersRes.data.data) {
        orders = ordersRes.data.data.orders || [];
      } else if (ordersRes.data.status === 'success' && ordersRes.data.orders) {
        orders = ordersRes.data.orders;
      } else if (ordersRes.data.orders) {
        orders = ordersRes.data.orders;
      } else if (Array.isArray(ordersRes.data)) {
        orders = ordersRes.data;
      }

      console.log('Parsed Orders:', orders.length, 'orders');

      const totalOrders = orders.length;

      // Hitung pending orders
      const pendingOrders = orders.filter((o: any) => {
        const statusOrder = (o.status_order || '').toLowerCase();
        return statusOrder === 'pending' || statusOrder === 'diproses';
      }).length;

      // Hitung total revenue dari order yang LUNAS/DIBAYAR
      // Filter berdasarkan status_pembayaran, pembayaran, atau status_order
      const paidOrders = orders.filter((o: any) => {
        // Cek semua kemungkinan field name untuk status pembayaran
        const statusPembayaran = (o.status_pembayaran || '').toLowerCase();
        const pembayaran = (o.pembayaran || '').toLowerCase();
        const statusOrder = (o.status_order || '').toLowerCase();

        // Order dianggap "menghasilkan pendapatan" jika:
        // 1. status_pembayaran/pembayaran = lunas/dibayar/paid
        // 2. ATAU status order = selesai/dibayar
        return (
          statusPembayaran === 'lunas' ||
          statusPembayaran === 'dibayar' ||
          statusPembayaran === 'paid' ||
          pembayaran === 'lunas' ||
          pembayaran === 'dibayar' ||
          pembayaran === 'paid' ||
          statusOrder === 'selesai' ||
          statusOrder === 'dibayar'
        );
      });

      const totalRevenue = paidOrders.reduce(
        (sum: number, o: any) => sum + parseFloat(o.total_harga || 0),
        0,
      );

      console.log('=== REVENUE CALCULATION DEBUG ===');
      console.log('Total Orders:', totalOrders);
      console.log('Pending Orders:', pendingOrders);
      console.log('Paid Orders:', paidOrders.length);
      console.log('Total Revenue:', totalRevenue);

      // Debug: tampilkan sample order untuk cek struktur data
      if (orders.length > 0) {
        console.log('Sample Order Structure:', {
          id: orders[0].id_order,
          status_order: orders[0].status_order,
          status_pembayaran: orders[0].status_pembayaran,
          pembayaran: orders[0].pembayaran,
          total_harga: orders[0].total_harga,
        });

        // Tampilkan semua order dengan status pembayaran
        console.log('All Orders Payment Status:');
        orders.forEach((o: any, idx: number) => {
          console.log(`#${idx + 1}:`, {
            id: o.id_order,
            total: o.total_harga,
            status_order: o.status_order,
            status_pembayaran: o.status_pembayaran,
            pembayaran: o.pembayaran,
          });
        });
      }

      // 2. Fetch materials untuk stok rendah
      const materialsRes = await axios.get(`${API_BASE_URL}/materials.php`, {
        params: { _t: Date.now() },
      });

      let materials = [];
      if (materialsRes.data.status === 'success' && materialsRes.data.data) {
        materials = materialsRes.data.data.materials || [];
      } else if (
        materialsRes.data.status === 'success' &&
        materialsRes.data.materials
      ) {
        materials = materialsRes.data.materials;
      } else if (materialsRes.data.materials) {
        materials = materialsRes.data.materials;
      } else if (Array.isArray(materialsRes.data)) {
        materials = materialsRes.data;
      }

      const lowStockCount = materials.filter(
        (m: any) => m.status_stok === 'rendah',
      ).length;

      console.log('Low Stock Count:', lowStockCount);

      // 3. Hitung rata-rata order per hari (30 hari terakhir)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentOrders = orders.filter((o: any) => {
        const orderDate = new Date(o.tanggal_order);
        return orderDate >= thirtyDaysAgo;
      });
      const avgOrdersPerDay =
        recentOrders.length > 0 ? (recentOrders.length / 30).toFixed(1) : '0';

      console.log('Recent Orders (30 days):', recentOrders.length);
      console.log('Avg Orders/Day:', avgOrdersPerDay);

      // 4. Produk terlaris dari order_items
      let topProduct = '-';
      try {
        const orderItemsRes = await axios.get(
          `${API_BASE_URL}/order_items.php`,
          {
            params: { _t: Date.now() },
          },
        );

        let orderItems = [];
        if (
          orderItemsRes.data.status === 'success' &&
          orderItemsRes.data.data
        ) {
          orderItems = orderItemsRes.data.data.order_items || [];
        } else if (
          orderItemsRes.data.status === 'success' &&
          orderItemsRes.data.order_items
        ) {
          orderItems = orderItemsRes.data.order_items;
        } else if (orderItemsRes.data.order_items) {
          orderItems = orderItemsRes.data.order_items;
        } else if (Array.isArray(orderItemsRes.data)) {
          orderItems = orderItemsRes.data;
        }

        // Hitung produk terlaris
        const productCount: { [key: string]: { count: number; name: string } } =
          {};
        orderItems.forEach((item: any) => {
          const productId = item.id_product;
          const productName = item.nama_product || 'Unknown';
          if (productId) {
            if (!productCount[productId]) {
              productCount[productId] = { count: 0, name: productName };
            }
            productCount[productId].count += parseInt(item.jumlah || 0);
          }
        });

        if (Object.keys(productCount).length > 0) {
          const topProductId = Object.keys(productCount).reduce((a, b) =>
            productCount[a].count > productCount[b].count ? a : b,
          );
          topProduct = productCount[topProductId].name;
        }

        console.log('Top Product:', topProduct);
      } catch (error) {
        console.log('Order items endpoint not available:', error);
      }

      // 5. Customer aktif
      let activeCustomers = 0;
      try {
        const usersRes = await axios.get(`${API_BASE_URL}/users.php`, {
          params: { _t: Date.now() },
        });

        let users = [];
        if (usersRes.data.status === 'success' && usersRes.data.data) {
          users = usersRes.data.data.users || [];
        } else if (usersRes.data.status === 'success' && usersRes.data.users) {
          users = usersRes.data.users;
        } else if (usersRes.data.users) {
          users = usersRes.data.users;
        } else if (Array.isArray(usersRes.data)) {
          users = usersRes.data;
        }

        activeCustomers = users.filter(
          (u: any) => u.role === 'customer',
        ).length;

        console.log('Active Customers:', activeCustomers);
      } catch (error) {
        console.log('Users endpoint not available:', error);
      }

      setSummary({
        totalOrders,
        totalRevenue,
        lowStockCount,
        pendingOrders,
        avgOrdersPerDay,
        topProduct,
        activeCustomers,
      });

      console.log('=== SUMMARY UPDATED ===');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching summary:', error);
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

  const renderContent = () => {
    switch (activeReport) {
      case 'sales':
        return <SalesReport />;
      case 'stock':
        return <StockReport />;
      case 'finance':
        return <FinanceReport />;
      default:
        return (
          <OverviewReport
            summary={summary}
            loading={loading}
            formatRupiah={formatRupiah}
            onRefresh={fetchSummary}
          />
        );
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div>
          <h1>Laporan & Statistik</h1>
          <p className="subtitle">Monitoring performa bisnis</p>
        </div>
        <button className="btn-export" onClick={() => window.print()}>
          <span>📥</span> Export Laporan
        </button>
      </div>

      {/* Report Tabs */}
      <div className="report-tabs">
        <button
          className={`tab-btn ${activeReport === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveReport('overview')}
        >
          <span>📊</span> Overview
        </button>
        <button
          className={`tab-btn ${activeReport === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveReport('sales')}
        >
          <span>💰</span> Penjualan
        </button>
        <button
          className={`tab-btn ${activeReport === 'stock' ? 'active' : ''}`}
          onClick={() => setActiveReport('stock')}
        >
          <span>📦</span> Stok
        </button>
        <button
          className={`tab-btn ${activeReport === 'finance' ? 'active' : ''}`}
          onClick={() => setActiveReport('finance')}
        >
          <span>💵</span> Keuangan
        </button>
      </div>

      {/* Report Content */}
      <div className="report-content">{renderContent()}</div>
    </div>
  );
};

// Overview Report Component
const OverviewReport: React.FC<{
  summary: any;
  loading: boolean;
  formatRupiah: (amount: number) => string;
  onRefresh: () => void;
}> = ({ summary, loading, formatRupiah, onRefresh }) => {
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Memuat data...</p>
      </div>
    );
  }

  return (
    <>
      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card card-blue">
          <div className="card-icon">🛒</div>
          <div className="card-info">
            <h3>Total Pesanan</h3>
            <p className="card-number">{summary.totalOrders}</p>
            <small>Semua waktu</small>
          </div>
        </div>

        <div className="summary-card card-green">
          <div className="card-icon">💰</div>
          <div className="card-info">
            <h3>Total Pendapatan</h3>
            <p className="card-number">{formatRupiah(summary.totalRevenue)}</p>
            <small>Order lunas/selesai</small>
          </div>
        </div>

        <div className="summary-card card-orange">
          <div className="card-icon">⏳</div>
          <div className="card-info">
            <h3>Pesanan Pending</h3>
            <p className="card-number">{summary.pendingOrders}</p>
            <small>Perlu diproses</small>
          </div>
        </div>

        <div className="summary-card card-red">
          <div className="card-icon">⚠️</div>
          <div className="card-info">
            <h3>Stok Rendah</h3>
            <p className="card-number">{summary.lowStockCount}</p>
            <small>Bahan cetak</small>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h3>Statistik Cepat</h3>
          <button className="btn-refresh-report" onClick={onRefresh}>
            🔄 Refresh
          </button>
        </div>
        <div className="stats-list">
          <div className="stat-item">
            <span className="stat-label">Rata-rata Pesanan/Hari:</span>
            <span className="stat-value">{summary.avgOrdersPerDay}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Produk Terlaris:</span>
            <span className="stat-value">{summary.topProduct}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Customer Aktif:</span>
            <span className="stat-value">{summary.activeCustomers}</span>
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="chart-container">
        <h3>Grafik Penjualan</h3>
        <div className="chart-placeholder">
          <p>📈 Grafik akan ditampilkan di sini</p>
          <small>Integrasi dengan Chart.js atau Recharts</small>
        </div>
      </div>
    </>
  );
};

export default ReportList;
