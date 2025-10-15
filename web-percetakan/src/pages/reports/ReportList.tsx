import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SalesReport from './SalesReport';
import StockReport from './StockReport';
import FinanceReport from './FinanceReport';
import './reports.css';

const API_BASE_URL = 'http://localhost/api-percetakan/api';

type ReportType = 'overview' | 'sales' | 'stock' | 'finance';

const ReportList: React.FC = () => {
  const [activeReport, setActiveReport] = useState<ReportType>('overview');
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    lowStockCount: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      // Fetch orders
      const ordersRes = await axios.get(`${API_BASE_URL}/orders.php`);
      const orders = ordersRes.data.orders || [];
      const totalOrders = orders.length;
      const pendingOrders = orders.filter((o: any) => o.status_order === 'pending').length;
      const totalRevenue = orders.reduce((sum: number, o: any) => sum + parseFloat(o.total_harga || 0), 0);

      // Fetch materials low stock
      const materialsRes = await axios.get(`${API_BASE_URL}/materials.php?op=low_stock`);
      const lowStockCount = materialsRes.data.total || 0;

      setSummary({
        totalOrders,
        totalRevenue,
        lowStockCount,
        pendingOrders,
      });
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
        return <OverviewReport summary={summary} loading={loading} formatRupiah={formatRupiah} />;
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div>
          <h1>Laporan & Statistik</h1>
          <p className="subtitle">Monitoring performa bisnis</p>
        </div>
        <button className="btn-export">
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
}> = ({ summary, loading, formatRupiah }) => {
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
            <small>Semua waktu</small>
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
        <h3>Statistik Cepat</h3>
        <div className="stats-list">
          <div className="stat-item">
            <span className="stat-label">Rata-rata Pesanan/Hari:</span>
            <span className="stat-value">-</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Produk Terlaris:</span>
            <span className="stat-value">-</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Customer Aktif:</span>
            <span className="stat-value">-</span>
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