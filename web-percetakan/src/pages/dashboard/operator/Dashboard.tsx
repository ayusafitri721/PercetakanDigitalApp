// Dashboard.tsx - MODERN UI WITH SIDEBAR
import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import {
  Printer,
  RefreshCw,
  ClipboardList,
  BarChart3,
  CheckCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  Play,
  CheckSquare,
  X,
  Clock,
  Zap,
  Phone,
  Mail,
  FileText,
  Store,
  Globe,
  LogOut,
  AlertTriangle,
} from 'lucide-react';

// Import types (dengan type-only import)
import type { Order, Stats } from './operatorTypes';

// Import utilities
import {
  formatRupiah,
  calculateStats,
  filterQueueOrders,
  apiService,
} from './operatorUtils';

// Import components
import {
  StatsCards,
  QueueTable,
  DesignFilesSection,
  OrderItemsSection,
  UploadResultModal,
} from './OperatorComponents';

const OperatorDashboard: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploadingResult, setUploadingResult] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [orderToComplete, setOrderToComplete] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    todayQueue: 0,
    inProgress: 0,
    todayCompleted: 0,
    expressQueue: 0,
  });

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const response = await apiService.fetchOrders();

      if (response.status === 'success') {
        const allOrders = response.data.orders || [];
        const queue = filterQueueOrders(allOrders);
        setOrders(queue);
        setStats(calculateStats(queue, allOrders));
      }
    } catch (error) {
      console.error('Fetch queue error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (order: Order) => {
    try {
      const orderDetail = await apiService.fetchOrderDetail(order.id_order);
      setSelectedOrder(orderDetail);
      setShowDetail(true);
    } catch (error: any) {
      console.error('Error fetching detail:', error);
      alert('Gagal memuat detail pesanan');
    }
  };

  const handleStartComplete = (orderId: string) => {
    setOrderToComplete(orderId);
    setShowUploadModal(true);
  };

  const handleFileResultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert('Ukuran file maksimal 20MB!');
        return;
      }

      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/pdf',
      ];
      if (!allowedTypes.includes(file.type)) {
        alert('Format file harus JPG, PNG, atau PDF!');
        return;
      }

      setResultFile(file);
    }
  };

  const handleUploadResultAndComplete = async () => {
    if (!resultFile) {
      alert('⚠️ Silakan upload file hasil terlebih dahulu!');
      return;
    }

    if (!orderToComplete) return;

    setUploadingResult(true);
    try {
      // Step 1: Upload file
      const uploadedFile = await apiService.uploadFile(resultFile);

      // Step 2: Create result_files record
      await apiService.createResultFile({
        id_order: orderToComplete,
        nama_file: uploadedFile.file_name,
        file_url: uploadedFile.file_url,
        ukuran_file: resultFile.size,
        tipe_file: resultFile.type,
        keterangan: 'File hasil cetakan dari operator',
      });

      // Step 3: Update status ke "selesai"
      const statusResponse = await apiService.updateOrderStatus(
        orderToComplete,
        'selesai',
      );

      if (statusResponse.status === 'success') {
        alert(
          `✅ PESANAN SELESAI!\n\n📁 File hasil: ${resultFile.name}\n📦 Status: Selesai\n🎯 Pesanan sudah dikirim ke KASIR untuk diserahkan ke customer.\n\n✨ File hasil sudah tersimpan dan bisa di-download oleh kasir!`,
        );

        setShowUploadModal(false);
        setResultFile(null);
        setOrderToComplete(null);
        fetchQueue();
        if (showDetail) setShowDetail(false);
      } else {
        throw new Error('Gagal update status order');
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert(
        '❌ Gagal menyimpan hasil: ' +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setUploadingResult(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const statusMap: { [key: string]: { db: string; label: string } } = {
      start: { db: 'diproses', label: 'MULAI CETAK' },
      complete: { db: 'selesai', label: 'SELESAI DIKERJAKAN' },
    };

    const statusInfo = statusMap[newStatus];
    if (!statusInfo) return;

    if (!confirm(`Ubah status pesanan menjadi "${statusInfo.label}"?`)) return;

    setUpdating(true);
    try {
      const response = await apiService.updateOrderStatus(
        orderId,
        statusInfo.db,
      );

      if (response.status === 'success') {
        if (newStatus === 'complete') {
          alert(
            '✅ Pesanan selesai dikerjakan!\n📦 Pesanan sudah dikirim ke kasir untuk diserahkan ke customer.',
          );
        } else {
          alert('✅ Status berhasil diupdate!');
        }
        fetchQueue();
        if (showDetail) setShowDetail(false);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('Update error:', error);
      alert(
        '❌ Gagal update status: ' +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    try {
      const downloadUrl = apiService.getDownloadUrl(fileUrl);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      alert('Gagal download file');
    }
  };

  const handleLogout = () => {
    // Clear any stored auth data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');

    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <Printer size={24} />
            </div>
            {!sidebarCollapsed && <span className="logo-text">PrintifyGo</span>}
          </div>
          <button
            className="toggle-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
        </div>

        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <ClipboardList className="nav-icon" size={20} />
            {!sidebarCollapsed && <span className="nav-text">Queue</span>}
          </a>
          <a href="#" className="nav-item">
            <BarChart3 className="nav-icon" size={20} />
            {!sidebarCollapsed && <span className="nav-text">Statistics</span>}
          </a>
          <a href="#" className="nav-item">
            <CheckCircle className="nav-icon" size={20} />
            {!sidebarCollapsed && <span className="nav-text">Completed</span>}
          </a>
          <a href="#" className="nav-item">
            <Settings className="nav-icon" size={20} />
            {!sidebarCollapsed && <span className="nav-text">Settings</span>}
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <User size={20} />
            </div>
            {!sidebarCollapsed && (
              <div className="user-info">
                <div className="user-name">Operator</div>
                <div className="user-role">Staff</div>
              </div>
            )}
          </div>

          <button
            className="btn-logout"
            onClick={() => setShowLogoutModal(true)}
            title="Logout"
          >
            <LogOut size={20} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-header">
          <div>
            <h1>Operator Dashboard</h1>
            <p>Manage and process print orders</p>
          </div>
          <button
            onClick={fetchQueue}
            disabled={loading}
            className="btn-refresh"
          >
            <RefreshCw
              className={`btn-icon ${loading ? 'spinning' : ''}`}
              size={18}
            />
            <span>{loading ? 'Loading...' : 'Refresh'}</span>
          </button>
        </div>

        <StatsCards stats={stats} />

        <div className="queue-section">
          <div className="section-header">
            <div>
              <h2>Print Queue</h2>
              <p>{orders.length} orders ready • Auto-refresh every 30s</p>
            </div>
          </div>

          <QueueTable
            orders={orders}
            loading={loading}
            updating={updating}
            onViewDetail={handleViewDetail}
            onUpdateStatus={handleUpdateStatus}
            onStartComplete={handleStartComplete}
          />
        </div>

        {/* Detail Modal */}
        {showDetail && selectedOrder && (
          <div className="modal-overlay" onClick={() => setShowDetail(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>Order Details</h2>
                  <p>
                    <strong>{selectedOrder.kode_order}</strong>
                    {selectedOrder.kecepatan_pengerjaan === 'express' && (
                      <span className="express-tag">
                        <Zap size={14} /> EXPRESS
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetail(false)}
                  className="modal-close"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <DesignFilesSection
                  files={selectedOrder.design_files}
                  onDownload={handleDownloadFile}
                />

                <div className="detail-section">
                  <h3>
                    <User size={18} /> Customer Information
                  </h3>
                  <div className="detail-grid">
                    <div>
                      <label>Name:</label>
                      <span>{selectedOrder.nama_customer}</span>
                    </div>
                    <div>
                      <label>
                        <Mail size={14} /> Email:
                      </label>
                      <span>{selectedOrder.email_customer || '-'}</span>
                    </div>
                    {selectedOrder.telepon_customer && (
                      <div>
                        <label>
                          <Phone size={14} /> Phone:
                        </label>
                        <span>{selectedOrder.telepon_customer}</span>
                      </div>
                    )}
                    <div>
                      <label>Order Type:</label>
                      <span
                        style={{
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        {selectedOrder.jenis_order === 'offline' ? (
                          <>
                            <Store size={14} /> Offline
                          </>
                        ) : (
                          <>
                            <Globe size={14} /> Online
                          </>
                        )}
                      </span>
                    </div>
                    <div>
                      <label>Speed:</label>
                      <span
                        style={{
                          fontWeight: 'bold',
                          color:
                            selectedOrder.kecepatan_pengerjaan === 'express'
                              ? '#dc2626'
                              : '#16a34a',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        {selectedOrder.kecepatan_pengerjaan === 'express' ? (
                          <>
                            <Zap size={14} /> EXPRESS
                          </>
                        ) : (
                          <>
                            <Clock size={14} /> NORMAL
                          </>
                        )}
                      </span>
                    </div>
                    <div>
                      <label>Total Price:</label>
                      <span
                        style={{
                          fontWeight: 'bold',
                          color: '#364a7c',
                          fontSize: '1.125rem',
                        }}
                      >
                        {formatRupiah(selectedOrder.total_harga)}
                      </span>
                    </div>
                  </div>

                  {selectedOrder.catatan && (
                    <div
                      style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: '#fff3cd',
                        borderRadius: '6px',
                        border: '1px solid #ffc107',
                      }}
                    >
                      <strong
                        style={{
                          color: '#856404',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <FileText size={16} /> Notes:
                      </strong>
                      <p style={{ margin: '0.5rem 0 0 0', color: '#856404' }}>
                        {selectedOrder.catatan}
                      </p>
                    </div>
                  )}
                </div>

                <OrderItemsSection items={selectedOrder.items} />

                <div className="modal-actions">
                  {['pending', 'dibayar', 'validasi'].includes(
                    selectedOrder.status_order,
                  ) && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedOrder.id_order, 'start')
                      }
                      disabled={updating}
                      className="btn-start btn-block"
                    >
                      <Play size={18} /> Start Printing
                    </button>
                  )}

                  {['diproses', 'cetak'].includes(
                    selectedOrder.status_order,
                  ) && (
                    <button
                      onClick={() =>
                        handleStartComplete(selectedOrder.id_order)
                      }
                      disabled={updating}
                      className="btn-complete btn-block"
                    >
                      <CheckSquare size={18} /> Mark as Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Result Modal */}
        <UploadResultModal
          show={showUploadModal}
          uploading={uploadingResult}
          resultFile={resultFile}
          onClose={() => setShowUploadModal(false)}
          onFileChange={handleFileResultChange}
          onUpload={handleUploadResultAndComplete}
        />

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowLogoutModal(false)}
          >
            <div className="logout-modal" onClick={e => e.stopPropagation()}>
              <div className="logout-icon">
                <AlertTriangle size={48} />
              </div>
              <h2>Confirm Logout</h2>
              <p>Are you sure you want to logout from the system?</p>
              <div className="logout-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </button>
                <button className="btn-confirm-logout" onClick={handleLogout}>
                  <LogOut size={18} />
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OperatorDashboard;
