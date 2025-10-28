import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost/api-percetakan/api';

interface Order {
  id_order: string;
  kode_order: string;
  nama_pelanggan: string;
  total_harga: number;
}

interface PaymentKasirProps {
  order: Order;
  onClose: (success: boolean) => void;
}

const PaymentKasir: React.FC<PaymentKasirProps> = ({ order, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    metode_pembayaran: 'cash' as 'cash' | 'transfer' | 'qris' | 'ewallet',
    jumlah_bayar: order.total_harga,
    nama_bank: '',
    nomor_rekening: '',
    nama_pemilik: '',
    catatan: '',
  });
  const [kembalian, setKembalian] = useState(0);

  const handleJumlahBayarChange = (value: number) => {
    setFormData({ ...formData, jumlah_bayar: value });
    const change = value - order.total_harga;
    setKembalian(change > 0 ? change : 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.jumlah_bayar < order.total_harga) {
      alert('Jumlah pembayaran kurang dari total harga');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('id_order', order.id_order);
      submitData.append('metode_pembayaran', formData.metode_pembayaran);
      submitData.append('jumlah_bayar', formData.jumlah_bayar.toString());
      submitData.append('status_pembayaran', 'diterima');

      if (formData.metode_pembayaran === 'transfer') {
        submitData.append('nama_bank', formData.nama_bank);
        submitData.append('nomor_rekening', formData.nomor_rekening);
        submitData.append('nama_pemilik', formData.nama_pemilik);
      }

      submitData.append('catatan', formData.catatan);

      const response = await axios.post(
        `${API_BASE_URL}/payments.php?op=create`,
        submitData,
      );

      if (response.data.status === 'success') {
        // Update status order jadi dibayar
        await axios.post(
          `${API_BASE_URL}/orders.php?op=update&id=${order.id_order}`,
          new URLSearchParams({ status_order: 'dibayar' }),
        );

        if (kembalian > 0) {
          alert(
            `Pembayaran berhasil!\n\nKembalian: ${formatRupiah(kembalian)}`,
          );
        } else {
          alert('Pembayaran berhasil!');
        }

        onClose(true);
      } else {
        alert(response.data.message || 'Gagal menyimpan pembayaran');
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div
        className="modal-content modal-payment"
        onClick={e => e.stopPropagation()}
      >
        <h2>💳 Input Pembayaran</h2>

        <div className="payment-info">
          <div className="info-row">
            <span>Kode Order:</span>
            <strong>{order.kode_order}</strong>
          </div>
          <div className="info-row">
            <span>Pelanggan:</span>
            <strong>{order.nama_pelanggan}</strong>
          </div>
          <div className="info-row">
            <span>Total Harga:</span>
            <strong className="text-primary">
              {formatRupiah(order.total_harga)}
            </strong>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Metode Pembayaran *</label>
            <select
              value={formData.metode_pembayaran}
              onChange={e =>
                setFormData({
                  ...formData,
                  metode_pembayaran: e.target.value as any,
                })
              }
              required
            >
              <option value="cash">Cash / Tunai</option>
              <option value="transfer">Transfer Bank</option>
              <option value="qris">QRIS</option>
              <option value="ewallet">E-Wallet</option>
            </select>
          </div>

          {formData.metode_pembayaran === 'transfer' && (
            <>
              <div className="form-group">
                <label>Nama Bank</label>
                <input
                  type="text"
                  value={formData.nama_bank}
                  onChange={e =>
                    setFormData({ ...formData, nama_bank: e.target.value })
                  }
                  placeholder="Contoh: BCA"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nomor Rekening</label>
                  <input
                    type="text"
                    value={formData.nomor_rekening}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        nomor_rekening: e.target.value,
                      })
                    }
                    placeholder="1234567890"
                  />
                </div>

                <div className="form-group">
                  <label>Nama Pemilik</label>
                  <input
                    type="text"
                    value={formData.nama_pemilik}
                    onChange={e =>
                      setFormData({ ...formData, nama_pemilik: e.target.value })
                    }
                    placeholder="Nama pemilik rekening"
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Jumlah Bayar *</label>
            <input
              type="number"
              value={formData.jumlah_bayar}
              onChange={e =>
                handleJumlahBayarChange(parseFloat(e.target.value) || 0)
              }
              min={order.total_harga}
              step="1000"
              required
            />
          </div>

          {formData.metode_pembayaran === 'cash' && kembalian > 0 && (
            <div className="kembalian-box">
              <h3>Kembalian:</h3>
              <p className="kembalian-amount">{formatRupiah(kembalian)}</p>
            </div>
          )}

          <div className="form-group">
            <label>Catatan (Opsional)</label>
            <textarea
              value={formData.catatan}
              onChange={e =>
                setFormData({ ...formData, catatan: e.target.value })
              }
              rows={3}
              placeholder="Catatan pembayaran"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => onClose(false)}
              disabled={loading}
            >
              Batal
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Pembayaran'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentKasir;
    