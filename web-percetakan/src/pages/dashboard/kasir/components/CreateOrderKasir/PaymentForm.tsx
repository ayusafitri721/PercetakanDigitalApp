// PaymentForm.tsx - Blue Theme with Lucide Icons

import React from 'react';
import {
  User,
  ShoppingBag,
  CreditCard,
  Banknote,
  Building2,
  Smartphone,
  CheckCircle,
  ArrowLeft,
  Tag,
  Zap,
  Sparkles,
  Loader2,
  Paperclip,
  FileText,
} from 'lucide-react';
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
  let discountIcon = null;

  if (promoData && promoData.nilai_diskon_rupiah > 0) {
    activeDiscount = promoData.nilai_diskon_rupiah;
    discountLabel = `Promo (${promoData.kode_promo})`;
    discountIcon = <Tag size={16} strokeWidth={2.5} />;
  } else if (autoDiscount && autoDiscount.active) {
    activeDiscount = autoDiscount.discount_amount;
    discountLabel = autoDiscount.description;
    discountIcon = <Sparkles size={16} strokeWidth={2.5} />;
  } else if (orderSettings.diskon > 0) {
    activeDiscount = orderSettings.diskon;
    discountLabel = 'Diskon Manual';
    discountIcon = <Tag size={16} strokeWidth={2.5} />;
  }

  return (
    <form onSubmit={onSubmit}>
      <div style={{ padding: '1.5rem' }}>
        {/* Customer Info */}
        <div
          style={{
            background: '#f8fafc',
            padding: '1.25rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            border: '2px solid #e2e8f0',
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
              <User size={20} color="white" strokeWidth={2.5} />
            </div>
            <h4
              style={{
                margin: 0,
                fontSize: '1rem',
                color: '#64748b',
                fontWeight: '600',
              }}
            >
              Data Pelanggan
            </h4>
          </div>
          <div style={{ fontSize: '0.95rem' }}>
            <strong style={{ color: '#1e293b', fontSize: '1.05rem' }}>
              {customerData.nama_pelanggan}
            </strong>
            {customerData.no_telepon && (
              <div
                style={{
                  color: '#64748b',
                  fontSize: '0.875rem',
                  marginTop: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Smartphone size={14} />
                {customerData.no_telepon}
              </div>
            )}
            {customerData.email && (
              <div
                style={{
                  color: '#64748b',
                  fontSize: '0.875rem',
                  marginTop: '0.25rem',
                }}
              >
                {customerData.email}
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div
          style={{
            background: '#f8fafc',
            padding: '1.25rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            border: '2px solid #e2e8f0',
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
            <h4
              style={{
                margin: 0,
                fontSize: '1rem',
                color: '#64748b',
                fontWeight: '600',
              }}
            >
              Ringkasan Pesanan
            </h4>
          </div>

          {items.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
                fontSize: '0.95rem',
                paddingBottom: '0.75rem',
                borderBottom:
                  idx < items.length - 1 ? '1px solid #e2e8f0' : 'none',
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
                  <span style={{ color: '#1e293b', fontWeight: '600' }}>
                    {idx + 1}. {item.nama_product} × {item.jumlah}
                  </span>
                  {item.file_desain && (
                    <span
                      style={{
                        background:
                          'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <Paperclip size={10} strokeWidth={3} />
                    </span>
                  )}
                </div>
                {item.catatan && (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#64748b',
                      fontStyle: 'italic',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <FileText size={12} />
                    {item.catatan}
                  </div>
                )}
              </div>
              <strong style={{ color: '#1e40af' }}>
                {formatRupiah(item.subtotal)}
              </strong>
            </div>
          ))}

          <hr
            style={{
              margin: '1rem 0',
              border: 'none',
              borderTop: '1px solid #cbd5e1',
            }}
          />

          <div style={{ fontSize: '0.95rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
                color: '#475569',
              }}
            >
              <span>Subtotal:</span>
              <span style={{ fontWeight: '600' }}>
                {formatRupiah(subtotal)}
              </span>
            </div>

            {activeDiscount > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                  color: '#10b981',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '600',
                  }}
                >
                  {discountIcon}
                  {discountLabel}:
                </span>
                <span style={{ fontWeight: '700' }}>
                  - {formatRupiah(activeDiscount)}
                </span>
              </div>
            )}

            {orderSettings.kecepatan_pengerjaan === 'express' && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                  color: '#f59e0b',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '600',
                  }}
                >
                  <Zap size={16} strokeWidth={2.5} />
                  Express (+50%):
                </span>
                <span style={{ fontWeight: '700' }}>
                  + {formatRupiah(subtotal * 0.5)}
                </span>
              </div>
            )}
          </div>

          <hr
            style={{
              margin: '1rem 0',
              border: 'none',
              borderTop: '2px solid #3b82f6',
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.25rem',
              fontWeight: '700',
            }}
          >
            <span style={{ color: '#1e293b' }}>TOTAL:</span>
            <span style={{ color: '#1e40af' }}>{formatRupiah(totalHarga)}</span>
          </div>
        </div>

        {/* Payment Method */}
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
              <CreditCard size={20} color="white" strokeWidth={2.5} />
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: '1.1rem',
                color: '#1e40af',
                fontWeight: '600',
              }}
            >
              Metode Pembayaran
            </h3>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.75rem',
                fontWeight: '600',
                color: '#475569',
                fontSize: '0.95rem',
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
                padding: '0.875rem',
                borderRadius: '8px',
                border: '2px solid #93c5fd',
                background: 'white',
                fontSize: '0.95rem',
                fontWeight: '600',
                color: '#1e40af',
                cursor: 'pointer',
                outline: 'none',
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
                    marginBottom: '0.75rem',
                    fontWeight: '600',
                    color: '#475569',
                    fontSize: '0.95rem',
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
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '2px solid #3b82f6',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#1e40af',
                    outline: 'none',
                  }}
                />
              </div>

              {kembalian > 0 && (
                <div
                  style={{
                    background:
                      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    marginTop: '1rem',
                    boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
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
                    <Banknote size={20} color="white" strokeWidth={2.5} />
                    <h4
                      style={{
                        margin: 0,
                        fontSize: '1rem',
                        color: 'white',
                        opacity: 0.95,
                        fontWeight: '600',
                      }}
                    >
                      KEMBALIAN
                    </h4>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '2.5rem',
                      fontWeight: '700',
                      color: 'white',
                      letterSpacing: '-1px',
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
                background: 'white',
                border: '2px solid #93c5fd',
                padding: '1.25rem',
                borderRadius: '10px',
                marginTop: '1rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <Building2 size={20} color="#1e40af" strokeWidth={2.5} />
                <h4
                  style={{
                    margin: 0,
                    fontSize: '0.95rem',
                    color: '#1e40af',
                    fontWeight: '700',
                  }}
                >
                  Transfer ke Rekening:
                </h4>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#475569' }}>
                <p style={{ margin: '0.5rem 0' }}>
                  <strong>Bank:</strong> BCA
                </p>
                <p style={{ margin: '0.5rem 0' }}>
                  <strong>No. Rekening:</strong> 1234567890
                </p>
                <p style={{ margin: '0.5rem 0' }}>
                  <strong>Atas Nama:</strong> Percetakan XYZ
                </p>
                <p
                  style={{
                    margin: '0.75rem 0 0 0',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    color: '#1e40af',
                  }}
                >
                  <strong>Jumlah:</strong> {formatRupiah(totalHarga)}
                </p>
              </div>
            </div>
          )}

          {paymentData.metode_pembayaran === 'qris' && qrCodeUrl && (
            <div
              style={{
                background: 'white',
                border: '2px solid #93c5fd',
                padding: '1.5rem',
                borderRadius: '10px',
                marginTop: '1rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <Smartphone size={20} color="#1e40af" strokeWidth={2.5} />
                <h4
                  style={{
                    margin: 0,
                    fontSize: '0.95rem',
                    color: '#1e40af',
                    fontWeight: '700',
                  }}
                >
                  Scan QR Code
                </h4>
              </div>
              <div
                style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '10px',
                  display: 'inline-block',
                  border: '2px solid #e2e8f0',
                }}
              >
                <img
                  src={qrCodeUrl}
                  alt="QRIS"
                  style={{ width: '250px', height: '250px', display: 'block' }}
                />
              </div>
              <p
                style={{
                  margin: '1rem 0 0 0',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: '#1e40af',
                }}
              >
                Total: {formatRupiah(totalHarga)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
          padding: '1.5rem',
          borderTop: '2px solid #e2e8f0',
          position: 'sticky',
          bottom: 0,
          background: 'white',
          borderRadius: '0 0 16px 16px',
        }}
      >
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          style={{
            padding: '0.875rem 1.75rem',
            borderRadius: '10px',
            border: '2px solid #cbd5e1',
            background: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            if (!loading) {
              e.currentTarget.style.borderColor = '#94a3b8';
              e.currentTarget.style.background = '#f8fafc';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.background = 'white';
          }}
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
          Kembali
        </button>
        <button
          type="submit"
          disabled={
            loading ||
            (paymentData.metode_pembayaran === 'cash' &&
              paymentData.uang_diterima < totalHarga)
          }
          style={{
            padding: '0.875rem 1.75rem',
            borderRadius: '10px',
            border: 'none',
            background:
              loading ||
              (paymentData.metode_pembayaran === 'cash' &&
                paymentData.uang_diterima < totalHarga)
                ? '#cbd5e1'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            cursor:
              loading ||
              (paymentData.metode_pembayaran === 'cash' &&
                paymentData.uang_diterima < totalHarga)
                ? 'not-allowed'
                : 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow:
              loading ||
              (paymentData.metode_pembayaran === 'cash' &&
                paymentData.uang_diterima < totalHarga)
                ? 'none'
                : '0 4px 12px rgba(16,185,129,0.4)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            if (
              !loading &&
              !(
                paymentData.metode_pembayaran === 'cash' &&
                paymentData.uang_diterima < totalHarga
              )
            ) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow =
                '0 6px 16px rgba(16,185,129,0.5)';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.4)';
          }}
        >
          {loading ? (
            <>
              <Loader2 size={18} strokeWidth={2.5} className="animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <CheckCircle size={18} strokeWidth={2.5} />
              KONFIRMASI BAYAR
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
