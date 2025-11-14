// TotalSummary.tsx

import React from 'react';
import type {
  OrderItem,
  OrderSettings,
  PromoData,
  AutoDiscount,
} from './types';
import { formatRupiah } from './utils';

interface TotalSummaryProps {
  items: OrderItem[];
  subtotal: number;
  totalHarga: number;
  orderSettings: OrderSettings;
  promoData?: PromoData | null;
  autoDiscount?: AutoDiscount; // ✅ TAMBAHAN BARU
}

const TotalSummary: React.FC<TotalSummaryProps> = ({
  items,
  subtotal,
  totalHarga,
  orderSettings,
  promoData,
  autoDiscount, // ✅ TAMBAHAN BARU
}) => {
  // Tentukan diskon mana yang aktif
  let activeDiscount = 0;
  let discountLabel = '';

  if (promoData && promoData.nilai_diskon_rupiah > 0) {
    activeDiscount = promoData.nilai_diskon_rupiah;
    discountLabel = `🎟️ Promo (${promoData.kode_promo})`;
  } else if (autoDiscount && autoDiscount.active) {
    activeDiscount = autoDiscount.discount_amount;
    discountLabel = '✨ Auto-Discount';
  } else if (orderSettings.diskon > 0) {
    activeDiscount = orderSettings.diskon;
    discountLabel = '💸 Diskon Manual';
  }

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

          {/* ✅ TAMPILKAN DISKON AKTIF (MODIFIKASI) */}
          {activeDiscount > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.25rem',
              }}
            >
              <span>{discountLabel}:</span>
              <strong>- {formatRupiah(activeDiscount)}</strong>
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
