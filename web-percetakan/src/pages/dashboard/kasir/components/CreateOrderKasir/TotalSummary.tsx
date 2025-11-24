// TotalSummary.tsx - Blue Theme with Lucide Icons

import React from 'react';
import { DollarSign, Tag, Zap, Sparkles } from 'lucide-react';
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
  autoDiscount?: AutoDiscount;
}

const TotalSummary: React.FC<TotalSummaryProps> = ({
  items,
  subtotal,
  totalHarga,
  orderSettings,
  promoData,
  autoDiscount,
}) => {
  // Tentukan diskon mana yang aktif
  let activeDiscount = 0;
  let discountLabel = '';
  let discountIcon = null;

  if (promoData && promoData.nilai_diskon_rupiah > 0) {
    activeDiscount = promoData.nilai_diskon_rupiah;
    discountLabel = `Promo (${promoData.kode_promo})`;
    discountIcon = <Tag size={16} strokeWidth={2.5} />;
  } else if (autoDiscount && autoDiscount.active) {
    activeDiscount = autoDiscount.discount_amount;
    discountLabel = 'Auto-Discount';
    discountIcon = <Sparkles size={16} strokeWidth={2.5} />;
  } else if (orderSettings.diskon > 0) {
    activeDiscount = orderSettings.diskon;
    discountLabel = 'Diskon Manual';
    discountIcon = <Tag size={16} strokeWidth={2.5} />;
  }

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        color: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        textAlign: 'center',
        boxShadow: '0 8px 24px rgba(30,64,175,0.4)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '0.5rem',
        }}
      >
        <DollarSign size={20} strokeWidth={2.5} />
        <h3
          style={{
            margin: 0,
            fontSize: '1rem',
            opacity: 0.95,
            fontWeight: '600',
            letterSpacing: '0.5px',
          }}
        >
          TOTAL PEMBAYARAN
        </h3>
      </div>
      <p
        style={{
          margin: '0.5rem 0 0 0',
          fontSize: '2.5rem',
          fontWeight: '700',
          letterSpacing: '-1px',
        }}
      >
        {formatRupiah(totalHarga)}
      </p>

      {items.length > 0 && (
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255,255,255,0.2)',
            fontSize: '0.95rem',
            opacity: 0.95,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: '500' }}>
              Subtotal ({items.length} items):
            </span>
            <strong style={{ fontSize: '1.05rem' }}>
              {formatRupiah(subtotal)}
            </strong>
          </div>

          {/* Tampilkan diskon aktif */}
          {activeDiscount > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.15)',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                marginLeft: '-0.75rem',
                marginRight: '-0.75rem',
              }}
            >
              <span
                style={{
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {discountIcon}
                {discountLabel}:
              </span>
              <strong style={{ fontSize: '1.05rem' }}>
                - {formatRupiah(activeDiscount)}
              </strong>
            </div>
          )}

          {orderSettings.kecepatan_pengerjaan === 'express' && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.15)',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                marginLeft: '-0.75rem',
                marginRight: '-0.75rem',
              }}
            >
              <span
                style={{
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Zap size={16} strokeWidth={2.5} />
                Express (+50%):
              </span>
              <strong style={{ fontSize: '1.05rem' }}>
                + {formatRupiah(subtotal * 0.5)}
              </strong>
            </div>
          )}
        </div>
      )}

      {items.length === 0 && (
        <p
          style={{
            margin: '0.75rem 0 0 0',
            fontSize: '0.875rem',
            opacity: 0.9,
            fontWeight: '500',
          }}
        >
          Belum ada produk di keranjang
        </p>
      )}
    </div>
  );
};

export default TotalSummary;
