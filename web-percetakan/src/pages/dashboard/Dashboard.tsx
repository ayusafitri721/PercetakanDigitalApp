import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UsersManagement from '../users/UsersManagement';
import ProductList from '../products/ProductList';
import MaterialList from '../materials/MaterialList';
import OrdersList from '../orders/OrdersList';
import ReportList from '../reports/ReportList';
import './Dashboard.css';

const API_BASE_URL = 'http://localhost/api-percetakan/api';

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

type MenuItem =
  | 'dashboard'
  | 'users'
  | 'products'
  | 'materials'
  | 'orders'
  | 'reports';

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
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  // Fetch stats setiap kali menu berubah ke dashboard atau ada refresh trigger
  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, refreshTrigger, activeMenu]);

  // Setup polling untuk auto-refresh setiap 10 detik
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

      // Fetch users
      const usersRes = await axios.get(`${API_BASE_URL}/users.php`);
      const totalCustomers = usersRes.data.data?.total || 0;

      // Fetch products
      const productsRes = await axios.get(`${API_BASE_URL}/products.php`);
      const totalProducts = productsRes.data.data?.total || 0;

      // Fetch materials dengan parsing yang lebih robust
      const materialsRes = await axios.get(`${API_BASE_URL}/materials.php`, {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      console.log('Materials API Response:', materialsRes.data);

      // Parse materials data - handle berbagai struktur response
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

      console.log('Parsed materials:', materialsData);

      const totalMaterials = materialsData.length;
      const lowStockCount = materialsData.filter(
        (m: any) => m.status_stok === 'rendah',
      ).length;

      // Fetch orders
      const ordersRes = await axios.get(`${API_BASE_URL}/orders.php`);
      const ordersData = ordersRes.data.data?.orders || [];
      const totalOrders = ordersData.length;
      const totalRevenue = ordersData
        .filter((o: any) => o.status_pembayaran === 'dibayar')
        .reduce(
          (sum: number, o: any) => sum + (parseFloat(o.total_harga) || 0),
          0,
        );

      setStats({
        totalOrders,
        totalCustomers,
        totalProducts,
        totalMaterials,
        lowStockCount,
        totalRevenue,
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

  // Trigger refresh dari child component
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const menuItems = [
    { id: 'dashboard' as MenuItem, label: 'Dashboard', icon: '📊' },
    { id: 'users' as MenuItem, label: 'Users', icon: '👥' },
    { id: 'products' as MenuItem, label: 'Products', icon: '📦' },
    { id: 'materials' as MenuItem, label: 'Materials', icon: '🧱' },
    { id: 'orders' as MenuItem, label: 'Orders', icon: '🛒' },
    { id: 'reports' as MenuItem, label: 'Reports', icon: '📈' },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <DashboardContent
            stats={stats}
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
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Percetakan</h2>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => setActiveMenu(item.id)}
            >
              <span className="menu-icon">{item.icon}</span>
              {sidebarOpen && <span className="menu-label">{item.label}</span>}
            </button>
          ))}
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
            {sidebarOpen ? 'Logout' : '🚪'}
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>{menuItems.find(m => m.id === activeMenu)?.label}</h1>
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
  loading: boolean;
  onMenuChange: (menu: MenuItem) => void;
  onRefresh: () => void;
}> = ({ stats, loading, onMenuChange, onRefresh }) => {
  return (
    <>
      <div className="welcome-card">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Digital Printing Management System</p>
        </div>
        <button className="btn-refresh" onClick={onRefresh}>
          🔄 Refresh
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                  fill="#ED8936"
                />
              </svg>
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
              <div className="stat-icon">🛒</div>
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
              <div className="stat-icon">👥</div>
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
              <div className="stat-icon">📦</div>
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
              <div className="stat-icon">🧱</div>
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
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3>Total Revenue</h3>
                <p className="stat-number">
                  Rp {stats.totalRevenue.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => onMenuChange('orders')}>
            <span>➕</span> Add Order
          </button>
          <button className="action-btn" onClick={() => onMenuChange('users')}>
            <span>👤</span> Add User
          </button>
          <button
            className="action-btn"
            onClick={() => onMenuChange('products')}
          >
            <span>📦</span> Add Product
          </button>
          <button
            className="action-btn"
            onClick={() => onMenuChange('materials')}
          >
            <span>🧱</span> Add Material
          </button>
          <button
            className="action-btn"
            onClick={() => onMenuChange('reports')}
          >
            <span>📊</span> View Reports
          </button>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
