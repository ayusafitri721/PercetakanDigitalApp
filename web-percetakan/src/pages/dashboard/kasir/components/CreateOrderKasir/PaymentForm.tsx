import React from 'react';
import type {
  PaymentData,
  CustomerData,
  OrderItem,
  OrderSettings,
  PromoData,
  AutoDiscount,
} from './types';
import { formatRupiah } from './utils';

interface PaymentFormProps {
  paymentData: PaymentData;
  setPaymentData: React.Dispatch<React.SetStateAction<PaymentData>>;
  customerData: CustomerData;
  items: OrderItem[];
  subtotal: number;
  totalHarga: number;
  kembalian: number;
  qrCodeUrl: string;
  orderSettings: OrderSettings;
  promoData?: PromoData | null;
  autoDiscount?: AutoDiscount;
  loading: boolean;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  paymentData,
  setPaymentData,
  customerData,
  items,
  subtotal,
  totalHarga,
  kembalian,
  qrCodeUrl,
  orderSettings,
  promoData,
  autoDiscount,
  loading,
  onBack,
  onSubmit,
}) => {
  let activeDiscount = 0;
  let discountLabel = '';

  if (promoData && promoData.nilai_diskon_rupiah > 0) {
    activeDiscount = promoData.nilai_diskon_rupiah;
    discountLabel = `🎟️ Promo (${promoData.kode_promo})`;
  } else if (autoDiscount && autoDiscount.active) {
    activeDiscount = autoDiscount.discount_amount;
    discountLabel = `✨ ${autoDiscount.description}`;
  } else if (orderSettings.diskon > 0) {
    activeDiscount = orderSettings.diskon;
    discountLabel = '💸 Diskon Manual';
  }

  return (
    <form onSubmit={onSubmit}>
      <div style={{ padding: '1.5rem' }}>
        <div
          style={{
            background: '#f8f9fa',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}
        >
          <h4
            style={{
              margin: '0 0 0.75rem 0',
              fontSize: '0.9rem',
              color: '#666',
            }}
          >
            👤 Data Pelanggan
          </h4>
          <div style={{ fontSize: '0.95rem' }}>
            <strong>{customerData.nama_pelanggan}</strong>
            {customerData.no_telepon && (
              <div style={{ color: '#666', fontSize: '0.85rem' }}>
                📞 {customerData.no_telepon}
              </div>
            )}
            {customerData.email && (
              <div style={{ color: '#666', fontSize: '0.85rem' }}>
                📧 {customerData.email}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            background: '#f8f9fa',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}
        >
          <h4
            style={{
              margin: '0 0 0.75rem 0',
              fontSize: '0.9rem',
              color: '#666',
            }}
          >
            📋 Ringkasan Pesanan
          </h4>
          {items.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                paddingBottom: '0.5rem',
                borderBottom:
                  idx < items.length - 1 ? '1px solid #e0e0e0' : 'none',
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span>
                    {idx + 1}. {item.nama_product} × {item.jumlah}
                  </span>
                  {item.file_desain && (
                    <span
                      style={{
                        background: '#28a745',
                        color: 'white',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '3px',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                      }}
                    >
                      📎
                    </span>
                  )}
                </div>
                {item.catatan && (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#666',
                      fontStyle: 'italic',
                    }}
                  >
                    {item.catatan}
                  </div>
                )}
              </div>
              <strong>{formatRupiah(item.subtotal)}</strong>
            </div>
          ))}
          <hr
            style={{
              margin: '0.75rem 0',
              border: 'none',
              borderTop: '1px solid #ddd',
            }}
          />

          <div style={{ fontSize: '0.9rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.25rem',
              }}
            >
              <span>Subtotal:</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>

            {activeDiscount > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.25rem',
                  color: '#28a745',
                }}
              >
                <span>{discountLabel}:</span>
                <span>- {formatRupiah(activeDiscount)}</span>
              </div>
            )}

            {orderSettings.kecepatan_pengerjaan === 'express' && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.25rem',
                  color: '#f5576c',
                }}
              >
                <span>⚡ Express (+50%):</span>
                <span>+ {formatRupiah(subtotal * 0.5)}</span>
              </div>
            )}
          </div>

          <hr
            style={{
              margin: '0.75rem 0',
              border: 'none',
              borderTop: '2px solid #667eea',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}
          >
            <span>TOTAL:</span>
            <span style={{ color: '#667eea' }}>{formatRupiah(totalHarga)}</span>
          </div>
        </div>

        <div>
          <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>
            💳 Metode Pembayaran
          </h3>

          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
              }}
            >
              Pilih Metode *
            </label>
            <select
              value={paymentData.metode_pembayaran}
              onChange={e =>
                setPaymentData({
                  ...paymentData,
                  metode_pembayaran: e.target.value as
                    | 'cash'
                    | 'transfer'
                    | 'qris',
                })
              }
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #ddd',
              }}
            >
              <option value="cash">💵 Tunai (Cash)</option>
              <option value="transfer">🏦 Transfer Bank</option>
              <option value="qris">📱 QRIS</option>
            </select>
          </div>

          {paymentData.metode_pembayaran === 'cash' && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  Uang Diterima *
                </label>
                <input
                  type="number"
                  value={paymentData.uang_diterima}
                  onChange={e =>
                    setPaymentData({
                      ...paymentData,
                      uang_diterima: parseFloat(e.target.value) || 0,
                    })
                  }
                  min={totalHarga}
                  required
                  disabled={loading}
                  placeholder={`Min: ${formatRupiah(totalHarga)}`}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '2px solid #667eea',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                  }}
                />
              </div>

              {kembalian > 0 && (
                <div
                  style={{
                    background:
                      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    marginTop: '1rem',
                  }}
                >
                  <h4
                    style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '1rem',
                      color: 'white',
                      opacity: 0.9,
                    }}
                  >
                    💵 KEMBALIAN
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      color: 'white',
                    }}
                  >
                    {formatRupiah(kembalian)}
                  </p>
                </div>
              )}
            </>
          )}

          {paymentData.metode_pembayaran === 'transfer' && (
            <div
              style={{
                background: '#fff3cd',
                border: '1px solid #ffc107',
                padding: '1rem',
                borderRadius: '8px',
                marginTop: '1rem',
              }}
            >
              <h4
                style={{
                  margin: '0 0 0.75rem 0',
                  fontSize: '0.95rem',
                  color: '#856404',
                }}
              >
                🏦 Transfer ke Rekening:
              </h4>
              <div style={{ fontSize: '0.9rem', color: '#856404' }}>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Bank:</strong> BCA
                </p>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>No. Rekening:</strong> 1234567890
                </p>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Atas Nama:</strong> Percetakan XYZ
                </p>
                <p style={{ margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>
                  <strong>Jumlah:</strong> {formatRupiah(totalHarga)}
                </p>
              </div>
            </div>
          )}

          {paymentData.metode_pembayaran === 'qris' && qrCodeUrl && (
            <div
              style={{
                background: '#e8f5e9',
                border: '1px solid #4caf50',
                padding: '1.5rem',
                borderRadius: '8px',
                marginTop: '1rem',
                textAlign: 'center',
              }}
            >
              <h4
                style={{
                  margin: '0 0 1rem 0',
                  fontSize: '0.95rem',
                  color: '#2e7d32',
                }}
              >
                📱 Scan QR Code
              </h4>
              <div
                style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '8px',
                  display: 'inline-block',
                }}
              >
                <img
                  src={qrCodeUrl}
                  alt="QRIS"
                  style={{ width: '250px', height: '250px' }}
                />
              </div>
              <p
                style={{
                  margin: '1rem 0 0 0',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  color: '#2e7d32',
                }}
              >
                Total: {formatRupiah(totalHarga)}
              </p>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
          padding: '1.5rem',
          borderTop: '1px solid #e0e0e0',
          position: 'sticky',
          bottom: 0,
          background: 'white',
        }}
      >
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            border: '1px solid #ddd',
            background: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          ← Kembali
        </button>
        <button
          type="submit"
          disabled={
            loading ||
            (paymentData.metode_pembayaran === 'cash' &&
              paymentData.uang_diterima < totalHarga)
          }
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            border: 'none',
            background:
              loading ||
              (paymentData.metode_pembayaran === 'cash' &&
                paymentData.uang_diterima < totalHarga)
                ? '#ccc'
                : '#43e97b',
            color: 'white',
            cursor:
              loading ||
              (paymentData.metode_pembayaran === 'cash' &&
                paymentData.uang_diterima < totalHarga)
                ? 'not-allowed'
                : 'pointer',
            fontWeight: '500',
          }}
        >
          {loading ? '⏳ Memproses...' : '✅ KONFIRMASI BAYAR'}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
