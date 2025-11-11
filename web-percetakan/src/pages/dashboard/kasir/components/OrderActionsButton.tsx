import React, { useState } from 'react';
import axios from 'axios';

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

      // ✅ PERBAIKAN: Gunakan endpoint update_status khusus
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

        // Refresh data setelah 500ms untuk memastikan backend sudah update
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
    // Hanya order ONLINE dengan status tertentu yang bisa ditandai siap
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
          background: '#6c757d',
          color: 'white',
          border: 'none',
          padding: '0.5rem 0.75rem',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '1rem',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#5a6268';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = '#6c757d';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        🖨️
      </button>

      {/* Tombol View Detail */}
      <button
        onClick={onViewDetail}
        title="Lihat Detail"
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '0.5rem 0.75rem',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '1rem',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#0056b3';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = '#007bff';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        👁️
      </button>

      {/* Tombol Tandai Siap Kirim - Khusus Online */}
      {canMarkAsReady() && (
        <button
          onClick={handleMarkAsReady}
          disabled={isUpdating}
          title="Tandai Siap Diambil Kurir"
          style={{
            background: isUpdating ? '#9ca3af' : '#28a745',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            fontSize: '0.85rem',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
            opacity: isUpdating ? 0.7 : 1,
          }}
          onMouseEnter={e => {
            if (!isUpdating) {
              e.currentTarget.style.background = '#218838';
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={e => {
            if (!isUpdating) {
              e.currentTarget.style.background = '#28a745';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          {isUpdating ? '⏳ Memproses...' : '🚚 Siap Diambil'}
        </button>
      )}

      {/* Debug Info (hapus di production) */}
      {order.jenis_order?.toLowerCase() === 'online' &&
        order.status_order.toLowerCase() === 'siap' && (
          <span
            style={{
              fontSize: '0.75rem',
              color: '#28a745',
              fontWeight: '600',
              padding: '0.25rem 0.5rem',
              background: '#d4edda',
              borderRadius: '4px',
            }}
          >
            ✅ SIAP DIAMBIL
          </span>
        )}
    </div>
  );
};

export default OrderActionsButton;
