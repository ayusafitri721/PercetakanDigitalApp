// components/kasir/OrdersTable.tsx
import React from 'react';
import { Phone, Store, Globe } from 'lucide-react';
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
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '60px 20px',
          fontSize: '16px',
          color: '#718096',
        }}
      >
        Memuat data...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#718096',
        }}
      >
        <p style={{ fontSize: '16px', margin: 0 }}>
          Belum ada pesanan di periode ini
        </p>
      </div>
    );
  }

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
          }}
        >
          <thead>
            <tr style={{ background: '#f7fafc' }}>
              <th
                style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#4a5568',
                  borderBottom: '2px solid #e2e8f0',
                  whiteSpace: 'nowrap',
                }}
              >
                Kode Order
              </th>
              <th
                style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#4a5568',
                  borderBottom: '2px solid #e2e8f0',
                  whiteSpace: 'nowrap',
                }}
              >
                Pelanggan
              </th>
              <th
                style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#4a5568',
                  borderBottom: '2px solid #e2e8f0',
                  whiteSpace: 'nowrap',
                }}
              >
                Jenis
              </th>
              <th
                style={{
                  padding: '14px 16px',
                  textAlign: 'right',
                  fontWeight: 600,
                  color: '#4a5568',
                  borderBottom: '2px solid #e2e8f0',
                  whiteSpace: 'nowrap',
                }}
              >
                Total
              </th>
              <th
                style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#4a5568',
                  borderBottom: '2px solid #e2e8f0',
                  whiteSpace: 'nowrap',
                }}
              >
                Status Pesanan
              </th>
              <th
                style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#4a5568',
                  borderBottom: '2px solid #e2e8f0',
                  whiteSpace: 'nowrap',
                }}
              >
                Status Bayar
              </th>
              <th
                style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#4a5568',
                  borderBottom: '2px solid #e2e8f0',
                  whiteSpace: 'nowrap',
                }}
              >
                Waktu
              </th>
              <th
                style={{
                  padding: '14px 16px',
                  textAlign: 'center',
                  fontWeight: 600,
                  color: '#4a5568',
                  borderBottom: '2px solid #e2e8f0',
                  whiteSpace: 'nowrap',
                }}
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr
                key={order.id_order}
                style={{ transition: 'background 0.2s' }}
                onMouseEnter={e =>
                  (e.currentTarget.style.background = '#f7fafc')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.background = 'transparent')
                }
              >
                <td
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    color: '#2d3748',
                  }}
                >
                  <strong>{order.kode_order}</strong>
                </td>
                <td
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    color: '#2d3748',
                  }}
                >
                  <div>{order.nama_customer}</div>
                  {order.telepon_customer && (
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: '#718096',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '4px',
                      }}
                    >
                      <Phone size={12} />
                      {order.telepon_customer}
                    </div>
                  )}
                </td>
                <td
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    color: '#2d3748',
                  }}
                >
                  <span
                    style={{
                      background:
                        order.jenis_order === 'offline'
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {order.jenis_order === 'offline' ? (
                      <>
                        <Store size={14} />
                        Offline
                      </>
                    ) : (
                      <>
                        <Globe size={14} />
                        Online
                      </>
                    )}
                  </span>
                </td>
                <td
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    color: '#2d3748',
                    textAlign: 'right',
                  }}
                >
                  <strong>{formatRupiah(order.total_harga)}</strong>
                </td>
                <td
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    color: '#2d3748',
                  }}
                >
                  <span
                    style={{
                      background: getStatusColor(order.status_order),
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'inline-block',
                    }}
                  >
                    {getStatusLabel(order.status_order)}
                  </span>
                </td>
                <td
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    color: '#2d3748',
                  }}
                >
                  <span
                    style={{
                      background: getStatusPembayaranColor(order),
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'inline-block',
                    }}
                  >
                    {getStatusPembayaran(order)}
                  </span>
                </td>
                <td
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    color: '#2d3748',
                  }}
                >
                  {formatDate(order.tanggal_order)}
                </td>
                <td
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    color: '#2d3748',
                    textAlign: 'center',
                  }}
                >
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
          background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
          borderRadius: '12px',
          textAlign: 'center',
          border: '1px solid #e2e8f0',
        }}
      >
        <strong style={{ color: '#2d3748' }}>
          Total {orders.length} pesanan
        </strong>
      </div>
    </>
  );
};

export default OrdersTable;
