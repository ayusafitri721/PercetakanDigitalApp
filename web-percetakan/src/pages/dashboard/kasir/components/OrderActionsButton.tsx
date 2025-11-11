// components/kasir/OrderActionsButton.tsx - FIXED VERSION
import React from 'react';
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
  const handleMarkAsReady = async () => {
    if (
      !window.confirm(
        `Tandai pesanan ${order.kode_order} sebagai SIAP KIRIM?\n\nPesanan akan masuk ke dashboard kurir untuk dikirim.`,
      )
    ) {
      return;
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/orders.php`, {
        id_order: order.id_order,
        status_order: 'siap',
      });

      if (response.data.status === 'success') {
        alert(
          '✅ Pesanan berhasil ditandai SIAP KIRIM!\n\nPesanan sekarang akan muncul di dashboard kurir.',
        );
        onSuccess();
      } else {
        throw new Error(response.data.message || 'Gagal update status');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert('❌ Gagal update status: ' + error.message);
    }
  };

  const canMarkAsReady = () => {
    // Hanya order online dengan status tertentu yang bisa ditandai siap
    const validStatuses = ['validasi', 'diproses', 'cetak', 'selesai'];
    return (
      order.jenis_order === 'online' &&
      validStatuses.includes(order.status_order.toLowerCase())
    );
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
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
          title="Tandai Siap Kirim ke Kurir"
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#218838';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#28a745';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          🚚 Siap Kirim
        </button>
      )}
    </div>
  );
};

export default OrderActionsButton;
