import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { API_BASE_URL } from '../../../config';

interface Product {
  id_product: string;
  nama_product: string;
  harga_dasar: number;
  satuan: string;
  nama_category: string;
}

interface OrderItem {
  id_product: string;
  nama_product: string;
  jumlah: number;
  ukuran: string;
  harga_satuan: number;
  subtotal: number;
  catatan: string;
  file_desain?: File | null;
}

interface CreateOrderKasirProps {
  onClose: (success: boolean) => void;
}

const CreateOrderKasir: React.FC<CreateOrderKasirProps> = ({ onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [step, setStep] = useState<'order' | 'payment'>('order');

  const [customerData, setCustomerData] = useState({
    nama_pelanggan: '',
    no_telepon: '',
    email: '',
    alamat: '',
  });

  const [items, setItems] = useState<OrderItem[]>([]);

  const [currentItem, setCurrentItem] = useState({
    id_product: '',
    jumlah: 1,
    ukuran: 'Standard',
    catatan: '',
    file_desain: null as File | null,
  });

  const [orderSettings, setOrderSettings] = useState({
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [items, orderSettings.kecepatan_pengerjaan, orderSettings.diskon]);

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
      }
    } catch (error: any) {
      alert('Gagal memuat produk');
    } finally {
      setLoadingProducts(false);
    }
  };

  const isProductNeedDesign = (productId: string): boolean => {
    const product = products.find(p => p.id_product === productId);
    if (!product) return false;

    const noDesignCategories = [
      'fotokopi',
      'scan',
      'print dokumen',
      'laminating',
    ];
    return !noDesignCategories.some(cat =>
      product.nama_category?.toLowerCase().includes(cat),
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Ukuran file maksimal 10MB!');
        return;
      }

      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/pdf',
      ];
      if (!allowedTypes.includes(file.type)) {
        alert('Format file harus JPG, PNG, atau PDF!');
        return;
      }

      setCurrentItem({ ...currentItem, file_desain: file });
    }
  };

  const handleAddItem = () => {
    if (!currentItem.id_product) {
      alert('Pilih produk terlebih dahulu!');
      return;
    }

    const product = products.find(p => p.id_product === currentItem.id_product);
    if (!product) return;

    const needDesign = isProductNeedDesign(currentItem.id_product);

    if (needDesign && !currentItem.file_desain) {
      alert(
        `⚠️ Produk "${product.nama_product}" memerlukan file desain!\n\nSilakan upload file desain terlebih dahulu.`,
      );
      return;
    }

    if (!customerData.nama_pelanggan.trim()) {
      alert(
        '⚠️ Nama pelanggan harus diisi!\n\nMasukkan minimal nama pelanggan.',
      );
      setShowCustomerDetails(true);
      return;
    }

    const itemSubtotal = Number(product.harga_dasar) * currentItem.jumlah;

    const newItem: OrderItem = {
      id_product: currentItem.id_product,
      nama_product: product.nama_product,
      jumlah: currentItem.jumlah,
      ukuran: currentItem.ukuran,
      harga_satuan: Number(product.harga_dasar),
      subtotal: itemSubtotal,
      catatan: currentItem.catatan,
      file_desain: currentItem.file_desain,
    };

    setItems([...items, newItem]);

    setCurrentItem({
      id_product: '',
      jumlah: 1,
      ukuran: 'Standard',
      catatan: '',
      file_desain: null,
    });

    const fileInput = document.getElementById(
      'file_desain_input',
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const itemsSubtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    setSubtotal(itemsSubtotal);

    let total = itemsSubtotal - orderSettings.diskon;

    if (orderSettings.kecepatan_pengerjaan === 'express') {
      total = total * 1.5;
    }

    setTotalHarga(Math.max(0, total));
    setPaymentData(prev => ({
      ...prev,
      jumlah_bayar: Math.max(0, total),
      uang_diterima: Math.max(0, total),
    }));
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

    if (items.length === 0) {
      alert('Tambahkan minimal 1 produk!');
      return;
    }

    if (!customerData.nama_pelanggan.trim()) {
      alert('⚠️ Nama pelanggan wajib diisi!');
      setShowCustomerDetails(true);
      return;
    }

    setStep('payment');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentData.metode_pembayaran === 'cash') {
      if (paymentData.uang_diterima < totalHarga) {
        alert('Uang yang diterima kurang!');
        return;
      }
    }

    setLoading(true);

    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

      let userId = null;
      let customerCode = '';

      if (customerData.email && showCustomerDetails) {
        const checkResponse = await axios.get(`${API_BASE_URL}/users.php`);
        if (checkResponse.data.status === 'success') {
          const users = checkResponse.data.data?.users || [];
          const existingUser = users.find(
            (u: any) => u.email === customerData.email,
          );
          if (existingUser) {
            userId = existingUser.id_user;
            customerCode = existingUser.nama || 'CUS-' + userId;
          }
        }
      }

      if (!userId) {
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

        const userData = new FormData();
        userData.append(
          'nama',
          `${customerCode} - ${customerData.nama_pelanggan}`,
        );
        userData.append(
          'email',
          customerData.email || `${customerCode.toLowerCase()}@guest.local`,
        );
        userData.append('password', 'guest123');
        userData.append('role', 'pelanggan');
        userData.append('no_telepon', customerData.no_telepon || '');
        userData.append('alamat', customerData.alamat || '');

        const userResponse = await axios.post(
          `${API_BASE_URL}/users.php?op=create`,
          userData,
        );

        if (userResponse.data.status === 'success') {
          userId = userResponse.data.data?.id_user;
        }
      }

      if (!userId) throw new Error('Gagal mendapatkan ID user');

      const orderData = new FormData();
      orderData.append('id_user', userId.toString());
      if (currentUser.id_user)
        orderData.append('id_kasir', currentUser.id_user.toString());
      orderData.append('jenis_order', 'offline');
      orderData.append(
        'kecepatan_pengerjaan',
        orderSettings.kecepatan_pengerjaan,
      );
      orderData.append('subtotal', subtotal.toString());
      orderData.append('diskon', orderSettings.diskon.toString());
      orderData.append('ongkir', '0');
      orderData.append('total_harga', totalHarga.toString());
      orderData.append(
        'catatan_pelanggan',
        `Pembayaran: ${paymentData.metode_pembayaran.toUpperCase()}`,
      );
      orderData.append(
        'catatan_internal',
        paymentData.metode_pembayaran === 'cash'
          ? `TUNAI - Diterima: Rp ${paymentData.uang_diterima.toLocaleString()} - Kembalian: Rp ${kembalian.toLocaleString()}`
          : `${paymentData.metode_pembayaran.toUpperCase()} - Rp ${totalHarga.toLocaleString()}`,
      );
      // ✅ FIXED: Status order offline langsung "diproses" bukan "dibayar"
      orderData.append('status_order', 'diproses');

      const orderResponse = await axios.post(
        `${API_BASE_URL}/orders.php?op=create`,
        orderData,
      );

      if (orderResponse.data.status !== 'success') {
        throw new Error('Gagal membuat order');
      }

      const orderId = orderResponse.data.data?.id_order;
      const kodeOrder = orderResponse.data.data?.kode_order;

      if (!orderId) throw new Error('ID Order tidak ditemukan');

      let itemsSaved = 0;
      for (const item of items) {
        try {
          const itemData = new FormData();
          itemData.append('id_order', orderId.toString());
          itemData.append('id_product', item.id_product);
          itemData.append('ukuran', item.ukuran);
          itemData.append('jumlah', item.jumlah.toString());
          itemData.append('harga_satuan', item.harga_satuan.toString());
          itemData.append('subtotal', item.subtotal.toString());
          itemData.append('keterangan', item.catatan);

          if (item.file_desain) {
            itemData.append('file_desain', item.file_desain);
          }

          const itemResponse = await axios.post(
            `${API_BASE_URL}/order_items.php?op=create`,
            itemData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            },
          );

          if (itemResponse.data.status === 'success') {
            itemsSaved++;
          }
        } catch (itemError: any) {
          console.error('Error saving item:', itemError);
        }
      }

      const paymentFormData = new FormData();
      paymentFormData.append('id_order', orderId.toString());
      paymentFormData.append(
        'metode_pembayaran',
        paymentData.metode_pembayaran,
      );
      paymentFormData.append('nama_bank', '');
      paymentFormData.append('nomor_rekening', '');
      paymentFormData.append('nama_pemilik', customerData.nama_pelanggan);
      paymentFormData.append('jumlah_bayar', totalHarga.toString());
      paymentFormData.append('bukti_bayar', '');

      await axios.post(
        `${API_BASE_URL}/payments.php?op=create`,
        paymentFormData,
      );

      // ✅ FIXED: Alert message diupdate
      let alertMessage = `✅ TRANSAKSI BERHASIL!\n\n🎫 Kode Order: ${kodeOrder}\n👤 Customer: ${customerCode} - ${customerData.nama_pelanggan}\n\n📦 Items (${items.length}):\n`;

      items.forEach((item, idx) => {
        const hasFile = item.file_desain ? '📎 File ✅' : '📄 Tanpa File';
        alertMessage += `${idx + 1}. ${item.nama_product} × ${
          item.jumlah
        } = ${formatRupiah(item.subtotal)} ${hasFile}\n`;
      });

      alertMessage += `\n💰 Total: ${formatRupiah(totalHarga)}\n`;

      if (paymentData.metode_pembayaran === 'cash') {
        alertMessage += `💵 Uang: ${formatRupiah(
          paymentData.uang_diterima,
        )}\n💵 Kembalian: ${formatRupiah(kembalian)}\n`;
      }

      // ✅ FIXED: Status message diubah
      alertMessage += `\n✅ Status: LUNAS & DIPROSES\n📋 ${itemsSaved}/${items.length} items tersimpan\n🚀 Pesanan masuk queue OPERATOR untuk dikerjakan`;

      alert(alertMessage);
      onClose(true);
    } catch (error: any) {
      console.error('Error:', error);
      alert('❌ Gagal: ' + (error.message || 'Terjadi kesalahan'));
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

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter(p => p.nama_category === selectedCategory);

  const categories = [
    'all',
    ...Array.from(new Set(products.map(p => p.nama_category))),
  ];

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
        padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '900px',
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
            position: 'sticky',
            top: 0,
            background: 'white',
            zIndex: 10,
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
            {step === 'order' ? '🛒 Buat Pesanan Offline' : '💳 Pembayaran'}
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
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
                  📋 PETUNJUK KASIR OFFLINE
                </h3>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: '1.5rem',
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                  }}
                >
                  <li>
                    <strong>Nama pelanggan WAJIB diisi</strong> (minimal nama)
                  </li>
                  <li>
                    <strong>Produk tertentu butuh file desain</strong> - minta
                    file dari pelanggan (flashdisk/HP/email)
                  </li>
                  <li>
                    Produk cetak cepat (fotokopi, print dokumen){' '}
                    <strong>tidak perlu file</strong>
                  </li>
                  <li>
                    Bisa tambah <strong>multiple items</strong> dalam 1
                    transaksi
                  </li>
                </ul>
              </div>

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
                    👤 Data Pelanggan{' '}
                    <span style={{ color: '#dc3545' }}>*WAJIB</span>
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
                      : '➕ Detail Lengkap'}
                  </button>
                </div>

                <div
                  style={{ marginBottom: showCustomerDetails ? '1rem' : '0' }}
                >
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
                      fontWeight: !customerData.nama_pelanggan.trim()
                        ? 'bold'
                        : 'normal',
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

              <div
                style={{
                  background: '#fff3cd',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                }}
              >
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>
                  ➕ Tambah Produk
                </h3>

                <div style={{ marginBottom: '1rem' }}>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      background: 'white',
                    }}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? '📂 Semua Kategori' : `📁 ${cat}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <select
                    value={currentItem.id_product}
                    onChange={e =>
                      setCurrentItem({
                        ...currentItem,
                        id_product: e.target.value,
                      })
                    }
                    disabled={loadingProducts}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                    }}
                  >
                    <option value="">-- Pilih Produk --</option>
                    {filteredProducts.map(p => (
                      <option key={p.id_product} value={p.id_product}>
                        {p.nama_product} - {formatRupiah(Number(p.harga_dasar))}
                        /{p.satuan}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={currentItem.jumlah}
                    onChange={e =>
                      setCurrentItem({
                        ...currentItem,
                        jumlah: parseInt(e.target.value) || 1,
                      })
                    }
                    min="1"
                    placeholder="Jumlah"
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                    }}
                  />
                </div>

                {currentItem.id_product &&
                  isProductNeedDesign(currentItem.id_product) && (
                    <div
                      style={{
                        background: '#ffe5e5',
                        padding: '1rem',
                        borderRadius: '6px',
                        marginBottom: '0.5rem',
                        border: '2px dashed #dc3545',
                      }}
                    >
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '0.5rem',
                          fontWeight: 'bold',
                          color: '#dc3545',
                        }}
                      >
                        📎 Upload File Desain *WAJIB untuk produk ini
                      </label>
                      <input
                        id="file_desain_input"
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid #dc3545',
                          background: 'white',
                        }}
                      />
                      <p
                        style={{
                          margin: '0.5rem 0 0 0',
                          fontSize: '0.75rem',
                          color: '#666',
                        }}
                      >
                        Format: JPG, PNG, PDF | Max: 10MB
                      </p>
                      {currentItem.file_desain && (
                        <p
                          style={{
                            margin: '0.5rem 0 0 0',
                            fontSize: '0.85rem',
                            color: '#28a745',
                            fontWeight: 'bold',
                          }}
                        >
                          ✅ File: {currentItem.file_desain.name} (
                          {(currentItem.file_desain.size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                    </div>
                  )}

                {currentItem.id_product &&
                  !isProductNeedDesign(currentItem.id_product) && (
                    <div
                      style={{
                        background: '#e8f5e9',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        marginBottom: '0.5rem',
                        fontSize: '0.85rem',
                        color: '#2e7d32',
                      }}
                    >
                      ℹ️ Produk ini tidak memerlukan file desain
                    </div>
                  )}

                <textarea
                  value={currentItem.catatan}
                  onChange={e =>
                    setCurrentItem({ ...currentItem, catatan: e.target.value })
                  }
                  placeholder="Catatan tambahan (opsional)"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    marginBottom: '0.5rem',
                    resize: 'vertical',
                  }}
                />

                <button
                  type="button"
                  onClick={handleAddItem}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#28a745',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                  }}
                >
                  ➕ TAMBAH KE KERANJANG
                </button>
              </div>

              {items.length > 0 && (
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
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1rem',
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
                    Kecepatan Pengerjaan
                  </label>
                  <select
                    value={orderSettings.kecepatan_pengerjaan}
                    onChange={e =>
                      setOrderSettings({
                        ...orderSettings,
                        kecepatan_pengerjaan: e.target.value as
                          | 'normal'
                          | 'express',
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
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                    }}
                  />
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
                  TOTAL PEMBAYARAN
                </h3>
                <p
                  style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}
                >
                  {formatRupiah(totalHarga)}
                </p>
                {items.length > 0 && (
                  <div
                    style={{
                      marginTop: '1rem',
                      fontSize: '0.9rem',
                      opacity: 0.95,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.25rem',
                      }}
                    >
                      <span>Subtotal ({items.length} items):</span>
                      <strong>{formatRupiah(subtotal)}</strong>
                    </div>
                    {orderSettings.diskon > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '0.25rem',
                        }}
                      >
                        <span>Diskon:</span>
                        <strong>- {formatRupiah(orderSettings.diskon)}</strong>
                      </div>
                    )}
                    {orderSettings.kecepatan_pengerjaan === 'express' && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>⚡ Express (+50%):</span>
                        <strong>+ {formatRupiah(subtotal * 0.5)}</strong>
                      </div>
                    )}
                  </div>
                )}
                {items.length === 0 && (
                  <p
                    style={{
                      margin: '0.5rem 0 0 0',
                      fontSize: '0.85rem',
                      opacity: 0.9,
                    }}
                  >
                    Belum ada produk di keranjang
                  </p>
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
                onClick={() => onClose(false)}
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
                disabled={
                  items.length === 0 || !customerData.nama_pelanggan.trim()
                }
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  border: 'none',
                  background:
                    items.length === 0 || !customerData.nama_pelanggan.trim()
                      ? '#ccc'
                      : '#667eea',
                  color: 'white',
                  cursor:
                    items.length === 0 || !customerData.nama_pelanggan.trim()
                      ? 'not-allowed'
                      : 'pointer',
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
                  {orderSettings.diskon > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.25rem',
                        color: '#28a745',
                      }}
                    >
                      <span>Diskon:</span>
                      <span>- {formatRupiah(orderSettings.diskon)}</span>
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
                  <span style={{ color: '#667eea' }}>
                    {formatRupiah(totalHarga)}
                  </span>
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
                onClick={() => setStep('order')}
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
        )}
      </div>
    </div>
  );
};

export default CreateOrderKasir;
