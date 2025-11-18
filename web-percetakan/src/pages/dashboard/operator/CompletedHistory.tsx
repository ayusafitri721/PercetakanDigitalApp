// CompletedHistory.tsx - History Page Component
import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  CheckCircle,
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  X,
  FileText,
  User,
  Phone,
  Mail,
  Store,
  Globe,
  Clock,
  Zap,
  TrendingUp,
  DollarSign,
} from 'lucide-react';

import type { Order } from './operatorTypes';
import { formatRupiah, formatDate, apiService } from './operatorUtils';
import { DesignFilesSection, OrderItemsSection } from './OperatorComponents';

interface CompletedHistoryProps {
  onRefresh?: () => void;
}

const CompletedHistory: React.FC<CompletedHistoryProps> = ({ onRefresh }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');

  const [stats, setStats] = useState({
    totalCompleted: 0,
    todayCompleted: 0,
    weekCompleted: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchQuery, dateFilter, orderTypeFilter]);

  const fetchCompletedOrders = async () => {
    setLoading(true);
    try {
      const response = await apiService.fetchOrders();

      if (response.status === 'success') {
        const allOrders = response.data.orders || [];

        const completed = allOrders.filter((o: Order) =>
          ['selesai', 'dikirim'].includes(o.status_order),
        );

        completed.sort(
          (a: Order, b: Order) =>
            new Date(b.tanggal_order).getTime() -
            new Date(a.tanggal_order).getTime(),
        );

        setOrders(completed);
        calculateStats(completed);
      }
    } catch (error) {
      console.error('Fetch completed orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (completedOrders: Order[]) => {
    const today = new Date().toISOString().split('T')[0];
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const todayCompleted = completedOrders.filter(o =>
      o.tanggal_order.startsWith(today),
    ).length;

    const weekCompleted = completedOrders.filter(
      o => new Date(o.tanggal_order) >= oneWeekAgo,
    ).length;

    const totalRevenue = completedOrders.reduce(
      (sum, o) => sum + (o.total_harga || 0),
      0,
    );

    setStats({
      totalCompleted: completedOrders.length,
      todayCompleted,
      weekCompleted,
      totalRevenue,
    });
  };

  const applyFilters = () => {
    let filtered = [...orders];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        o =>
          o.kode_order.toLowerCase().includes(query) ||
          o.nama_customer.toLowerCase().includes(query) ||
          o.telepon_customer?.toLowerCase().includes(query),
      );
    }

    const today = new Date();
    if (dateFilter === 'today') {
      const todayStr = today.toISOString().split('T')[0];
      filtered = filtered.filter(o => o.tanggal_order.startsWith(todayStr));
    } else if (dateFilter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(o => new Date(o.tanggal_order) >= oneWeekAgo);
    } else if (dateFilter === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filtered = filtered.filter(o => new Date(o.tanggal_order) >= oneMonthAgo);
    }

    if (orderTypeFilter !== 'all') {
      filtered = filtered.filter(o => o.jenis_order === orderTypeFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleViewDetail = async (order: Order) => {
    try {
      const orderDetail = await apiService.fetchOrderDetail(order.id_order);

      // Fetch result files
      try {
        const API_BASE_URL = 'http://localhost/printifygo/api';
        const resultResponse = await fetch(
          `${API_BASE_URL}/result_files.php?op=by_order&id_order=${order.id_order}`,
        );
        const resultData = await resultResponse.json();

        if (resultData.status === 'success') {
          orderDetail.result_files = resultData.data?.files || [];
        }
      } catch (err) {
        console.warn('No result files:', err);
        orderDetail.result_files = [];
      }

      setSelectedOrder(orderDetail);
      setShowDetail(true);
    } catch (error: any) {
      console.error('Error fetching detail:', error);
      alert('Gagal memuat detail pesanan');
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

  const handleRefresh = () => {
    fetchCompletedOrders();
    if (onRefresh) onRefresh();
  };

  return (
    <>
      {/* Header */}
      <div className="content-header">
        <div>
          <h1>📜 Order History</h1>
          <p>Complete record of all finished orders</p>
        </div>
        <button
          onClick={handleRefresh}
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

      {/* Stats Cards */}
      <div className="stats-grid">
        <div
          className="stat-card"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <div className="stat-icon">
            <CheckCircle size={28} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Completed</div>
            <div className="stat-value">{stats.totalCompleted}</div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          }}
        >
          <div className="stat-icon">
            <TrendingUp size={28} />
          </div>
          <div className="stat-info">
            <div className="stat-label">This Week</div>
            <div className="stat-value">{stats.weekCompleted}</div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          }}
        >
          <div className="stat-icon">
            <Calendar size={28} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Today</div>
            <div className="stat-value">{stats.todayCompleted}</div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          }}
        >
          <div className="stat-icon">
            <DollarSign size={28} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value" style={{ fontSize: '1.25rem' }}>
              {formatRupiah(stats.totalRevenue)}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: '#333',
              }}
            >
              <Search size={14} style={{ marginRight: '0.25rem' }} />
              Search
            </label>
            <input
              type="text"
              placeholder="Kode order, nama, telepon..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: '#333',
              }}
            >
              <Calendar size={14} style={{ marginRight: '0.25rem' }} />
              Period
            </label>
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '0.9rem',
              }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: '#333',
              }}
            >
              <Filter size={14} style={{ marginRight: '0.25rem' }} />
              Order Type
            </label>
            <select
              value={orderTypeFilter}
              onChange={e => setOrderTypeFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '0.9rem',
              }}
            >
              <option value="all">All Types</option>
              <option value="online">Online Only</option>
              <option value="offline">Offline Only</option>
            </select>
          </div>
        </div>

        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: '#f8f9fa',
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: '#666',
          }}
        >
          Showing <strong>{filteredOrders.length}</strong> of{' '}
          <strong>{orders.length}</strong> completed orders
        </div>
      </div>

      {/* History Table */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        {loading && orders.length === 0 ? (
          <div className="loading-state" style={{ padding: '3rem' }}>
            <div className="spinner"></div>
            <p>Memuat history...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem' }}>
            <div className="empty-icon" style={{ fontSize: '4rem' }}>
              📭
            </div>
            <h3>No Orders Found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="queue-table">
              <thead>
                <tr>
                  <th>Order Code</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Speed</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Completed Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr
                    key={order.id_order}
                    style={{
                      background:
                        order.status_order === 'dikirim'
                          ? 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)'
                          : 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                      borderLeft:
                        order.status_order === 'dikirim'
                          ? '4px solid #0ea5e9'
                          : '4px solid #28a745',
                    }}
                  >
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem',
                        }}
                      >
                        <strong style={{ fontSize: '0.95rem' }}>
                          {order.kode_order}
                        </strong>
                        {order.kecepatan_pengerjaan === 'express' && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              color: '#dc2626',
                              fontWeight: '700',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <Zap size={10} /> EXPRESS
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <div
                          style={{ fontWeight: '600', marginBottom: '0.25rem' }}
                        >
                          {order.nama_customer}
                        </div>
                        {order.telepon_customer && (
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>
                            📞 {order.telepon_customer}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          background:
                            order.jenis_order === 'offline'
                              ? '#f3f4f6'
                              : '#e0f2fe',
                          color:
                            order.jenis_order === 'offline'
                              ? '#374151'
                              : '#0369a1',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        {order.jenis_order === 'offline' ? (
                          <>
                            <Store size={12} /> Offline
                          </>
                        ) : (
                          <>
                            <Globe size={12} /> Online
                          </>
                        )}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          background:
                            order.kecepatan_pengerjaan === 'express'
                              ? '#fee2e2'
                              : '#d1fae5',
                          color:
                            order.kecepatan_pengerjaan === 'express'
                              ? '#dc2626'
                              : '#065f46',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        {order.kecepatan_pengerjaan === 'express' ? (
                          <>
                            <Zap size={12} /> Express
                          </>
                        ) : (
                          <>
                            <Clock size={12} /> Normal
                          </>
                        )}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#364a7c', fontSize: '0.95rem' }}>
                        {formatRupiah(order.total_harga)}
                      </strong>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: '700',
                          background:
                            order.status_order === 'dikirim'
                              ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
                              : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                          color: 'white',
                          display: 'inline-block',
                        }}
                      >
                        {order.status_order === 'dikirim'
                          ? '🚚 DIKIRIM'
                          : '✅ SELESAI'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>
                        {formatDate(order.tanggal_order)}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleViewDetail(order)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#667eea',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <Eye size={14} /> Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }}
          >
            <div className="modal-header">
              <div>
                <h2>📋 Order Details</h2>
                <p>
                  <strong>{selectedOrder.kode_order}</strong>
                  {selectedOrder.kecepatan_pengerjaan === 'express' && (
                    <span
                      style={{
                        marginLeft: '0.5rem',
                        padding: '0.25rem 0.75rem',
                        background: '#dc2626',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                      }}
                    >
                      <Zap size={12} /> EXPRESS
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
              {/* Customer Info */}
              <div
                style={{
                  background: '#f8f9fa',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                }}
              >
                <h3
                  style={{
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <User size={18} /> Customer Information
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: '0.875rem',
                        color: '#666',
                        display: 'block',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Name:
                    </label>
                    <span style={{ fontWeight: '600' }}>
                      {selectedOrder.nama_customer}
                    </span>
                  </div>
                  {selectedOrder.email_customer && (
                    <div>
                      <label
                        style={{
                          fontSize: '0.875rem',
                          color: '#666',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          marginBottom: '0.25rem',
                        }}
                      >
                        <Mail size={12} /> Email:
                      </label>
                      <span style={{ fontWeight: '600' }}>
                        {selectedOrder.email_customer}
                      </span>
                    </div>
                  )}
                  {selectedOrder.telepon_customer && (
                    <div>
                      <label
                        style={{
                          fontSize: '0.875rem',
                          color: '#666',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          marginBottom: '0.25rem',
                        }}
                      >
                        <Phone size={12} /> Phone:
                      </label>
                      <span style={{ fontWeight: '600' }}>
                        {selectedOrder.telepon_customer}
                      </span>
                    </div>
                  )}
                  <div>
                    <label
                      style={{
                        fontSize: '0.875rem',
                        color: '#666',
                        display: 'block',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Total Price:
                    </label>
                    <span
                      style={{
                        fontWeight: '700',
                        color: '#364a7c',
                        fontSize: '1.125rem',
                      }}
                    >
                      {formatRupiah(selectedOrder.total_harga)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Design Files */}
              <DesignFilesSection
                files={selectedOrder.design_files}
                onDownload={handleDownloadFile}
              />

              {/* Result Files */}
              {selectedOrder.result_files &&
                selectedOrder.result_files.length > 0 && (
                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '2px solid #22c55e',
                      padding: '1.5rem',
                      borderRadius: '8px',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <h3 style={{ color: '#166534', marginBottom: '1rem' }}>
                      ✅ Result Files ({selectedOrder.result_files.length})
                    </h3>
                    {selectedOrder.result_files.map(
                      (file: any, idx: number) => (
                        <div
                          key={file.id_file}
                          style={{
                            background: 'white',
                            padding: '1rem',
                            borderRadius: '6px',
                            marginBottom: '1rem',
                            border: '1px solid #bbf7d0',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                            }}
                          >
                            <div style={{ fontSize: '2rem' }}>
                              {file.tipe_file.match(/image/i) ? '🖼️' : '📄'}
                            </div>
                            <div style={{ flex: 1 }}>
                              <p
                                style={{
                                  fontWeight: '600',
                                  marginBottom: '0.25rem',
                                }}
                              >
                                {idx + 1}. {file.nama_file}
                              </p>
                              {file.keterangan && (
                                <p
                                  style={{
                                    fontSize: '0.875rem',
                                    color: '#666',
                                    marginTop: '0.25rem',
                                  }}
                                >
                                  {file.keterangan}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() =>
                                handleDownloadFile(
                                  file.file_url,
                                  file.nama_file,
                                )
                              }
                              style={{
                                padding: '0.5rem 1rem',
                                background: '#22c55e',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                              }}
                            >
                              <Download size={14} /> Download
                            </button>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}

              {/* Order Items */}
              <OrderItemsSection items={selectedOrder.items} />

              {/* Notes */}
              {selectedOrder.catatan && (
                <div
                  style={{
                    marginTop: '1.5rem',
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
                    <FileText size={16} /> Order Notes:
                  </strong>
                  <p style={{ margin: '0.5rem 0 0 0', color: '#856404' }}>
                    {selectedOrder.catatan}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompletedHistory;
