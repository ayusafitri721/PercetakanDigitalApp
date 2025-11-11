// KasirDashboard.tsx - REFACTORED VERSION (Clean & Modular)
import React, { useEffect, useState } from 'react';
import axios from 'axios';
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

const KasirDashboard: React.FC = () => {
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

  return (
    <div className="kasir-container">
      {/* Stats Cards */}
      <StatsCards stats={stats} formatRupiah={formatRupiah} />

      {/* Action Button */}
      <div className="kasir-actions">
        <button
          className="btn-primary btn-large"
          onClick={() => setShowCreateOrder(true)}
        >
          <span className="btn-icon">➕</span>
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
  );
};

export default KasirDashboard;
