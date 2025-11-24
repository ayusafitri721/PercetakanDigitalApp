// CartItems.tsx - Blue Theme with Lucide Icons

import React from 'react';
import { ShoppingBag, Trash2, Paperclip, FileText } from 'lucide-react';
import type { OrderItem } from './types';
import { formatRupiah } from './utils';

interface CartItemsProps {
  items: OrderItem[];
  handleRemoveItem: (index: number) => void;
}

const CartItems: React.FC<CartItemsProps> = ({ items, handleRemoveItem }) => {
  if (items.length === 0) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        padding: '1.25rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        border: '2px solid #93c5fd',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShoppingBag size={20} color="white" strokeWidth={2.5} />
        </div>
        <h3
          style={{
            margin: 0,
            fontSize: '1.1rem',
            color: '#1e40af',
            fontWeight: '600',
          }}
        >
          Keranjang ({items.length} items)
        </h3>
      </div>

      {items.map((item, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            background: 'white',
            borderRadius: '10px',
            marginBottom: '0.75rem',
            border: '2px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.boxShadow =
              '0 4px 12px rgba(59,130,246,0.15)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
              }}
            >
              <strong style={{ color: '#1e293b', fontSize: '1rem' }}>
                {item.nama_product}
              </strong>
              {item.file_desain && (
                <span
                  style={{
                    background:
                      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    boxShadow: '0 2px 6px rgba(16,185,129,0.3)',
                  }}
                >
                  <Paperclip size={12} strokeWidth={3} />
                  FILE
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: '0.875rem',
                color: '#64748b',
                marginBottom: '0.5rem',
              }}
            >
              {item.jumlah} × {formatRupiah(item.harga_satuan)} ={' '}
              <strong style={{ color: '#1e40af', fontSize: '0.95rem' }}>
                {formatRupiah(item.subtotal)}
              </strong>
            </div>
            {item.file_desain && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#059669',
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  background: '#d1fae5',
                  borderRadius: '6px',
                }}
              >
                <FileText size={14} strokeWidth={2.5} />
                <span style={{ fontWeight: '600' }}>
                  {item.file_desain.name}
                </span>
              </div>
            )}
            {item.catatan && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#64748b',
                  marginTop: '0.5rem',
                  fontStyle: 'italic',
                  padding: '0.5rem',
                  background: '#f8fafc',
                  borderRadius: '6px',
                  borderLeft: '3px solid #cbd5e1',
                }}
              >
                <FileText
                  size={14}
                  strokeWidth={2}
                  style={{ marginTop: '1px', flexShrink: 0 }}
                />
                <span>{item.catatan}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleRemoveItem(index)}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              cursor: 'pointer',
              marginLeft: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow =
                '0 4px 12px rgba(239,68,68,0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,68,68,0.3)';
            }}
          >
            <Trash2 size={18} strokeWidth={2.5} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default CartItems;
