// CartItems.tsx - Komponen Daftar Keranjang

import React from 'react';
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
        background: '#e8f5e9',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
      }}
    >
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>
        🛒 Keranjang ({items.length} items)
      </h3>

      {items.map((item, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem',
            background: 'white',
            borderRadius: '6px',
            marginBottom: '0.5rem',
            border: '1px solid #ddd',
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.25rem',
              }}
            >
              <strong>{item.nama_product}</strong>
              {item.file_desain && (
                <span
                  style={{
                    background: '#28a745',
                    color: 'white',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                  }}
                >
                  📎 FILE
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>
              {item.jumlah} × {formatRupiah(item.harga_satuan)} ={' '}
              <strong>{formatRupiah(item.subtotal)}</strong>
            </div>
            {item.file_desain && (
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#28a745',
                  marginTop: '0.25rem',
                }}
              >
                📄 {item.file_desain.name}
              </div>
            )}
            {item.catatan && (
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#666',
                  marginTop: '0.25rem',
                  fontStyle: 'italic',
                }}
              >
                📝 {item.catatan}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleRemoveItem(index)}
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              border: 'none',
              background: '#dc3545',
              color: 'white',
              cursor: 'pointer',
              marginLeft: '1rem',
            }}
          >
            🗑️
          </button>
        </div>
      ))}
    </div>
  );
};

export default CartItems;
