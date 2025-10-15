import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost/api-percetakan/api';

interface Order {
  id_order: string;
  nama_user: string;
  nama_product: string;
  jumlah: number;
  total_harga: number;
  status_order: string;
  tanggal_order: string;
}

const SalesReport: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders.php`);
      if (response.data.status === 'success') {
        setOrders(response.data.orders || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
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

  const totalSales = orders.reduce((sum, order) => sum + order.total_harga, 0);

  if (loading) {
    return <div className="loading">Memuat laporan penjualan...</div>;
  }

  return (
    <div className="sales-report">
      <div className="report-filters">
        <div className="filter-group">
          <label>Dari Tanggal:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={e =>
              setDateRange({ ...dateRange, start: e.target.value })
            }
            className="form-control"
          />
        </div>
        <div className="filter-group">
          <label>Sampai Tanggal:</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
            className="form-control"
          />
        </div>
        <button className="btn-primary">Filter</button>
      </div>

      <div className="report-summary">
        <h3>Total Penjualan: {formatRupiah(totalSales)}</h3>
        <p>Jumlah Transaksi: {orders.length}</p>
      </div>

      <div className="table-wrapper">
        <table className="report-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tanggal</th>
              <th>Customer</th>
              <th>Produk</th>
              <th>Jumlah</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id_order}>
                <td>{order.id_order}</td>
                <td>
                  {new Date(order.tanggal_order).toLocaleDateString('id-ID')}
                </td>
                <td>{order.nama_user}</td>
                <td>{order.nama_product}</td>
                <td>{order.jumlah}</td>
                <td className="text-right">
                  {formatRupiah(order.total_harga)}
                </td>
                <td>
                  <span className={`badge badge-${order.status_order}`}>
                    {order.status_order}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesReport;
