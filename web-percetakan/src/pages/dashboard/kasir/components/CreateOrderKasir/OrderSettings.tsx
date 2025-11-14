// OrderSettings.tsx

import React from 'react';
import type {
  OrderSettings as OrderSettingsType,
  PromoData,
  AutoDiscount,
} from './types';

interface OrderSettingsProps {
  orderSettings: OrderSettingsType;
  setOrderSettings: React.Dispatch<React.SetStateAction<OrderSettingsType>>;
  kodePromo: string;
  setKodePromo: React.Dispatch<React.SetStateAction<string>>;
  promoData: PromoData | null;
  promoError: string;
  loadingPromo: boolean;
  onValidatePromo: () => void;
  onRemovePromo: () => void;
  autoDiscount: AutoDiscount; // ✅ TAMBAHAN BARU
}

const OrderSettings: React.FC<OrderSettingsProps> = ({
  orderSettings,
  setOrderSettings,
  kodePromo,
  setKodePromo,
  promoData,
  promoError,
  loadingPromo,
  onValidatePromo,
  onRemovePromo,
  autoDiscount, // ✅ TAMBAHAN BARU
}) => {
  const [diskonMode, setDiskonMode] = React.useState<'promo' | 'manual'>(
    'promo',
  );

  return (
    <div style={{ marginBottom: '1rem' }}>
      {/* KECEPATAN PENGERJAAN */}
      <div style={{ marginBottom: '1rem' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '500',
          }}
        >
          Kecepatan Pengerjaan
        </label>
        <select
          value={orderSettings.kecepatan_pengerjaan}
          onChange={e =>
            setOrderSettings({
              ...orderSettings,
              kecepatan_pengerjaan: e.target.value as 'normal' | 'express',
            })
          }
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '6px',
            border: '1px solid #ddd',
          }}
        >
          <option value="normal">⏱️ Normal (Standar)</option>
          <option value="express">⚡ Express (+50% harga)</option>
        </select>
      </div>

      {/* ✅ AUTO-DISCOUNT INFO (TAMBAHAN BARU) */}
      {autoDiscount.active && (
        <div
          style={{
            background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
            ✨ AUTO-DISCOUNT AKTIF
          </div>
          <div
            style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              marginTop: '0.25rem',
            }}
          >
            {autoDiscount.description}
          </div>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginTop: '0.25rem',
            }}
          >
            -Rp {autoDiscount.discount_amount.toLocaleString()}
          </div>
          <div
            style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.9 }}
          >
            💡 Pakai kode promo untuk diskon lebih besar!
          </div>
        </div>
      )}

      {/* DISKON SECTION */}
      <div
        style={{
          background: '#f8f9fa',
          padding: '1rem',
          borderRadius: '8px',
          border: '2px solid #e0e0e0',
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
          <h4 style={{ margin: 0, fontSize: '1rem' }}>🎟️ Diskon Tambahan</h4>

          {/* TOGGLE BUTTON */}
          <div
            style={{
              display: 'flex',
              background: '#e0e0e0',
              borderRadius: '6px',
              padding: '0.25rem',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setDiskonMode('promo');
                setOrderSettings({ ...orderSettings, diskon: 0 });
              }}
              style={{
                padding: '0.4rem 1rem',
                border: 'none',
                borderRadius: '4px',
                background: diskonMode === 'promo' ? '#667eea' : 'transparent',
                color: diskonMode === 'promo' ? 'white' : '#666',
                cursor: 'pointer',
                fontWeight: diskonMode === 'promo' ? 'bold' : 'normal',
                fontSize: '0.85rem',
              }}
            >
              Kode Promo
            </button>
            <button
              type="button"
              onClick={() => {
                setDiskonMode('manual');
                onRemovePromo();
              }}
              style={{
                padding: '0.4rem 1rem',
                border: 'none',
                borderRadius: '4px',
                background: diskonMode === 'manual' ? '#667eea' : 'transparent',
                color: diskonMode === 'manual' ? 'white' : '#666',
                cursor: 'pointer',
                fontWeight: diskonMode === 'manual' ? 'bold' : 'normal',
                fontSize: '0.85rem',
              }}
            >
              Diskon Manual
            </button>
          </div>
        </div>

        {/* MODE: KODE PROMO */}
        {diskonMode === 'promo' && (
          <>
            {promoData ? (
              // Promo Aktif
              <div
                style={{
                  background:
                    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  padding: '1rem',
                  borderRadius: '8px',
                  color: 'white',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                      ✅ Promo Aktif
                    </div>
                    <div
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        marginTop: '0.25rem',
                      }}
                    >
                      {promoData.kode_promo}
                    </div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      {promoData.nama_promo}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                      -Rp {promoData.nilai_diskon_rupiah.toLocaleString()}
                    </div>
                    <button
                      type="button"
                      onClick={onRemovePromo}
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        border: 'none',
                        background: 'rgba(255,255,255,0.3)',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                      }}
                    >
                      ✕ Hapus
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Input Promo
              <>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={kodePromo}
                    onChange={e => setKodePromo(e.target.value.toUpperCase())}
                    placeholder="MASUKKAN KODE PROMO"
                    style={{
                      flex: 1,
                      padding: '0.65rem',
                      borderRadius: '6px',
                      border: promoError
                        ? '2px solid #dc3545'
                        : '1px solid #ddd',
                      textTransform: 'uppercase',
                      fontWeight: '500',
                    }}
                  />
                  <button
                    type="button"
                    onClick={onValidatePromo}
                    disabled={loadingPromo || !kodePromo.trim()}
                    style={{
                      padding: '0.65rem 1.5rem',
                      borderRadius: '6px',
                      border: 'none',
                      background:
                        loadingPromo || !kodePromo.trim() ? '#ccc' : '#28a745',
                      color: 'white',
                      cursor:
                        loadingPromo || !kodePromo.trim()
                          ? 'not-allowed'
                          : 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    {loadingPromo ? '⏳' : '✓ Pakai'}
                  </button>
                </div>

                {promoError && (
                  <p
                    style={{
                      margin: '0.5rem 0 0 0',
                      color: '#dc3545',
                      fontSize: '0.8rem',
                    }}
                  >
                    ⚠️ {promoError}
                  </p>
                )}

                <p
                  style={{
                    margin: '0.75rem 0 0 0',
                    fontSize: '0.75rem',
                    color: '#666',
                  }}
                >
                  💡 Kode promo untuk diskon tambahan di atas auto-discount
                </p>
              </>
            )}
          </>
        )}

        {/* MODE: DISKON MANUAL */}
        {diskonMode === 'manual' && (
          <>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                fontSize: '0.9rem',
              }}
            >
              💸 Diskon Manual (Rp)
            </label>
            <input
              type="number"
              value={orderSettings.diskon}
              onChange={e =>
                setOrderSettings({
                  ...orderSettings,
                  diskon: parseFloat(e.target.value) || 0,
                })
              }
              min="0"
              placeholder="0"
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '1rem',
                fontWeight: '500',
              }}
            />
            <p
              style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.75rem',
                color: '#666',
              }}
            >
              💡 Diskon manual akan menggantikan auto-discount
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderSettings;
