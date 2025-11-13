// KasirDashboardWithSidebar.tsx - FULL VERSION
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  PlusCircle, 
  FileText, 
  Settings,
  LogOut,
  Menu
} from 'lucide-react';
import StatsCards from './components/StatsCards';
import OrdersTable from './components/OrdersTable';
import OrderDetailModal from './components/OrderDetailModal';
import PeriodFilter from './components/PeriodFilter';
import CreateOrderKasir from './CreateOrderKasir';
import {
  formatRupiah,
  formatDate,
  formatFileSize,
  getStatusLabel,
  getStatusColor,
  getStatusPembayaran,
  getStatusPembayaranColor,
  calculateStats,
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
  jenis_order?: string;
  tanggal_order: string;
  tanggal_selesai?: string;
  items?: OrderItem[];
  design_files?: DesignFile[];
  result_files?: ResultFile[];
}

// ============= SIDEBAR COMPONENT =============
interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeMenu,
  onMenuChange,
  isMobileOpen,
  onMobileClose,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { id: 'orders', label: 'Pesanan', Icon: ShoppingCart },
    { id: 'create', label: 'Buat Pesanan', Icon: PlusCircle },
    { id: 'reports', label: 'Laporan', Icon: FileText },
    { id: 'settings', label: 'Pengaturan', Icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
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

      {/* Sidebar */}
      <aside
        style={{
          width: '250px',
          background: 'linear-gradient(180deg, #3b5998 0%, #2d4373 100%)',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          padding: '2rem 0',
          boxShadow: '4px 0 12px rgba(0,0,0,0.1)',
          zIndex: 1000,
          transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          overflowY: 'auto',
        }}
        className="sidebar"
      >
        {/* Logo */}
        <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.5rem',
            }}
          >
            <div
              style={{
                width: '45px',
                height: '45px',
                background: 'white',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}
            >
              
            </div>
            <div>
              <h1
                style={{
                  color: 'white',
                  fontSize: '1.25rem',
                  margin: 0,
                  fontWeight: 'bold',
                }}
              >
                PrintifyGo
              </h1>
            </div>
          </div>
        </div>

        {/* Menu Items */}
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
                  color: isActive ? '#3b5998' : 'rgba(255,255,255,0.85)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                  }
                }}
              >
                <IconComponent
                  size={20}
                  strokeWidth={2.5}
                  style={{ flexShrink: 0 }}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div
          style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '0.75rem',
            right: '0.75rem',
          }}
        >
          {/* User Card */}
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
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
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
                  fontSize: '1rem',
                }}
              >
                A
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                  Kasir Utama
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Kasir</div>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
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
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,107,107,0.1)';
              e.currentTarget.style.borderColor = '#ff6b6b';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255,107,107,0.5)';
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Styles */}
      <style>{`
        @media (min-width: 769px) {
          .sidebar {
            transform: translateX(0) !important;
          }
          .mobile-overlay {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .mobile-overlay {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
};

// ============= MAIN COMPONENT =============
const KasirDashboardWithSidebar: React.FC = () => {
  // Sidebar state
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Existing states from original component
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

  // Fetch orders on mount and set interval
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter orders when period or orders change
  useEffect(() => {
    const filtered = filterOrdersByPeriod(allOrders, filterPeriod);
    setFilteredOrders(filtered);
  }, [filterPeriod, allOrders]);

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/orders.php`);
      if (response.data.status === 'success') {
        const orders = response.data.data?.orders || [];
        setAllOrders(orders);
        setStats(calculateStats(orders));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle view order detail
  const handleViewDetail = async (order: Order) => {
    try {
      // Fetch order detail
      const orderResponse = await axios.get(`${API_BASE_URL}/orders.php`, {
        params: { op: 'detail', id: order.id_order },
        headers: { Accept: 'application/json' },
      });
      if (orderResponse.data.status !== 'success')
        throw new Error('Gagal ambil detail order');
      let orderDetail = orderResponse.data.data;

      // Fetch design files
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
      } catch {
        orderDetail.design_files = [];
      }

      // Fetch result files
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
      } catch {
        orderDetail.result_files = [];
      }

      setSelectedOrder(orderDetail);
      setShowDetailModal(true);
    } catch (error: any) {
      alert('Gagal memuat detail pesanan');
    }
  };

  // Handle file download
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

  // Handle print invoice
  const handlePrintInvoice = (order: Order) => {
    window.open(`/invoice/${order.id_order}`, '_blank');
  };

  // Handle menu change - auto open create order modal
  const handleMenuChange = (menu: string) => {
    setActiveMenu(menu);
    if (menu === 'create') {
      setShowCreateOrder(true);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7fafc' }}>
      {/* Sidebar */}
      <Sidebar
        activeMenu={activeMenu}
        onMenuChange={handleMenuChange}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <main
        style={{
          marginLeft: '250px',
          flex: 1,
          transition: 'margin-left 0.3s ease',
        }}
        className="main-content"
      >
        <div className="kasir-container">
          {/* Mobile Header */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
            }}
            className="mobile-header"
          >
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              style={{
                background: 'white',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Menu size={24} color="#2d3748" />
            </button>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#2d3748' }}>
              Dashboard Kasir
            </h2>
            <div style={{ width: '40px' }} />
          </div>

          {/* Content based on active menu */}
          {activeMenu === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <StatsCards stats={stats} formatRupiah={formatRupiah} />

              {/* Action Button */}
              <div className="kasir-actions">
                <button
                  className="btn-primary btn-large"
                  onClick={() => setShowCreateOrder(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <PlusCircle size={20} strokeWidth={2.5} />
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
              <h2 style={{ marginBottom: '1rem' }}>Semua Pesanan</h2>
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

          {activeMenu === 'create' && (
            <div
              style={{
                background: 'white',
                padding: '3rem 2rem',
                borderRadius: '16px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                textAlign: 'center',
              }}
            >
              <div style={{ 
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}>
                <PlusCircle size={40} color="white" strokeWidth={2.5} />
              </div>
              <h3
                style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '1.5rem',
                  color: '#1a202c',
                }}
              >
                Buat Pesanan Baru
              </h3>
              <p
                style={{
                  color: '#718096',
                  marginBottom: '2rem',
                  fontSize: '0.95rem',
                }}
              >
                Tambahkan pesanan offline atau online baru ke sistem
              </p>
              <button
                onClick={() => setShowCreateOrder(true)}
                style={{
                  padding: '1rem 2rem',
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 6px 20px rgba(102, 126, 234, 0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
              >
                <PlusCircle size={20} strokeWidth={2.5} />
                Mulai Buat Pesanan
              </button>
            </div>
          )}

          {(activeMenu === 'reports' || activeMenu === 'settings') && (
            <div
              style={{
                background: 'white',
                padding: '3rem 2rem',
                borderRadius: '16px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                textAlign: 'center',
              }}
            >
              <div style={{ 
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}>
                <Settings size={40} color="white" strokeWidth={2.5} />
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#1a202c' }}>
                Dalam Pengembangan
              </h3>
              <p style={{ color: '#718096' }}>
                Fitur ini sedang dalam proses pengembangan
              </p>
            </div>
          )}

          {/* Detail Modal */}
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
      </main>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
          }
          .mobile-header {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default KasirDashboardWithSidebar;