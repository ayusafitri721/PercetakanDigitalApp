// components/kasir/OrdersTable.tsx
import React from 'react';
import OrderActionsButton from './OrderActionsButton';

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
}

interface OrdersTableProps {
  orders: Order[];
  loading: boolean;
  formatRupiah: (amount: number) => string;
  formatDate: (dateString: string) => string;
  getStatusLabel: (status: string) => string;
  getStatusColor: (status: string) => string;
  getStatusPembayaran: (order: Order) => string;
  getStatusPembayaranColor: (order: Order) => string;
  onViewDetail: (order: Order) => void;
  onPrintInvoice: (order: Order) => void;
  onRefresh: () => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  loading,
  formatRupiah,
  formatDate,
  getStatusLabel,
  getStatusColor,
  getStatusPembayaran,
  getStatusPembayaranColor,
  onViewDetail,
  onPrintInvoice,
  onRefresh,
}) => {
  if (loading) {
    return <div className="loading">⏳ Memuat data...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <p>Belum ada pesanan di periode ini</p>
      </div>
    );
  }

  return (
    <>
      <div className="table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Kode Order</th>
              <th>Pelanggan</th>
              <th>Jenis</th>
              <th>Total</th>
              <th>Status Pesanan</th>
              <th>Status Bayar</th>
              <th>Waktu</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id_order}>
                <td>
                  <strong>{order.kode_order}</strong>
                </td>
                <td>
                  {order.nama_customer}
                  {order.telepon_customer && (
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      📞 {order.telepon_customer}
                    </div>
                  )}
                </td>
                <td>
                  <span
                    style={{
                      background:
                        order.jenis_order === 'offline' ? '#6c757d' : '#17a2b8',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}
                  >
                    {order.jenis_order === 'offline'
                      ? '🏪 Offline'
                      : '🌐 Online'}
                  </span>
                </td>
                <td className="text-right">
                  <strong>{formatRupiah(order.total_harga)}</strong>
                </td>
                <td>
                  <span
                    style={{
                      background: getStatusColor(order.status_order),
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      display: 'inline-block',
                    }}
                  >
                    {getStatusLabel(order.status_order)}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      background: getStatusPembayaranColor(order),
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      display: 'inline-block',
                    }}
                  >
                    {getStatusPembayaran(order)}
                  </span>
                </td>
                <td>{formatDate(order.tanggal_order)}</td>
                <td>
                  <OrderActionsButton
                    order={order}
                    onSuccess={onRefresh}
                    onViewDetail={() => onViewDetail(order)}
                    onPrintInvoice={() => onPrintInvoice(order)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        style={{
          marginTop: '1rem',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          textAlign: 'center',
        }}
      >
        <strong>Total {orders.length} pesanan</strong>
      </div>
    </>
  );
};

export default OrdersTable;
