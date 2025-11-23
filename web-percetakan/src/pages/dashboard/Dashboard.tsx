import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import UsersManagement from '../users/UsersManagement';
import ProductList from '../products/ProductList';
import MaterialList from '../materials/MaterialList';
import OrdersList from '../orders/OrdersList';
import ReportList from '../reports/ReportList';
import './Dashboard.css';

import { API_BASE_URL } from '../../config';

interface User {
  id_user: string;
  nama: string;
  email: string;
  role: string;
  no_telepon: string;
  alamat: string;
}

interface Stats {
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalMaterials: number;
  lowStockCount: number;
  totalRevenue: number;
}

interface RevenueData {
  total_pemasukan: number;
  total_pending: number;
  total_cash: number;
  total_transfer: number;
  total_qris: number;
  paid_transactions: number;
  pending_transactions: number;
}

type MenuItem =
  | 'dashboard'
  | 'users'
  | 'products'
  | 'materials'
  | 'orders'
  | 'reports';

// SVG Icons sebagai komponen
const HomeIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const UsersIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PackageIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const WrenchIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const ShoppingCartIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const BarChartIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const RefreshIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const DollarIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const PieChartIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

const AlertIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const LogOutIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const MenuIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeMenu, setActiveMenu] = useState<MenuItem>('dashboard');
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalMaterials: 0,
    lowStockCount: 0,
    totalRevenue: 0,
  });
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userStr || !token) {
      window.location.href = '/login';
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);
  }, []);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, refreshTrigger, activeMenu]);

  useEffect(() => {
    if (activeMenu === 'dashboard') {
      const interval = setInterval(() => {
        fetchStats();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [activeMenu]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // 1. Fetch ALL Orders
      const ordersRes = await axios.get(`${API_BASE_URL}/orders.php`, {
        params: { _t: Date.now() },
      });

      let ordersData = [];
      if (ordersRes.data.status === 'success') {
        ordersData = ordersRes.data.data?.orders || [];
      }

      // 2. Fetch ALL Payments
      const paymentsRes = await axios.get(`${API_BASE_URL}/payments.php`, {
        params: { _t: Date.now() },
      });

      let paymentsData = [];
      if (paymentsRes.data.status === 'success') {
        paymentsData = paymentsRes.data.data?.payments || [];
      }

      // 3. GABUNGKAN Data Orders dengan Payments (LOGIKA DARI FINANCEREPORT)
      const enrichedTransactions = ordersData.map((order: any) => {
        const payment = paymentsData.find(
          (p: any) => p.id_order === order.id_order,
        );

        return {
          ...order,
          metode_pembayaran: payment?.metode_pembayaran || '-',
          status_pembayaran: payment?.status_pembayaran || 'pending',
          jumlah_bayar: payment ? parseFloat(payment.jumlah_bayar) : 0,
        };
      });

      // 4. Calculate Revenue Statistics (SAMA SEPERTI DI FINANCEREPORT)
      const paidTxs = enrichedTransactions.filter(
        (t: any) =>
          t.status_pembayaran === 'diterima' ||
          t.status_order === 'dibayar' ||
          t.status_order === 'selesai',
      );

      const pendingTxs = enrichedTransactions.filter(
        (t: any) =>
          t.status_pembayaran === 'pending' ||
          (t.status_order === 'pending' && !t.metode_pembayaran),
      );

      const totalPemasukan = paidTxs.reduce(
        (sum: number, t: any) =>
          sum + (t.jumlah_bayar || parseFloat(t.total_harga)),
        0,
      );

      const totalPending = pendingTxs.reduce(
        (sum: number, t: any) => sum + parseFloat(t.total_harga),
        0,
      );

      const totalCash = paidTxs
        .filter((t: any) => t.metode_pembayaran === 'cash')
        .reduce(
          (sum: number, t: any) =>
            sum + (t.jumlah_bayar || parseFloat(t.total_harga)),
          0,
        );

      const totalTransfer = paidTxs
        .filter((t: any) => t.metode_pembayaran === 'transfer')
        .reduce(
          (sum: number, t: any) =>
            sum + (t.jumlah_bayar || parseFloat(t.total_harga)),
          0,
        );

      const totalQris = paidTxs
        .filter((t: any) => t.metode_pembayaran === 'qris')
        .reduce(
          (sum: number, t: any) =>
            sum + (t.jumlah_bayar || parseFloat(t.total_harga)),
          0,
        );

      setRevenueData({
        total_pemasukan: totalPemasukan,
        total_pending: totalPending,
        total_cash: totalCash,
        total_transfer: totalTransfer,
        total_qris: totalQris,
        paid_transactions: paidTxs.length,
        pending_transactions: pendingTxs.length,
      });

      // 5. Fetch other stats
      const usersRes = await axios.get(`${API_BASE_URL}/users.php`);
      const totalCustomers = usersRes.data.data?.total || 0;

      const productsRes = await axios.get(`${API_BASE_URL}/products.php`);
      const totalProducts = productsRes.data.data?.total || 0;

      const materialsRes = await axios.get(`${API_BASE_URL}/materials.php`, {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      let materialsData: any[] = [];
      if (
        materialsRes.data.data &&
        Array.isArray(materialsRes.data.data.materials)
      ) {
        materialsData = materialsRes.data.data.materials;
      } else if (
        materialsRes.data.materials &&
        Array.isArray(materialsRes.data.materials)
      ) {
        materialsData = materialsRes.data.materials;
      } else if (Array.isArray(materialsRes.data.data)) {
        materialsData = materialsRes.data.data;
      } else if (Array.isArray(materialsRes.data)) {
        materialsData = materialsRes.data;
      }

      const totalMaterials = materialsData.length;
      const lowStockCount = materialsData.filter(
        (m: any) => m.status_stok === 'rendah',
      ).length;

      const totalOrders = ordersData.length;

      setStats({
        totalOrders,
        totalCustomers,
        totalProducts,
        totalMaterials,
        lowStockCount,
        totalRevenue: totalPemasukan,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const menuItems = [
    { id: 'dashboard' as MenuItem, label: 'Dashboard', icon: HomeIcon },
    { id: 'users' as MenuItem, label: 'Users', icon: UsersIcon },
    { id: 'products' as MenuItem, label: 'Products', icon: PackageIcon },
    { id: 'materials' as MenuItem, label: 'Materials', icon: WrenchIcon },
    { id: 'orders' as MenuItem, label: 'Orders', icon: ShoppingCartIcon },
    { id: 'reports' as MenuItem, label: 'Reports', icon: BarChartIcon },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <DashboardContent
            stats={stats}
            revenueData={revenueData}
            loading={loading}
            onMenuChange={setActiveMenu}
            onRefresh={triggerRefresh}
          />
        );
      case 'users':
        return <UsersManagement />;
      case 'products':
        return <ProductList />;
      case 'materials':
        return <MaterialList />;
      case 'orders':
        return <OrdersList />;
      case 'reports':
        return <ReportList />;
      default:
        return (
          <DashboardContent
            stats={stats}
            revenueData={revenueData}
            loading={loading}
            onMenuChange={setActiveMenu}
            onRefresh={triggerRefresh}
          />
        );
    }
  };

  if (!user) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {isMobile && sidebarOpen && (
        <div
          className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
          onClick={toggleSidebar}
        ></div>
      )}

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img
              src="/public/images/Logo-Im.png"
              alt="PrintyGo Logo"
              className="logo-image"
            />
            {sidebarOpen && <h2>PrintifyGo</h2>}
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </button>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map(item => {
            const IconComponent = item.icon;
            const hasNotification =
              item.id === 'materials' && stats.lowStockCount > 0;

            return (
              <button
                key={item.id}
                className={`menu-item ${
                  activeMenu === item.id ? 'active' : ''
                }`}
                onClick={() => {
                  setActiveMenu(item.id);
                  if (isMobile) setSidebarOpen(false);
                }}
              >
                <span className="menu-icon">
                  <IconComponent />
                </span>
                {sidebarOpen && (
                  <span className="menu-label">{item.label}</span>
                )}
                {hasNotification && (
                  <span className="menu-badge">{stats.lowStockCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">{user.nama.charAt(0)}</div>
            {sidebarOpen && (
              <div className="user-info">
                <p className="user-name">{user.nama}</p>
                <p className="user-role">{user.role}</p>
              </div>
            )}
          </div>
          <button className="btn-logout-sidebar" onClick={handleLogout}>
            <LogOutIcon />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            {isMobile && (
              <button className="btn-menu-mobile" onClick={toggleSidebar}>
                <MenuIcon />
              </button>
            )}
            <h1>{menuItems.find(m => m.id === activeMenu)?.label}</h1>
          </div>
          <div className="header-actions">
            <span className="user-greeting">Welcome, {user.nama}</span>
          </div>
        </header>

        <div className="admin-content">{renderContent()}</div>
      </main>
    </div>
  );
};

const DashboardContent: React.FC<{
  stats: Stats;
  revenueData: RevenueData | null;
  loading: boolean;
  onMenuChange: (menu: MenuItem) => void;
  onRefresh: () => void;
}> = ({ stats, revenueData, loading, onMenuChange, onRefresh }) => {
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const revenueChartData = revenueData
    ? [
        {
          name: 'Lunas',
          amount: revenueData.total_pemasukan,
          fill: '#4CAF50',
        },
        {
          name: 'Pending',
          amount: revenueData.total_pending,
          fill: '#FFA726',
        },
      ]
    : [];

  const paymentMethodData = revenueData
    ? [
        { name: 'Cash', value: revenueData.total_cash, color: '#66BB6A' },
        {
          name: 'Transfer',
          value: revenueData.total_transfer,
          color: '#42A5F5',
        },
        { name: 'QRIS', value: revenueData.total_qris, color: '#AB47BC' },
      ].filter(item => item.value > 0)
    : [];

  return (
    <>
      <div className="welcome-card">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Digital Printing Management System</p>
        </div>
        <button className="btn-refresh" onClick={onRefresh}>
          <RefreshIcon />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading statistics...</p>
        </div>
      ) : (
        <>
          {stats.lowStockCount > 0 && (
            <div className="alert alert-warning">
              <AlertIcon />
              <span>
                <strong>Warning!</strong> {stats.lowStockCount} materials with
                low stock
              </span>
            </div>
          )}

          <div className="stats-grid">
            <div
              className="stat-card"
              onClick={() => onMenuChange('orders')}
              style={{ cursor: 'pointer' }}
            >
              <div
                className="stat-icon"
                style={{
                  background:
                    'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                  color: '#1e40af',
                }}
              >
                <ShoppingCartIcon />
              </div>
              <div className="stat-info">
                <h3>Total Orders</h3>
                <p className="stat-number">{stats.totalOrders}</p>
              </div>
            </div>

            <div
              className="stat-card"
              onClick={() => onMenuChange('users')}
              style={{ cursor: 'pointer' }}
            >
              <div
                className="stat-icon"
                style={{
                  background:
                    'linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%)',
                  color: '#7c3aed',
                }}
              >
                <UsersIcon />
              </div>
              <div className="stat-info">
                <h3>Total Customers</h3>
                <p className="stat-number">{stats.totalCustomers}</p>
              </div>
            </div>

            <div
              className="stat-card"
              onClick={() => onMenuChange('products')}
              style={{ cursor: 'pointer' }}
            >
              <div
                className="stat-icon"
                style={{
                  background:
                    'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                  color: '#047857',
                }}
              >
                <PackageIcon />
              </div>
              <div className="stat-info">
                <h3>Products</h3>
                <p className="stat-number">{stats.totalProducts}</p>
              </div>
            </div>

            <div
              className="stat-card"
              onClick={() => onMenuChange('materials')}
              style={{ cursor: 'pointer' }}
            >
              <div
                className="stat-icon"
                style={{
                  background:
                    'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
                  color: '#c2410c',
                }}
              >
                <WrenchIcon />
              </div>
              <div className="stat-info">
                <h3>Materials</h3>
                <p className="stat-number">{stats.totalMaterials}</p>
                {stats.lowStockCount > 0 && (
                  <small className="stat-warning">
                    {stats.lowStockCount} low stock
                  </small>
                )}
              </div>
            </div>

            <div className="stat-card stat-card-revenue">
              <div
                className="stat-icon"
                style={{
                  background:
                    'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  color: '#b45309',
                }}
              >
                <TrendingUpIcon />
              </div>
              <div className="stat-info">
                <h3>Total Revenue</h3>
                <p className="stat-number">
                  {formatRupiah(stats.totalRevenue)}
                </p>
                {revenueData && (
                  <small style={{ fontSize: '11px', color: '#6b7280' }}>
                    {revenueData.paid_transactions} transaksi lunas
                  </small>
                )}
              </div>
            </div>
          </div>

          {revenueData && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  window.innerWidth > 768 ? '1fr 1fr' : '1fr',
                gap: '20px',
                marginBottom: '26px',
              }}
            >
              <div
                style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  border: '1px solid #e8ecef',
                }}
              >
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <BarChartIcon /> Status Pendapatan
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      tickFormatter={value =>
                        `${(value / 1000000).toFixed(1)}jt`
                      }
                    />
                    <Tooltip
                      formatter={(value: number) => formatRupiah(value)}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div
                  style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-around',
                    fontSize: '13px',
                  }}
                >
                  <div>
                    <span style={{ color: '#6b7280' }}>Lunas: </span>
                    <strong style={{ color: '#4CAF50' }}>
                      {revenueData.paid_transactions}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280' }}>Pending: </span>
                    <strong style={{ color: '#FFA726' }}>
                      {revenueData.pending_transactions}
                    </strong>
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  border: '1px solid #e8ecef',
                }}
              >
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <PieChartIcon /> Metode Pembayaran
                </h3>
                {paymentMethodData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={paymentMethodData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }: any) =>
                            `${name} ${((percent || 0) * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {paymentMethodData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatRupiah(value)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div
                      style={{
                        marginTop: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      {paymentMethodData.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '6px',
                            fontSize: '13px',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            <div
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '3px',
                                backgroundColor: item.color,
                              }}
                            ></div>
                            <span style={{ color: '#6b7280' }}>
                              {item.name}
                            </span>
                          </div>
                          <strong style={{ color: '#1f2937' }}>
                            {formatRupiah(item.value)}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '300px',
                      color: '#9ca3af',
                      fontSize: '14px',
                    }}
                  >
                    Belum ada data pembayaran
                  </div>
                )}
              </div>
            </div>
          )}

          {revenueData && (
            <div
              style={{
                background: 'white',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid #e8ecef',
                marginBottom: '26px',
              }}
            >
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <DollarIcon /> Ringkasan Keuangan
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    window.innerWidth > 768 ? 'repeat(3, 1fr)' : '1fr',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: '#e0f2fe',
                    borderRadius: '10px',
                    border: '1px solid #7dd3fc',
                  }}
                >
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#075985',
                      marginBottom: '8px',
                    }}
                  >
                    Total Pemasukan (Lunas)
                  </div>
                  <div
                    style={{
                      fontSize: '22px',
                      fontWeight: 'bold',
                      color: '#0369a1',
                    }}
                  >
                    {formatRupiah(revenueData.total_pemasukan)}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#0c4a6e',
                      marginTop: '4px',
                    }}
                  >
                    {revenueData.paid_transactions} transaksi
                  </div>
                </div>

                <div
                  style={{
                    padding: '16px',
                    backgroundColor: '#dbeafe',
                    borderRadius: '10px',
                    border: '1px solid #93c5fd',
                  }}
                >
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#1e3a8a',
                      marginBottom: '8px',
                    }}
                  >
                    Pending Payment
                  </div>
                  <div
                    style={{
                      fontSize: '22px',
                      fontWeight: 'bold',
                      color: '#1e40af',
                    }}
                  >
                    {formatRupiah(revenueData.total_pending)}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#1e40af',
                      marginTop: '4px',
                    }}
                  >
                    {revenueData.pending_transactions} transaksi
                  </div>
                </div>

                <div
                  style={{
                    padding: '16px',
                    backgroundColor: '#1e40af',
                    borderRadius: '10px',
                    border: '1px solid #1e3a8a',
                  }}
                >
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#e0f2fe',
                      marginBottom: '8px',
                    }}
                  >
                    Total Potensi
                  </div>
                  <div
                    style={{
                      fontSize: '22px',
                      fontWeight: 'bold',
                      color: '#ffffff',
                    }}
                  >
                    {formatRupiah(
                      revenueData.total_pemasukan + revenueData.total_pending,
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#bfdbfe',
                      marginTop: '4px',
                    }}
                  >
                    Lunas + Pending
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button
            className="action-btn action-btn-blue"
            onClick={() => onMenuChange('orders')}
          >
            <ShoppingCartIcon />
            <span>Add Order</span>
          </button>
          <button
            className="action-btn action-btn-purple"
            onClick={() => onMenuChange('users')}
          >
            <UsersIcon />
            <span>Add User</span>
          </button>
          <button
            className="action-btn action-btn-green"
            onClick={() => onMenuChange('products')}
          >
            <PackageIcon />
            <span>Add Product</span>
          </button>
          <button
            className="action-btn action-btn-orange"
            onClick={() => onMenuChange('materials')}
          >
            <WrenchIcon />
            <span>Add Material</span>
          </button>
          <button
            className="action-btn action-btn-indigo"
            onClick={() => onMenuChange('reports')}
          >
            <BarChartIcon />
            <span>View Reports</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
