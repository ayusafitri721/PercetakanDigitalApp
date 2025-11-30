import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ShoppingCart,
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
  Package,
  BarChart3,
  Download,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import SalesReport from './SalesReport';
import StockReport from './StockReport';
import FinanceReport from './FinanceReport';

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
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

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

      // Generate chart data dari orders (30 hari terakhir)
      const chartDataMap: {
        [key: string]: { date: string; orders: number; revenue: number };
      } = {};

      recentOrders.forEach((order: any) => {
        const date = new Date(order.tanggal_order);
        const dateStr = date.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
        });

        if (!chartDataMap[dateStr]) {
          chartDataMap[dateStr] = { date: dateStr, orders: 0, revenue: 0 };
        }

        chartDataMap[dateStr].orders += 1;

        // Tambahkan revenue jika order sudah dibayar
        const statusPembayaran = (order.status_pembayaran || '').toLowerCase();
        const pembayaran = (order.pembayaran || '').toLowerCase();
        const statusOrder = (order.status_order || '').toLowerCase();

        if (
          statusPembayaran === 'lunas' ||
          statusPembayaran === 'dibayar' ||
          statusPembayaran === 'paid' ||
          pembayaran === 'lunas' ||
          pembayaran === 'dibayar' ||
          pembayaran === 'paid' ||
          statusOrder === 'selesai' ||
          statusOrder === 'dibayar'
        ) {
          chartDataMap[dateStr].revenue += parseFloat(order.total_harga || 0);
        }
      });

      // Convert ke array dan ambil 14 hari terakhir
      const chartDataArray = Object.values(chartDataMap)
        .slice(-14)
        .map(item => ({
          ...item,
          revenue: Math.round(item.revenue / 1000), // Dalam ribuan untuk readability
        }));

      setChartData(chartDataArray);

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
            chartData={chartData}
            chartType={chartType}
            setChartType={setChartType}
          />
        );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Laporan & Statistik</h1>
          <p style={styles.subtitle}>Monitoring performa bisnis</p>
        </div>
        <button style={styles.exportBtn} onClick={() => window.print()}>
          <Download size={18} />
          <span>Export Laporan</span>
        </button>
      </div>

      {/* Report Tabs */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeReport === 'overview' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveReport('overview')}
        >
          <BarChart3 size={18} />
          <span>Overview</span>
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeReport === 'sales' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveReport('sales')}
        >
          <TrendingUp size={18} />
          <span>Penjualan</span>
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeReport === 'stock' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveReport('stock')}
        >
          <Package size={18} />
          <span>Stok</span>
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeReport === 'finance' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveReport('finance')}
        >
          <DollarSign size={18} />
          <span>Keuangan</span>
        </button>
      </div>

      {/* Report Content */}
      <div style={styles.content}>{renderContent()}</div>
    </div>
  );
};

// Overview Report Component
const OverviewReport: React.FC<{
  summary: any;
  loading: boolean;
  formatRupiah: (amount: number) => string;
  onRefresh: () => void;
  chartData: any[];
  chartType: 'line' | 'bar';
  setChartType: (type: 'line' | 'bar') => void;
}> = ({
  summary,
  loading,
  formatRupiah,
  onRefresh,
  chartData,
  chartType,
  setChartType,
}) => {
  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Memuat data...</p>
      </div>
    );
  }

  return (
    <>
      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div style={{ ...styles.card, ...styles.cardBlue }}>
          <div style={styles.cardIcon}>
            <ShoppingCart size={28} />
          </div>
          <div style={styles.cardInfo}>
            <h3 style={styles.cardTitle}>Total Pesanan</h3>
            <p style={styles.cardNumber}>{summary.totalOrders}</p>
            <small style={styles.cardSubtext}>Semua waktu</small>
          </div>
        </div>

        <div style={{ ...styles.card, ...styles.cardGreen }}>
          <div style={styles.cardIcon}>
            <DollarSign size={28} />
          </div>
          <div style={styles.cardInfo}>
            <h3 style={styles.cardTitle}>Total Pendapatan</h3>
            <p style={styles.cardNumber}>
              {formatRupiah(summary.totalRevenue)}
            </p>
            <small style={styles.cardSubtext}>Order lunas/selesai</small>
          </div>
        </div>

        <div style={{ ...styles.card, ...styles.cardOrange }}>
          <div style={styles.cardIcon}>
            <Clock size={28} />
          </div>
          <div style={styles.cardInfo}>
            <h3 style={styles.cardTitle}>Pesanan Pending</h3>
            <p style={styles.cardNumber}>{summary.pendingOrders}</p>
            <small style={styles.cardSubtext}>Perlu diproses</small>
          </div>
        </div>

        <div style={{ ...styles.card, ...styles.cardRed }}>
          <div style={styles.cardIcon}>
            <AlertTriangle size={28} />
          </div>
          <div style={styles.cardInfo}>
            <h3 style={styles.cardTitle}>Stok Rendah</h3>
            <p style={styles.cardNumber}>{summary.lowStockCount}</p>
            <small style={styles.cardSubtext}>Bahan cetak</small>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={styles.quickStats}>
        <div style={styles.quickStatsHeader}>
          <h3 style={styles.sectionTitle}>Statistik Cepat</h3>
          <button style={styles.refreshBtn} onClick={onRefresh}>
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
        <div style={styles.statsList}>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Rata-rata Pesanan/Hari:</span>
            <span style={styles.statValue}>{summary.avgOrdersPerDay}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Produk Terlaris:</span>
            <span style={styles.statValue}>{summary.topProduct}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Customer Aktif:</span>
            <span style={styles.statValue}>{summary.activeCustomers}</span>
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div style={styles.chartContainer}>
        <div style={styles.chartHeader}>
          <h3 style={styles.sectionTitle}>
            Grafik Penjualan (14 Hari Terakhir)
          </h3>
          <div style={styles.chartToggle}>
            <button
              style={{
                ...styles.toggleBtn,
                ...(chartType === 'line' ? styles.toggleBtnActive : {}),
              }}
              onClick={() => setChartType('line')}
            >
              Line Chart
            </button>
            <button
              style={{
                ...styles.toggleBtn,
                ...(chartType === 'bar' ? styles.toggleBtnActive : {}),
              }}
              onClick={() => setChartType('bar')}
            >
              Bar Chart
            </button>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div style={{ marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height={350}>
              {chartType === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    stroke="#94a3b8"
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    stroke="#94a3b8"
                    label={{
                      value: 'Jumlah Order',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#64748b',
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    stroke="#94a3b8"
                    label={{
                      value: 'Revenue (Ribu)',
                      angle: 90,
                      position: 'insideRight',
                      fill: '#64748b',
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'revenue') {
                        return [
                          `Rp ${(value * 1000).toLocaleString('id-ID')}`,
                          'Revenue',
                        ];
                      }
                      return [value, 'Jumlah Order'];
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={value => {
                      if (value === 'orders') return 'Jumlah Order';
                      if (value === 'revenue') return 'Revenue (Ribu)';
                      return value;
                    }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    stroke="#94a3b8"
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    stroke="#94a3b8"
                    label={{
                      value: 'Jumlah Order',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#64748b',
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    stroke="#94a3b8"
                    label={{
                      value: 'Revenue (Ribu)',
                      angle: 90,
                      position: 'insideRight',
                      fill: '#64748b',
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'revenue') {
                        return [
                          `Rp ${(value * 1000).toLocaleString('id-ID')}`,
                          'Revenue',
                        ];
                      }
                      return [value, 'Jumlah Order'];
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={value => {
                      if (value === 'orders') return 'Jumlah Order';
                      if (value === 'revenue') return 'Revenue (Ribu)';
                      return value;
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="orders"
                    fill="#3b82f6"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="revenue"
                    fill="#22c55e"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={styles.chartPlaceholder}>
            <BarChart3 size={48} color="#94a3b8" />
            <p style={styles.chartText}>Belum ada data untuk ditampilkan</p>
            <small style={styles.chartSubtext}>
              Data akan muncul setelah ada transaksi
            </small>
          </div>
        )}
      </div>
    </>
  );
};

const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    margin: 0,
  },
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '32px',
    backgroundColor: 'white',
    padding: '8px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: 'transparent',
    color: '#64748b',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flex: 1,
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
  },
  content: {
    marginTop: '24px',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px',
    backgroundColor: 'white',
    borderRadius: '12px',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    color: '#64748b',
    fontSize: '14px',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardBlue: {
    backgroundColor: '#eff6ff',
    borderLeft: '4px solid #3b82f6',
  },
  cardGreen: {
    backgroundColor: '#f0fdf4',
    borderLeft: '4px solid #22c55e',
  },
  cardOrange: {
    backgroundColor: '#fff7ed',
    borderLeft: '4px solid #f97316',
  },
  cardRed: {
    backgroundColor: '#fef2f2',
    borderLeft: '4px solid #ef4444',
  },
  cardIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b',
    margin: '0 0 8px 0',
  },
  cardNumber: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 4px 0',
  },
  cardSubtext: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  quickStats: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '32px',
  },
  quickStatsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  statsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  statItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500',
  },
  statValue: {
    fontSize: '16px',
    color: '#1e293b',
    fontWeight: '700',
  },
  chartContainer: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '16px',
  },
  chartToggle: {
    display: 'flex',
    gap: '8px',
    backgroundColor: '#f1f5f9',
    padding: '4px',
    borderRadius: '8px',
  },
  toggleBtn: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#64748b',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  toggleBtnActive: {
    backgroundColor: 'white',
    color: '#3b82f6',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  chartPlaceholder: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '2px dashed #e2e8f0',
    marginTop: '16px',
  },
  chartText: {
    marginTop: '16px',
    fontSize: '16px',
    color: '#64748b',
    fontWeight: '500',
  },
  chartSubtext: {
    fontSize: '13px',
    color: '#94a3b8',
    marginTop: '4px',
  },
};

// Add keyframe animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
  
  button:active {
    transform: translateY(0);
  }
`;
document.head.appendChild(styleSheet);

export default ReportList;
