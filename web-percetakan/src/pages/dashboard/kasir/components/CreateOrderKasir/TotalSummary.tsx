// TotalSummary.tsx - Komponen Ringkasan Total Pembayaran

import React from 'react';
import type { OrderItem, OrderSettings } from './types'; 
import { formatRupiah } from './utils';

interface TotalSummaryProps {
  items: OrderItem[];
  subtotal: number;
  totalHarga: number;
  orderSettings: OrderSettings;
}

const TotalSummary: React.FC<TotalSummaryProps> = ({
  items,
  subtotal,
  totalHarga,
  orderSettings,
}) => {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        textAlign: 'center',
      }}
    >
      <h3
        style={{
          margin: '0 0 0.5rem 0',
          fontSize: '0.95rem',
          opacity: 0.9,
        }}
      >
        TOTAL PEMBAYARAN
      </h3>
      <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>
        {formatRupiah(totalHarga)}
      </p>
      {items.length > 0 && (
        <div
          style={{
            marginTop: '1rem',
            fontSize: '0.9rem',
            opacity: 0.95,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.25rem',
            }}
          >
            <span>Subtotal ({items.length} items):</span>
            <strong>{formatRupiah(subtotal)}</strong>
          </div>
          {orderSettings.diskon > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.25rem',
              }}
            >
              <span>Diskon:</span>
              <strong>- {formatRupiah(orderSettings.diskon)}</strong>
            </div>
          )}
          {orderSettings.kecepatan_pengerjaan === 'express' && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>⚡ Express (+50%):</span>
              <strong>+ {formatRupiah(subtotal * 0.5)}</strong>
            </div>
          )}
        </div>
      )}
      {items.length === 0 && (
        <p
          style={{
            margin: '0.5rem 0 0 0',
            fontSize: '0.85rem',
            opacity: 0.9,
          }}
        >
          Belum ada produk di keranjang
        </p>
      )}
    </div>
  );
};

export default TotalSummary;
