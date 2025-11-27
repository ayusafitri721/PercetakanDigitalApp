// KasirDashboardWithSidebar.tsx - COLLAPSIBLE SIDEBAR VERSION WITH LOGOUT & SETTINGS
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LayoutDashboard,
  ShoppingCart,
  PlusCircle,
  FileText,
  Settings,
  LogOut,
  Menu,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import StatsCards from './components/StatsCards';
import RevenueSection from './components/RevenueSection';
import OrdersTable from './components/OrdersTable';
import OrderDetailModal from './components/OrderDetailModal';
import PeriodFilter from './components/PeriodFilter';
import CreateOrderKasir from './components/CreateOrderKasir';
import SettingsPage from './SettingsPage';
import {
  formatRupiah,
  formatDate,
  formatFileSize,
  getStatusLabel,
  getStatusColor,
  getStatusPembayaran,
  getStatusPembayaranColor,
  calculateStats,
  calculateRevenueData,
  filterOrdersByPeriod,
} from './utils/kasirUtils';
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
  metode_pembayaran?: string;
  jumlah_bayar?: number;
  jenis_order?: string;
  tanggal_order: string;
  tanggal_selesai?: string;
  items?: OrderItem[];
  design_files?: DesignFile[];
  result_files?: ResultFile[];
}

interface Stats {
  todayOrders: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  pendingPayment: number;
  pendingPaymentAmount: number;
  completedToday: number;
  completedTodayRevenue: number;
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

interface UserData {
  nama: string;
  email: string;
  no_telepon?: string;
  role: string;
}

// ============= SIDEBAR COMPONENT =============
interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentUser: UserData;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeMenu,
  onMenuChange,
  isMobileOpen,
  onMobileClose,
  isCollapsed,
  onToggleCollapse,
  currentUser,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { id: 'orders', label: 'Pesanan', Icon: ShoppingCart },
    { id: 'create', label: 'Buat Pesanan', Icon: PlusCircle },
    { id: 'reports', label: 'Laporan', Icon: FileText },
    { id: 'settings', label: 'Pengaturan', Icon: Settings },
  ];

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
  };

  return (
    <>
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            display: 'none',
          }}
          className="mobile-overlay"
        />
      )}

      <aside
        style={{
          width: isCollapsed ? '80px' : '280px',
          background: 'linear-gradient(180deg, #1e3a5f 0%, #152844 100%)',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          padding: '2rem 0',
          boxShadow: '4px 0 12px rgba(0,0,0,0.2)',
          zIndex: 1000,
          transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'all 0.3s ease',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
        className="sidebar"
      >
        <div
          style={{
            padding: isCollapsed ? '0 1rem' : '0 1.5rem',
            marginBottom: '2rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flex: 1,
            }}
          >
            <img
              src="/images/logoprin.png"
              alt="PrintifyGo Logo"
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
            {!isCollapsed && (
              <h1
                style={{
                  color: 'white',
                  fontSize: '1.4rem',
                  margin: 0,
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                PrintifyGo
              </h1>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
            className="toggle-sidebar-btn-header"
          >
            {isCollapsed ? (
              <ChevronRight size={18} color="white" strokeWidth={2.5} />
            ) : (
              <ChevronLeft size={18} color="white" strokeWidth={2.5} />
            )}
          </button>
        </div>

        <nav style={{ padding: '0 0.75rem' }}>
          {menuItems.map(item => {
            const IconComponent = item.Icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onMenuChange(item.id);
                  onMobileClose();
                }}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  margin: '0.25rem 0',
                  background: isActive ? 'white' : 'transparent',
                  border: 'none',
                  borderRadius: '10px',
                  color: isActive ? '#1e3a5f' : 'rgba(255,255,255,0.85)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  gap: '0.875rem',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
                title={isCollapsed ? item.label : ''}
              >
                <IconComponent size={20} strokeWidth={2.5} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div
          style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '0.75rem',
            right: '0.75rem',
          }}
        >
          {!isCollapsed && (
            <div
              style={{
                padding: '1rem',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: 'white',
                marginBottom: '0.75rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#667eea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    flexShrink: 0,
                  }}
                >
                  {currentUser.nama.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                    {currentUser.nama}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      opacity: 0.8,
                      textTransform: 'capitalize',
                    }}
                  >
                    {currentUser.role}
                  </div>
                </div>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#667eea',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                {currentUser.nama.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              background: 'transparent',
              border: '1.5px solid rgba(255,107,107,0.5)',
              borderRadius: '10px',
              color: '#ff6b6b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
            }}
            title="Logout"
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,107,107,0.1)';
              e.currentTarget.style.borderColor = 'rgba(255,107,107,0.8)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255,107,107,0.5)';
            }}
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <style>{`
        @media (min-width: 769px) {
          .sidebar { transform: translateX(0) !important; }
          .mobile-overlay { display: none !important; }
        }
        @media (max-width: 768px) {
          .mobile-overlay { display: block !important; }
          .toggle-sidebar-btn-header { display: none !important; }
        }
        .toggle-sidebar-btn-header:hover {
          background: rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.3);
        }
      `}</style>
    </>
  );
};

// ============= MAIN COMPONENT =============
const KasirDashboardWithSidebar: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month'>(
    'today',
  );

  const [currentUser, setCurrentUser] = useState<UserData>({
    nama: 'Kasir Utama',
    email: 'kasir@printifygo.com',
    no_telepon: '08123456789',
    role: 'kasir',
  });

  const [stats, setStats] = useState<Stats>({
    todayOrders: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    pendingPayment: 0,
    pendingPaymentAmount: 0,
    completedToday: 0,
    completedTodayRevenue: 0,
  });

  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);

  useEffect(() => {
    // Load user data dari localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser({
          nama: user.nama || 'Kasir Utama',
          email: user.email || 'kasir@printifygo.com',
          no_telepon: user.no_telepon || '08123456789',
          role: user.role || 'kasir',
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const filtered = filterOrdersByPeriod(allOrders, filterPeriod);
    setFilteredOrders(filtered);
  }, [filterPeriod, allOrders]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const ordersRes = await axios.get(`${API_BASE_URL}/orders.php`, {
        params: { _t: Date.now() },
      });

      let ordersData: Order[] = [];
      if (ordersRes.data.status === 'success') {
        ordersData = ordersRes.data.data?.orders || [];
      }

      const paymentsRes = await axios.get(`${API_BASE_URL}/payments.php`, {
        params: { _t: Date.now() },
      });

      let paymentsData: any[] = [];
      if (paymentsRes.data.status === 'success') {
        paymentsData = paymentsRes.data.data?.payments || [];
      }

      const enrichedOrders = ordersData.map(order => {
        const payment = paymentsData.find(p => p.id_order === order.id_order);
        return {
          ...order,
          metode_pembayaran: payment?.metode_pembayaran || undefined,
          status_pembayaran: payment?.status_pembayaran || 'pending',
          jumlah_bayar: payment ? parseFloat(payment.jumlah_bayar) : undefined,
        };
      });

      setAllOrders(enrichedOrders);
      setStats(calculateStats(enrichedOrders));
      setRevenueData(calculateRevenueData(enrichedOrders));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (order: Order) => {
    try {
      const orderResponse = await axios.get(`${API_BASE_URL}/orders.php`, {
        params: { op: 'detail', id: order.id_order },
      });
      if (orderResponse.data.status !== 'success')
        throw new Error('Gagal ambil detail');
      let orderDetail = orderResponse.data.data;

      try {
        const filesResponse = await axios.get(
          `${API_BASE_URL}/design_files.php`,
          {
            params: { op: 'by_order', id_order: order.id_order },
          },
        );
        if (filesResponse.data.status === 'success') {
          orderDetail.design_files = filesResponse.data.data?.files || [];
        }
      } catch {}

      try {
        const resultResponse = await axios.get(
          `${API_BASE_URL}/result_files.php`,
          {
            params: { op: 'by_order', id_order: order.id_order },
          },
        );
        if (resultResponse.data.status === 'success') {
          orderDetail.result_files = resultResponse.data.data?.files || [];
        }
      } catch {}

      setSelectedOrder(orderDetail);
      setShowDetailModal(true);
    } catch {
      alert('Gagal memuat detail pesanan');
    }
  };

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    const downloadUrl = `${API_BASE_URL}/download_file.php?file=${encodeURIComponent(
      fileUrl,
    )}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintInvoice = (order: Order) => {
    window.open(`/invoice/${order.id_order}`, '_blank');
  };

  const handleMenuChange = (menu: string) => {
    setActiveMenu(menu);
    if (menu === 'create') setShowCreateOrder(true);
  };

  const getPageTitle = () => {
    switch (activeMenu) {
      case 'dashboard':
        return 'Dashboard';
      case 'orders':
        return 'Pesanan';
      case 'create':
        return 'Buat Pesanan';
      case 'reports':
        return 'Laporan';
      case 'settings':
        return 'Pengaturan';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7fafc' }}>
      <Sidebar
        activeMenu={activeMenu}
        onMenuChange={handleMenuChange}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        currentUser={currentUser}
      />

      <main
        style={{
          marginLeft: isSidebarCollapsed ? '80px' : '280px',
          flex: 1,
          transition: 'margin-left 0.3s ease',
        }}
        className="main-content"
      >
        <div
          style={{
            background: 'white',
            borderBottom: '1px solid #e2e8f0',
            padding: '20px 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#2d3748',
              }}
              className="mobile-menu-btn"
            >
              <Menu size={24} />
            </button>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#2d3748',
                margin: 0,
              }}
            >
              {getPageTitle()}
            </h1>
          </div>
          <div
            style={{
              fontSize: '15px',
              color: '#718096',
              fontWeight: '500',
            }}
          >
            Welcome,{' '}
            <span style={{ color: '#2d3748' }}>{currentUser.nama}</span>
          </div>
        </div>

        <div className="kasir-container">
          {activeMenu === 'dashboard' && (
            <div
              style={{
                background: 'linear-gradient(135deg, #3b5998 0%, #2d4373 100%)',
                borderRadius: '16px',
                padding: '32px 40px',
                marginBottom: '30px',
                boxShadow: '0 4px 20px rgba(59, 89, 152, 0.15)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px',
              }}
            >
              <div>
                <h2
                  style={{
                    color: 'white',
                    fontSize: '32px',
                    fontWeight: '700',
                    margin: '0 0 8px 0',
                  }}
                >
                  Dashboard Kasir
                </h2>
                <p
                  style={{
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontSize: '16px',
                    margin: 0,
                  }}
                >
                  Digital Printing Management System
                </p>
              </div>
              <button
                onClick={fetchOrders}
                disabled={loading}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1.5px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.currentTarget.style.background =
                      'rgba(255, 255, 255, 0.25)';
                    e.currentTarget.style.borderColor =
                      'rgba(255, 255, 255, 0.5)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.borderColor =
                    'rgba(255, 255, 255, 0.3)';
                }}
              >
                <RefreshCw
                  size={18}
                  style={{
                    animation: loading ? 'spin 1s linear infinite' : 'none',
                  }}
                />
                <span>Refresh</span>
              </button>
            </div>
          )}

          {activeMenu === 'dashboard' && (
            <>
              <StatsCards stats={stats} formatRupiah={formatRupiah} />

              {revenueData && (
                <RevenueSection
                  revenueData={revenueData}
                  formatRupiah={formatRupiah}
                />
              )}

              <div className="kasir-actions">
                <button
                  className="btn-primary btn-large"
                  onClick={() => setShowCreateOrder(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    background:
                      'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    border: 'none',
                    padding: '14px 28px',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                      '0 6px 20px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 4px 12px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  <PlusCircle size={20} strokeWidth={2.5} />
                  Buat Pesanan Baru
                </button>
              </div>

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
                  <PeriodFilter
                    filterPeriod={filterPeriod}
                    onFilterChange={setFilterPeriod}
                  />
                </div>

                <OrdersTable
                  orders={filteredOrders}
                  loading={loading}
                  formatRupiah={formatRupiah}
                  formatDate={formatDate}
                  getStatusLabel={getStatusLabel}
                  getStatusColor={getStatusColor}
                  getStatusPembayaran={getStatusPembayaran}
                  getStatusPembayaranColor={getStatusPembayaranColor}
                  onViewDetail={handleViewDetail}
                  onPrintInvoice={handlePrintInvoice}
                  onRefresh={fetchOrders}
                />
              </div>
            </>
          )}

          {activeMenu === 'orders' && (
            <div className="kasir-orders">
              <h2>Semua Pesanan</h2>
              <OrdersTable
                orders={allOrders}
                loading={loading}
                formatRupiah={formatRupiah}
                formatDate={formatDate}
                getStatusLabel={getStatusLabel}
                getStatusColor={getStatusColor}
                getStatusPembayaran={getStatusPembayaran}
                getStatusPembayaranColor={getStatusPembayaranColor}
                onViewDetail={handleViewDetail}
                onPrintInvoice={handlePrintInvoice}
                onRefresh={fetchOrders}
              />
            </div>
          )}

          {activeMenu === 'settings' && (
            <div style={{ padding: '0 40px' }}>
              <SettingsPage currentUser={currentUser} />
            </div>
          )}

          {showDetailModal && selectedOrder && (
            <OrderDetailModal
              order={selectedOrder}
              onClose={() => setShowDetailModal(false)}
              onDownloadFile={handleDownloadFile}
              onPrintInvoice={handlePrintInvoice}
              formatRupiah={formatRupiah}
              formatDate={formatDate}
              formatFileSize={formatFileSize}
              getStatusLabel={getStatusLabel}
              getStatusPembayaran={getStatusPembayaran}
            />
          )}

          {showCreateOrder && (
            <CreateOrderKasir
              onClose={success => {
                setShowCreateOrder(false);
                if (success) fetchOrders();
              }}
            />
          )}
        </div>
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .main-content { margin-left: 0 !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default KasirDashboardWithSidebar;
