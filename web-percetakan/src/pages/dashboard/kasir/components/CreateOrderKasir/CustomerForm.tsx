// CustomerForm.tsx - Komponen Form Data Pelanggan

import React from 'react';
import type { CustomerData } from './types';

interface CustomerFormProps {
  customerData: CustomerData;
  setCustomerData: React.Dispatch<React.SetStateAction<CustomerData>>;
  showCustomerDetails: boolean;
  setShowCustomerDetails: React.Dispatch<React.SetStateAction<boolean>>;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  customerData,
  setCustomerData,
  showCustomerDetails,
  setShowCustomerDetails,
}) => {
  return (
    <div
      style={{
        background: '#f8f9fa',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        border: !customerData.nama_pelanggan.trim()
          ? '2px solid #dc3545'
          : '1px solid #ddd',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
          👤 Data Pelanggan <span style={{ color: '#dc3545' }}>*WAJIB</span>
        </h3>
        <button
          type="button"
          onClick={() => setShowCustomerDetails(!showCustomerDetails)}
          style={{
            background: 'none',
            border: '1px solid #ddd',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          {showCustomerDetails ? '➖ Sembunyikan' : '➕ Detail Lengkap'}
        </button>
      </div>

      <div style={{ marginBottom: showCustomerDetails ? '1rem' : '0' }}>
        <input
          type="text"
          value={customerData.nama_pelanggan}
          onChange={e =>
            setCustomerData({
              ...customerData,
              nama_pelanggan: e.target.value,
            })
          }
          placeholder="Nama Pelanggan *WAJIB"
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '6px',
            border: !customerData.nama_pelanggan.trim()
              ? '2px solid #dc3545'
              : '1px solid #ddd',
            fontSize: '1rem',
            fontWeight: !customerData.nama_pelanggan.trim() ? 'bold' : 'normal',
          }}
        />
        {!customerData.nama_pelanggan.trim() && (
          <p
            style={{
              margin: '0.25rem 0 0 0',
              color: '#dc3545',
              fontSize: '0.8rem',
            }}
          >
            ⚠️ Nama pelanggan harus diisi!
          </p>
        )}
      </div>

      {showCustomerDetails && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
          }}
        >
          <input
            type="tel"
            value={customerData.no_telepon}
            onChange={e =>
              setCustomerData({
                ...customerData,
                no_telepon: e.target.value,
              })
            }
            placeholder="No. Telepon (opsional)"
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid #ddd',
            }}
          />
          <input
            type="email"
            value={customerData.email}
            onChange={e =>
              setCustomerData({
                ...customerData,
                email: e.target.value,
              })
            }
            placeholder="Email (opsional)"
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid #ddd',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CustomerForm;
