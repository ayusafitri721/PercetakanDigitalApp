// CustomerForm.tsx - Blue Theme with Lucide Icons

import React from 'react';
import { User, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
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
        background: '#f8fafc',
        padding: '1.25rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        border: !customerData.nama_pelanggan.trim()
          ? '2px solid #ef4444'
          : '2px solid #e2e8f0',
        boxShadow: !customerData.nama_pelanggan.trim()
          ? '0 0 0 3px rgba(239,68,68,0.1)'
          : 'none',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
            <User size={20} color="white" strokeWidth={2.5} />
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: '1.1rem',
              color: '#1e293b',
              fontWeight: '600',
            }}
          >
            Data Pelanggan{' '}
            <span style={{ color: '#ef4444', fontWeight: '700' }}>*WAJIB</span>
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setShowCustomerDetails(!showCustomerDetails)}
          style={{
            background: 'white',
            border: '2px solid #e2e8f0',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.background = '#f8fafc';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.background = 'white';
          }}
        >
          {showCustomerDetails ? (
            <>
              <ChevronUp size={16} />
              Sembunyikan
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Detail Lengkap
            </>
          )}
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
            padding: '0.875rem',
            borderRadius: '8px',
            border: !customerData.nama_pelanggan.trim()
              ? '2px solid #ef4444'
              : '2px solid #e2e8f0',
            fontSize: '1rem',
            fontWeight: !customerData.nama_pelanggan.trim() ? '600' : 'normal',
            transition: 'all 0.2s',
            outline: 'none',
          }}
          onFocus={e => {
            if (customerData.nama_pelanggan.trim()) {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow =
                '0 0 0 3px rgba(59,130,246,0.1)';
            }
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor =
              !customerData.nama_pelanggan.trim() ? '#ef4444' : '#e2e8f0';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        {!customerData.nama_pelanggan.trim() && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem',
              color: '#ef4444',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
          >
            <AlertCircle size={16} />
            <span>Nama pelanggan harus diisi!</span>
          </div>
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
              padding: '0.875rem',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              fontSize: '0.95rem',
              transition: 'all 0.2s',
              outline: 'none',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow =
                '0 0 0 3px rgba(59,130,246,0.1)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = 'none';
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
              padding: '0.875rem',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              fontSize: '0.95rem',
              transition: 'all 0.2s',
              outline: 'none',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow =
                '0 0 0 3px rgba(59,130,246,0.1)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CustomerForm;
