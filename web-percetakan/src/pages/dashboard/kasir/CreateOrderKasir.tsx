import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost/api-percetakan/api';

interface Product {
  id_product: string;
  nama_product: string;
  harga_dasar: number;
  satuan: string;
  nama_category: string;
}

interface CreateOrderKasirProps {
  onClose: (success: boolean) => void;
}

const CreateOrderKasir: React.FC<CreateOrderKasirProps> = ({ onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [step, setStep] = useState<'order' | 'payment'>('order');

  const [formData, setFormData] = useState({
    nama_pelanggan: 'Pelanggan Umum',
    no_telepon: '',
    email: '',
    alamat: '',
    id_product: '',
    jumlah: 1,
    kecepatan_pengerjaan: 'normal' as 'normal' | 'express',
    diskon: 0,
  });

  const [paymentData, setPaymentData] = useState({
    metode_pembayaran: 'cash' as 'cash' | 'transfer' | 'qris',
    jumlah_bayar: 0,
    uang_diterima: 0,
  });

  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [totalHarga, setTotalHarga] = useState(0);
  const [kembalian, setKembalian] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [
    formData.id_product,
    formData.jumlah,
    formData.kecepatan_pengerjaan,
    formData.diskon,
    products,
  ]);

  useEffect(() => {
    calculateKembalian();
  }, [paymentData.uang_diterima, totalHarga, paymentData.metode_pembayaran]);

  useEffect(() => {
    if (step === 'payment' && paymentData.metode_pembayaran === 'qris') {
      generateQRCode();
    }
  }, [step, paymentData.metode_pembayaran, totalHarga]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/products.php`);
      if (response.data.status === 'success') {
        const productsData = response.data.data?.products || [];
        setProducts(productsData);
      } else {
        alert('Gagal memuat produk: ' + response.data.message);
      }
    } catch (error: any) {
      alert('Gagal terhubung ke server.\n' + (error.message || ''));
    } finally {
      setLoadingProducts(false);
    }
  };

  const calculateTotal = () => {
    const product = products.find(p => p.id_product === formData.id_product);
    if (product) {
      let calculatedSubtotal = Number(product.harga_dasar) * formData.jumlah;
      setSubtotal(calculatedSubtotal);

      let total = calculatedSubtotal - formData.diskon;

      if (formData.kecepatan_pengerjaan === 'express') {
        total = total * 1.5;
      }

      setTotalHarga(Math.max(0, total));
      setPaymentData(prev => ({
        ...prev,
        jumlah_bayar: Math.max(0, total),
        uang_diterima: Math.max(0, total),
      }));
    } else {
      setSubtotal(0);
      setTotalHarga(0);
    }
  };

  const calculateKembalian = () => {
    if (paymentData.metode_pembayaran === 'cash') {
      const change = paymentData.uang_diterima - totalHarga;
      setKembalian(Math.max(0, change));
    } else {
      setKembalian(0);
    }
  };

  const generateQRCode = () => {
    const qrData = `QRIS_PAYMENT|AMOUNT:${totalHarga}|MERCHANT:PERCETAKAN_XYZ`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      qrData,
    )}`;
    setQrCodeUrl(qrUrl);
  };

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.id_product) {
      alert('Produk wajib dipilih');
      return;
    }

    if (formData.jumlah < 1) {
      alert('Jumlah minimal 1');
      return;
    }

    setStep('payment');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentData.metode_pembayaran === 'cash') {
      if (paymentData.uang_diterima < totalHarga) {
        alert('Uang yang diterima kurang dari total pembayaran!');
        return;
      }
    } else if (
      paymentData.metode_pembayaran === 'transfer' ||
      paymentData.metode_pembayaran === 'qris'
    ) {
      const confirm = window.confirm(
        `Apakah pembayaran via ${paymentData.metode_pembayaran.toUpperCase()} sebesar ${formatRupiah(
          totalHarga,
        )} sudah diterima?`,
      );
      if (!confirm) return;
    }

    setLoading(true);

    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

      console.log('=== CREATING ORDER WITH PAYMENT ===');

      let userId = null;
      let customerCode = '';

      if (formData.email && showCustomerDetails) {
        try {
          const checkResponse = await axios.get(`${API_BASE_URL}/users.php`);
          if (checkResponse.data.status === 'success') {
            const users = checkResponse.data.data?.users || [];
            const existingUser = users.find(
              (u: any) => u.email === formData.email,
            );
            if (existingUser) {
              userId = existingUser.id_user;
              customerCode = existingUser.nama || 'CUS-' + userId;
            }
          }
        } catch (err) {
          console.log('Error checking user');
        }
      }

      if (!userId) {
        try {
          const allUsersResponse = await axios.get(`${API_BASE_URL}/users.php`);
          let nextNumber = 1;

          if (allUsersResponse.data.status === 'success') {
            const allUsers = allUsersResponse.data.data?.users || [];
            const customerCodes = allUsers
              .filter((u: any) => u.nama && u.nama.startsWith('CUS-'))
              .map((u: any) => {
                const match = u.nama.match(/CUS-(\d+)/);
                return match ? parseInt(match[1]) : 0;
              });

            if (customerCodes.length > 0) {
              nextNumber = Math.max(...customerCodes) + 1;
            }
          }

          customerCode = `CUS-${String(nextNumber).padStart(3, '0')}`;
        } catch (err) {
          customerCode = `CUS-${Date.now().toString().slice(-6)}`;
        }

        const userData = new FormData();
        userData.append(
          'nama',
          showCustomerDetails && formData.nama_pelanggan !== 'Pelanggan Umum'
            ? `${customerCode} - ${formData.nama_pelanggan}`
            : customerCode,
        );
        userData.append(
          'email',
          formData.email || `${customerCode.toLowerCase()}@guest.local`,
        );
        userData.append('password', 'guest123');
        userData.append('role', 'pelanggan');
        userData.append('no_telepon', formData.no_telepon || '');
        userData.append('alamat', formData.alamat || '');

        const userResponse = await axios.post(
          `${API_BASE_URL}/users.php?op=create`,
          userData,
        );

        if (userResponse.data.status === 'success') {
          userId = userResponse.data.data?.id_user;
        } else {
          throw new Error('Gagal membuat data pelanggan');
        }
      }

      if (!userId) {
        throw new Error('Gagal mendapatkan ID user');
      }

      const orderData = new FormData();
      orderData.append('id_user', userId.toString());

      if (currentUser.id_user && currentUser.role === 'kasir') {
        orderData.append('id_kasir', currentUser.id_user.toString());
      }

      orderData.append('jenis_order', 'offline');
      orderData.append('kecepatan_pengerjaan', formData.kecepatan_pengerjaan);
      orderData.append('subtotal', subtotal.toString());
      orderData.append('diskon', formData.diskon.toString());
      orderData.append('ongkir', '0');
      orderData.append('total_harga', totalHarga.toString());
      orderData.append(
        'catatan_pelanggan',
        `Pembayaran: ${paymentData.metode_pembayaran.toUpperCase()}`,
      );
      orderData.append(
        'catatan_internal',
        paymentData.metode_pembayaran === 'cash'
          ? `Dibayar TUNAI - Diterima: Rp ${paymentData.uang_diterima.toLocaleString(
              'id-ID',
            )} - Kembalian: Rp ${kembalian.toLocaleString('id-ID')}`
          : `Dibayar ${paymentData.metode_pembayaran.toUpperCase()} - Rp ${totalHarga.toLocaleString(
              'id-ID',
            )}`,
      );
      orderData.append('status_order', 'dibayar');

      const orderResponse = await axios.post(
        `${API_BASE_URL}/orders.php?op=create`,
        orderData,
      );

      if (orderResponse.data.status !== 'success') {
        throw new Error('Gagal membuat order');
      }

      const orderId = orderResponse.data.data?.id_order;
      const kodeOrder = orderResponse.data.data?.kode_order;

      if (!orderId) {
        throw new Error('ID Order tidak ditemukan');
      }

      const product = products.find(p => p.id_product === formData.id_product);
      if (!product) {
        throw new Error('Produk tidak ditemukan');
      }

      const itemSubtotal = Number(product.harga_dasar) * formData.jumlah;

      const itemData = new FormData();
      itemData.append('id_order', orderId.toString());
      itemData.append('id_product', formData.id_product);
      itemData.append('ukuran', 'Standard');
      itemData.append('jumlah', formData.jumlah.toString());
      itemData.append('harga_satuan', product.harga_dasar.toString());
      itemData.append('subtotal', itemSubtotal.toString());
      itemData.append('keterangan', '');

      const itemResponse = await axios.post(
        `${API_BASE_URL}/order_items.php?op=create`,
        itemData,
      );

      if (itemResponse.status !== 200 && itemResponse.status !== 201) {
        throw new Error('Gagal membuat item pesanan');
      }

      console.log('Step 4: Creating Payment Record...');

      const paymentFormData = new FormData();
      paymentFormData.append('id_order', orderId.toString());
      paymentFormData.append(
        'metode_pembayaran',
        paymentData.metode_pembayaran,
      );
      paymentFormData.append('nama_bank', '');
      paymentFormData.append('nomor_rekening', '');
      paymentFormData.append('nama_pemilik', formData.nama_pelanggan);
      paymentFormData.append('jumlah_bayar', totalHarga.toString());
      paymentFormData.append('bukti_bayar', '');

      const paymentResponse = await axios.post(
        `${API_BASE_URL}/payments.php?op=create`,
        paymentFormData,
      );

      console.log('Payment record created:', paymentResponse.data);

      if (paymentResponse.data.status !== 'success') {
        console.warn('Payment creation warning:', paymentResponse.data);
      }

      let alertMessage = `✅ TRANSAKSI BERHASIL!\n\n🎫 Kode Order: ${kodeOrder}\n👤 Customer: ${customerCode}\n📦 ${
        product.nama_product
      } (${formData.jumlah} ${product.satuan})\n\n💰 Total: ${formatRupiah(
        totalHarga,
      )}\n`;

      if (paymentData.metode_pembayaran === 'cash') {
        alertMessage += `💵 Uang Diterima: ${formatRupiah(
          paymentData.uang_diterima,
        )}\n💵 Kembalian: ${formatRupiah(kembalian)}\n`;
      } else {
        alertMessage += `💳 Bayar via: ${
          paymentData.metode_pembayaran === 'qris' ? 'QRIS' : 'TRANSFER BANK'
        }\n`;
      }

      alertMessage += `\n✅ Status: DIBAYAR LUNAS\n💳 Pembayaran tercatat di sistem\n🚀 Pesanan langsung masuk queue OPERATOR\n\nCustomer code: ${customerCode} untuk order berikutnya`;

      alert(alertMessage);

      onClose(true);
    } catch (error: any) {
      console.error('Error:', error);
      let errorMsg = error.message || 'Terjadi kesalahan';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      alert('❌ Gagal:\n' + errorMsg);
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
    <div
      onClick={() => (step === 'order' ? onClose(false) : null)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.5rem',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
            {step === 'order' ? '🛒 Buat Pesanan' : '💳 Pembayaran'}
          </h2>
          <button
            onClick={() => onClose(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666',
            }}
          >
            ✕
          </button>
        </div>

        {step === 'order' ? (
          <form onSubmit={handleNextToPayment}>
            <div style={{ padding: '1.5rem' }}>
              <div
                style={{
                  background: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: showCustomerDetails ? '1rem' : '0',
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                    👤 Data Pelanggan
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
                    {showCustomerDetails
                      ? '➖ Sembunyikan'
                      : '➕ Tambah Detail'}
                  </button>
                </div>

                {!showCustomerDetails && (
                  <p
                    style={{
                      margin: '0.5rem 0 0 0',
                      color: '#666',
                      fontSize: '0.9rem',
                    }}
                  >
                    🎫 Customer Code auto-generate:{' '}
                    <strong>CUS-001, CUS-002, ...</strong>
                  </p>
                )}

                {showCustomerDetails && (
                  <>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Nama
                        </label>
                        <input
                          type="text"
                          value={formData.nama_pelanggan}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              nama_pelanggan: e.target.value,
                            })
                          }
                          placeholder="Nama lengkap"
                          disabled={loading}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          No. Telepon
                        </label>
                        <input
                          type="tel"
                          value={formData.no_telepon}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              no_telepon: e.target.value,
                            })
                          }
                          placeholder="08123456789"
                          disabled={loading}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '0.5rem',
                          fontWeight: '500',
                        }}
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="email@example.com"
                        disabled={loading}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid #ddd',
                        }}
                      />
                    </div>
                  </>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>
                  📦 Detail Pesanan
                </h3>

                <div style={{ marginBottom: '1rem' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: '500',
                    }}
                  >
                    Kecepatan
                  </label>
                  <select
                    value={formData.kecepatan_pengerjaan}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        kecepatan_pengerjaan: e.target.value as
                          | 'normal'
                          | 'express',
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
                    <option value="normal">⏱️ Normal</option>
                    <option value="express">⚡ Express (+50%)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: '500',
                    }}
                  >
                    Produk *
                  </label>
                  <select
                    value={formData.id_product}
                    onChange={e =>
                      setFormData({ ...formData, id_product: e.target.value })
                    }
                    required
                    disabled={loading || loadingProducts}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                    }}
                  >
                    <option value="">
                      {loadingProducts ? '⏳ Loading...' : '-- Pilih Produk --'}
                    </option>
                    {products.map(product => (
                      <option
                        key={product.id_product}
                        value={product.id_product}
                      >
                        {product.nama_product} -{' '}
                        {formatRupiah(Number(product.harga_dasar))}/
                        {product.satuan}
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: '500',
                      }}
                    >
                      Jumlah *
                    </label>
                    <input
                      type="number"
                      value={formData.jumlah}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          jumlah: parseInt(e.target.value) || 1,
                        })
                      }
                      min="1"
                      required
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: '500',
                      }}
                    >
                      Diskon (Rp)
                    </label>
                    <input
                      type="number"
                      value={formData.diskon}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          diskon: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="0"
                      disabled={loading}
                      placeholder="0"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                  TOTAL
                </h3>
                <p
                  style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}
                >
                  {formatRupiah(totalHarga)}
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                padding: '1.5rem',
                borderTop: '1px solid #e0e0e0',
              }}
            >
              <button
                type="button"
                onClick={() => onClose(false)}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || loadingProducts || products.length === 0}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#667eea',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Lanjut Bayar →
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitOrder}>
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
                  📋 Ringkasan Pesanan
                </h4>
                <div style={{ fontSize: '0.9rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <span>Produk:</span>
                    <strong>
                      {
                        products.find(p => p.id_product === formData.id_product)
                          ?.nama_product
                      }
                    </strong>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <span>Jumlah:</span>
                    <strong>{formData.jumlah}</strong>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <span>Subtotal:</span>
                    <strong>{formatRupiah(subtotal)}</strong>
                  </div>
                  {formData.diskon > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                        color: '#e74c3c',
                      }}
                    >
                      <span>Diskon:</span>
                      <strong>- {formatRupiah(formData.diskon)}</strong>
                    </div>
                  )}
                  {formData.kecepatan_pengerjaan === 'express' && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                        color: '#f39c12',
                      }}
                    >
                      <span>Express:</span>
                      <strong>+50%</strong>
                    </div>
                  )}
                  <hr
                    style={{
                      margin: '0.75rem 0',
                      border: 'none',
                      borderTop: '1px solid #ddd',
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '1.1rem',
                    }}
                  >
                    <strong>TOTAL:</strong>
                    <strong style={{ color: '#667eea' }}>
                      {formatRupiah(totalHarga)}
                    </strong>
                  </div>
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
                      {paymentData.uang_diterima < totalHarga && (
                        <small
                          style={{
                            color: '#e74c3c',
                            display: 'block',
                            marginTop: '0.25rem',
                          }}
                        >
                          ⚠️ Uang kurang! Min: {formatRupiah(totalHarga)}
                        </small>
                      )}
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
                        <strong>Jumlah Transfer:</strong>{' '}
                        {formatRupiah(totalHarga)}
                      </p>
                    </div>
                    <p
                      style={{
                        margin: '0.75rem 0 0 0',
                        fontSize: '0.85rem',
                        color: '#856404',
                      }}
                    >
                      ⚠️ Pastikan pembayaran sudah diterima sebelum konfirmasi!
                    </p>
                  </div>
                )}

                {paymentData.metode_pembayaran === 'qris' && (
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
                      📱 Scan QR Code untuk Pembayaran
                    </h4>

                    {qrCodeUrl && (
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
                          alt="QRIS Payment"
                          style={{
                            width: '250px',
                            height: '250px',
                            display: 'block',
                          }}
                        />
                      </div>
                    )}

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

                    <p
                      style={{
                        margin: '0.5rem 0 0 0',
                        fontSize: '0.85rem',
                        color: '#2e7d32',
                      }}
                    >
                      ⚠️ Pastikan pembayaran berhasil sebelum konfirmasi!
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
              }}
            >
              <button
                type="button"
                onClick={() => setStep('order')}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: 'white',
                  cursor: 'pointer',
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
        )}
      </div>
    </div>
  );
};

export default CreateOrderKasir;
