import React, { useState } from 'react';
import axios from 'axios';
import { Printer, Eye, Truck, Loader2, CheckCircle } from 'lucide-react';

interface Order {
  id_order: string;
  kode_order: string;
  status_order: string;
  jenis_order?: string;
}

interface OrderActionsButtonProps {
  order: Order;
  onSuccess: () => void;
  onViewDetail: () => void;
  onPrintInvoice: () => void;
}

const API_BASE_URL = 'http://localhost/api-percetakan/api';

const OrderActionsButton: React.FC<OrderActionsButtonProps> = ({
  order,
  onSuccess,
  onViewDetail,
  onPrintInvoice,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleMarkAsReady = async () => {
    if (isUpdating) return;

    const confirmed = window.confirm(
      `Tandai pesanan ${order.kode_order} sebagai SIAP DIAMBIL KURIR?\n\n` +
        `✅ Pesanan akan masuk ke dashboard kurir\n` +
        `✅ Kurir dapat mengambil dan mengirim pesanan\n\n` +
        `Lanjutkan?`,
    );

    if (!confirmed) return;

    try {
      setIsUpdating(true);
      console.log('🔄 Updating order:', order.id_order, 'to status: siap');

      const formData = new FormData();
      formData.append('id_order', order.id_order);
      formData.append('status', 'siap');

      const response = await axios.post(
        `${API_BASE_URL}/orders.php?op=update_status`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('✅ Update Response:', response.data);

      if (response.data.status === 'success') {
        alert(
          '✅ BERHASIL!\n\n' +
            `Pesanan ${order.kode_order} telah ditandai SIAP DIAMBIL.\n\n` +
            'Pesanan sekarang muncul di Dashboard Kurir untuk diambil dan dikirim.',
        );

        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        throw new Error(response.data.message || 'Gagal update status');
      }
    } catch (error: any) {
      console.error('❌ Error updating status:', error);

      const errorMsg =
        error.response?.data?.message || error.message || 'Unknown error';
      alert(
        '❌ GAGAL UPDATE STATUS\n\n' +
          `Error: ${errorMsg}\n\n` +
          'Silakan coba lagi atau hubungi admin.',
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const canMarkAsReady = () => {
    const validStatuses = [
      'validasi',
      'dibayar',
      'diproses',
      'cetak',
      'selesai',
    ];
    const isValidStatus = validStatuses.includes(
      order.status_order.toLowerCase(),
    );
    const isOnline = order.jenis_order?.toLowerCase() === 'online';

    console.log(
      `Check ready: ${order.kode_order} - jenis=${order.jenis_order}, status=${
        order.status_order
      }, canMark=${isOnline && isValidStatus}`,
    );

    return isOnline && isValidStatus;
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {/* Tombol Print Invoice */}
      <button
        onClick={onPrintInvoice}
        title="Print Invoice"
        style={{
          background: 'linear-gradient(135deg, #718096 0%, #4a5568 100%)',
          color: 'white',
          border: 'none',
          padding: '0.5rem 0.75rem',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <Printer size={18} strokeWidth={2.5} />
      </button>

      {/* Tombol View Detail */}
      <button
        onClick={onViewDetail}
        title="Lihat Detail"
        style={{
          background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
          color: 'white',
          border: 'none',
          padding: '0.5rem 0.75rem',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow =
            '0 4px 12px rgba(66, 153, 225, 0.4)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <Eye size={18} strokeWidth={2.5} />
      </button>

      {/* Tombol Tandai Siap Kirim - Khusus Online */}
      {canMarkAsReady() && (
        <button
          onClick={handleMarkAsReady}
          disabled={isUpdating}
          title="Tandai Siap Diambil Kurir"
          style={{
            background: isUpdating
              ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
              : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
            opacity: isUpdating ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
          onMouseEnter={e => {
            if (!isUpdating) {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow =
                '0 4px 12px rgba(72, 187, 120, 0.4)';
            }
          }}
          onMouseLeave={e => {
            if (!isUpdating) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          {isUpdating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <Truck size={16} strokeWidth={2.5} />
              Siap Diambil
            </>
          )}
        </button>
      )}

      {/* Status Badge - SIAP DIAMBIL */}
      {order.jenis_order?.toLowerCase() === 'online' &&
        order.status_order.toLowerCase() === 'siap' && (
          <span
            style={{
              fontSize: '0.75rem',
              color: 'white',
              fontWeight: 600,
              padding: '0.4rem 0.75rem',
              background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <CheckCircle size={14} strokeWidth={2.5} />
            SIAP DIAMBIL
          </span>
        )}
    </div>
  );
};

export default OrderActionsButton;
