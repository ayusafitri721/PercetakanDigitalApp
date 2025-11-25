// Dashboard.tsx - OPERATOR DASHBOARD WITH NAVIGATION
import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import {
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

// Import types
import type { Order, Stats, ItemUploadStatus } from './operatorTypes';

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

// ✅ Import CompletedHistory
import CompletedHistory from './CompletedHistory';

const OperatorDashboard: React.FC = () => {
  // ✅ State untuk navigation
  const [activePage, setActivePage] = useState('queue');

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploadingResult, setUploadingResult] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [itemsUploadStatus, setItemsUploadStatus] = useState<
    ItemUploadStatus[]
  >([]);
  const [orderToComplete, setOrderToComplete] = useState<string | null>(null);

  const [stats, setStats] = useState<Stats>({
    todayQueue: 0,
    inProgress: 0,
    todayCompleted: 0,
    expressQueue: 0,
  });

  useEffect(() => {
    if (activePage === 'queue') {
      fetchQueue();
      const interval = setInterval(fetchQueue, 30000);
      return () => clearInterval(interval);
    }
  }, [activePage]);

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

  const handleStartComplete = async (orderId: string) => {
    try {
      let order = selectedOrder;
      if (!order || order.id_order !== orderId) {
        order = await apiService.fetchOrderDetail(orderId);
      }

      if (!order) {
        alert('❌ Gagal memuat data pesanan');
        return;
      }

      if (!order.items || order.items.length === 0) {
        alert('❌ Pesanan ini tidak memiliki item untuk diupload!');
        return;
      }

      const itemStatuses: ItemUploadStatus[] = order.items.map(item => ({
        id_item: item.id_item,
        nama_produk: item.nama_produk,
        jumlah: item.jumlah,
        file: null,
        uploaded: false,
      }));

      setItemsUploadStatus(itemStatuses);
      setOrderToComplete(orderId);
      setShowUploadModal(true);
    } catch (error: any) {
      console.error('Error:', error);
      alert('Gagal memuat data pesanan: ' + (error.message || 'Unknown error'));
    }
  };

  const handleFileChangePerItem = (itemId: string, file: File | null) => {
    setItemsUploadStatus(prev =>
      prev.map(item =>
        item.id_item === itemId
          ? { ...item, file, uploaded: file !== null }
          : item,
      ),
    );
  };

  const handleUploadAllResultsAndComplete = async () => {
    if (!orderToComplete) return;

    const allHaveFiles = itemsUploadStatus.every(item => item.file !== null);
    if (!allHaveFiles) {
      alert('⚠️ Semua item harus memiliki file hasil!');
      return;
    }

    setUploadingResult(true);
    try {
      let successCount = 0;
      let failedItems: string[] = [];

      for (const item of itemsUploadStatus) {
        if (!item.file) continue;

        try {
          const uploadedFile = await apiService.uploadFile(item.file);

          await apiService.createResultFile({
            id_order: orderToComplete,
            nama_file: uploadedFile.file_name,
            file_url: uploadedFile.file_url,
            ukuran_file: item.file.size,
            tipe_file: item.file.type,
            keterangan: `File hasil untuk: ${item.nama_produk} (${item.jumlah} pcs) - Item ID: ${item.id_item}`,
          });

          successCount++;
        } catch (error: any) {
          console.error(`Error uploading ${item.nama_produk}:`, error);
          failedItems.push(item.nama_produk);
        }
      }

      if (failedItems.length > 0) {
        alert(
          `⚠️ UPLOAD SEBAGIAN BERHASIL!\n\n✅ Berhasil: ${successCount}/${
            itemsUploadStatus.length
          } files\n❌ Gagal: ${failedItems.join(
            ', ',
          )}\n\nSilakan coba lagi untuk item yang gagal.`,
        );
        setUploadingResult(false);
        return;
      }

      const statusResponse = await apiService.updateOrderStatus(
        orderToComplete,
        'selesai',
      );

      if (statusResponse.status === 'success') {
        alert(
          `✅ PESANAN SELESAI!\n\n📦 Total ${
            itemsUploadStatus.length
          } file hasil berhasil diupload:\n\n${itemsUploadStatus
            .map(
              (item, idx) =>
                `${idx + 1}. ${item.nama_produk} × ${item.jumlah} - ${
                  item.file?.name
                }`,
            )
            .join(
              '\n',
            )}\n\n🎯 Pesanan sudah dikirim ke KASIR untuk diserahkan ke customer.\n✨ Semua file hasil tersimpan dan bisa di-download!`,
        );

        setShowUploadModal(false);
        setItemsUploadStatus([]);
        setOrderToComplete(null);
        fetchQueue();
        if (showDetail) setShowDetail(false);
      } else {
        throw new Error('Gagal update status order');
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert(
        '❌ Gagal menyelesaikan pesanan: ' +
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
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <img
              src="/images/logoprin.png"
              alt="PrintifyGo Logo"
              className="logo-image"
            />
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
          {/* ✅ Queue Menu */}
          <a
            href="#"
            className={`nav-item ${activePage === 'queue' ? 'active' : ''}`}
            onClick={e => {
              e.preventDefault();
              setActivePage('queue');
            }}
          >
            <ClipboardList className="nav-icon" size={20} />
            {!sidebarCollapsed && <span className="nav-text">Queue</span>}
          </a>

          {/* Statistics Menu */}
          <a href="#" className="nav-item">
            <BarChart3 className="nav-icon" size={20} />
            {!sidebarCollapsed && <span className="nav-text">Statistics</span>}
          </a>

          {/* ✅ Completed Menu */}
          <a
            href="#"
            className={`nav-item ${activePage === 'completed' ? 'active' : ''}`}
            onClick={e => {
              e.preventDefault();
              setActivePage('completed');
            }}
          >
            <CheckCircle className="nav-icon" size={20} />
            {!sidebarCollapsed && <span className="nav-text">Completed</span>}
          </a>

          {/* Settings Menu */}
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
        {/* ✅ Conditional Rendering based on activePage */}
        {activePage === 'queue' ? (
          // ========== QUEUE PAGE ==========
          <>
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

            {/* Detail Modal - Only for Queue */}
            {showDetail && selectedOrder && (
              <div
                className="modal-overlay"
                onClick={() => setShowDetail(false)}
              >
                <div
                  className="modal-content"
                  onClick={e => e.stopPropagation()}
                >
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
                            {selectedOrder.kecepatan_pengerjaan ===
                            'express' ? (
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
                          <p
                            style={{ margin: '0.5rem 0 0 0', color: '#856404' }}
                          >
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
              items={itemsUploadStatus}
              onClose={() => {
                if (!uploadingResult) {
                  setShowUploadModal(false);
                  setItemsUploadStatus([]);
                  setOrderToComplete(null);
                }
              }}
              onFileChange={handleFileChangePerItem}
              onUpload={handleUploadAllResultsAndComplete}
            />
          </>
        ) : activePage === 'completed' ? (
          // ========== COMPLETED HISTORY PAGE ==========
          <CompletedHistory onRefresh={fetchQueue} />
        ) : null}

        {/* Logout Confirmation Modal - Always available */}
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
