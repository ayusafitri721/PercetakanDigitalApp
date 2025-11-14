// index.tsx - MODIFIKASI BAGIAN INI

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../../../config';

import type {
  Product,
  OrderItem,
  CustomerData,
  CurrentItem,
  OrderSettings as OrderSettingsType,
  PaymentData as PaymentDataType,
  PromoData,
  AutoDiscount, // ✅ TAMBAHAN BARU
  CreateOrderKasirProps,
} from './types';

import { formatRupiah, isProductNeedDesign, generateQRCodeUrl } from './utils';

import CustomerForm from './CustomerForm';
import ProductSelector from './ProductSelector';
import CartItems from './CartItems';
import OrderSettings from './OrderSettings';
import TotalSummary from './TotalSummary';
import PaymentForm from './PaymentForm';

const CreateOrderKasir: React.FC<CreateOrderKasirProps> = ({ onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [step, setStep] = useState<'order' | 'payment'>('order');

  const [customerData, setCustomerData] = useState<CustomerData>({
    nama_pelanggan: '',
    no_telepon: '',
    email: '',
    alamat: '',
  });

  const [items, setItems] = useState<OrderItem[]>([]);

  const [currentItem, setCurrentItem] = useState<CurrentItem>({
    id_product: '',
    jumlah: 1,
    ukuran: 'Standard',
    catatan: '',
    file_desain: null,
  });

  const [orderSettings, setOrderSettings] = useState<OrderSettingsType>({
    kecepatan_pengerjaan: 'normal',
    diskon: 0,
  });

  const [kodePromo, setKodePromo] = useState('');
  const [promoData, setPromoData] = useState<PromoData | null>(null);
  const [promoError, setPromoError] = useState('');
  const [loadingPromo, setLoadingPromo] = useState(false);

  // ✅ STATE AUTO-DISCOUNT (TAMBAHAN BARU)
  const [autoDiscount, setAutoDiscount] = useState<AutoDiscount>({
    active: false,
    type: 'quantity',
    min_items: 3,
    percentage: 10,
    description: '',
    discount_amount: 0,
  });

  const [paymentData, setPaymentData] = useState<PaymentDataType>({
    metode_pembayaran: 'cash',
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
  }, [
    items,
    orderSettings.kecepatan_pengerjaan,
    orderSettings.diskon,
    promoData,
  ]);

  useEffect(() => {
    calculateKembalian();
  }, [paymentData.uang_diterima, totalHarga, paymentData.metode_pembayaran]);

  useEffect(() => {
    if (step === 'payment' && paymentData.metode_pembayaran === 'qris') {
      setQrCodeUrl(generateQRCodeUrl(totalHarga));
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

    const needDesign = isProductNeedDesign(currentItem.id_product, products);

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

  const handleValidatePromo = async () => {
    if (!kodePromo.trim()) {
      alert('Masukkan kode promo!');
      return;
    }

    const itemsSubtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    if (itemsSubtotal === 0) {
      alert('Tambahkan produk terlebih dahulu!');
      return;
    }

    setLoadingPromo(true);
    setPromoError('');

    try {
      const response = await axios.get(
        `${API_BASE_URL}/promotions.php?op=validate&kode=${encodeURIComponent(
          kodePromo,
        )}&subtotal=${itemsSubtotal}`,
      );

      if (response.data.status === 'success') {
        setPromoData(response.data.data);
        setOrderSettings({ ...orderSettings, diskon: 0 });
        alert(
          `✅ Promo berhasil diterapkan!\n${
            response.data.data.nama_promo
          }\nDiskon: Rp ${response.data.data.nilai_diskon_rupiah.toLocaleString()}`,
        );
      } else {
        setPromoError(response.data.message || 'Kode promo tidak valid');
        setPromoData(null);
      }
    } catch (error: any) {
      setPromoError('Gagal validasi promo');
      setPromoData(null);
    } finally {
      setLoadingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoData(null);
    setKodePromo('');
    setPromoError('');
  };

  // ✅ CALCULATE AUTO-DISCOUNT (TAMBAHAN BARU)
  const calculateAutoDiscount = (itemsSubtotal: number, totalItems: number) => {
    // Rule: Beli >= 3 items → Diskon 10%
    if (totalItems >= 3) {
      const discountAmount = (itemsSubtotal * 10) / 100;
      setAutoDiscount({
        active: true,
        type: 'quantity',
        min_items: 3,
        percentage: 10,
        description: `🎉 Beli ${totalItems} items, diskon 10%!`,
        discount_amount: discountAmount,
      });
      return discountAmount;
    } else {
      setAutoDiscount({
        active: false,
        type: 'quantity',
        min_items: 3,
        percentage: 10,
        description: '',
        discount_amount: 0,
      });
      return 0;
    }
  };

  // ✅ UPDATE CALCULATE TOTAL (MODIFIKASI)
  const calculateTotal = () => {
    const itemsSubtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalItems = items.reduce((sum, item) => sum + item.jumlah, 0);
    setSubtotal(itemsSubtotal);

    // 1. Hitung auto-discount
    const autoDiscountAmount = calculateAutoDiscount(itemsSubtotal, totalItems);

    // 2. Bandingkan dengan promo code
    let finalDiskon = 0;
    if (promoData) {
      // Pakai yang lebih besar: auto-discount vs promo
      finalDiskon = Math.max(autoDiscountAmount, promoData.nilai_diskon_rupiah);
    } else if (orderSettings.diskon > 0) {
      // Manual discount
      finalDiskon = orderSettings.diskon;
    } else {
      // Auto-discount
      finalDiskon = autoDiscountAmount;
    }

    let total = itemsSubtotal - finalDiskon;

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

      // ✅ TENTUKAN DISKON AKHIR (MODIFIKASI)
      let diskonAktif = 0;
      let catatanDiskon = '';

      if (
        promoData &&
        promoData.nilai_diskon_rupiah >= autoDiscount.discount_amount
      ) {
        // Promo code lebih besar
        diskonAktif = promoData.nilai_diskon_rupiah;
        catatanDiskon = `Promo: ${promoData.kode_promo} - ${promoData.nama_promo}`;
      } else if (autoDiscount.active) {
        // Auto-discount lebih besar
        diskonAktif = autoDiscount.discount_amount;
        catatanDiskon = autoDiscount.description;
      } else if (orderSettings.diskon > 0) {
        // Manual discount
        diskonAktif = orderSettings.diskon;
        catatanDiskon = `Diskon manual: Rp ${orderSettings.diskon.toLocaleString()}`;
      }

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
      orderData.append('diskon', diskonAktif.toString());
      orderData.append('ongkir', '0');
      orderData.append('total_harga', totalHarga.toString());
      orderData.append('catatan_pelanggan', catatanDiskon);
      orderData.append(
        'catatan_internal',
        paymentData.metode_pembayaran === 'cash'
          ? `TUNAI - Diterima: Rp ${paymentData.uang_diterima.toLocaleString()} - Kembalian: Rp ${kembalian.toLocaleString()}`
          : `${paymentData.metode_pembayaran.toUpperCase()} - Rp ${totalHarga.toLocaleString()}`,
      );
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

      if (promoData) {
        try {
          const promoUpdateData = new FormData();
          await axios.post(
            `${API_BASE_URL}/promotions.php?op=increment_usage&id=${promoData.id_promo}`,
            promoUpdateData,
          );
        } catch (promoError) {
          console.error('Gagal update promo usage:', promoError);
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

      let alertMessage = `✅ TRANSAKSI BERHASIL!\n\n🎫 Kode Order: ${kodeOrder}\n👤 Customer: ${customerCode} - ${customerData.nama_pelanggan}\n\n📦 Items (${items.length}):\n`;

      items.forEach((item, idx) => {
        const hasFile = item.file_desain ? '📎 File ✅' : '📄 Tanpa File';
        alertMessage += `${idx + 1}. ${item.nama_product} × ${
          item.jumlah
        } = ${formatRupiah(item.subtotal)} ${hasFile}\n`;
      });

      alertMessage += `\n💰 Subtotal: ${formatRupiah(subtotal)}\n`;

      // ✅ TAMPILKAN INFO DISKON (MODIFIKASI)
      if (diskonAktif > 0) {
        alertMessage += `💸 ${catatanDiskon} (-${formatRupiah(diskonAktif)})\n`;
      }

      if (orderSettings.kecepatan_pengerjaan === 'express') {
        alertMessage += `⚡ Express (+50%): +${formatRupiah(subtotal * 0.5)}\n`;
      }

      alertMessage += `\n💵 TOTAL: ${formatRupiah(totalHarga)}\n`;

      if (paymentData.metode_pembayaran === 'cash') {
        alertMessage += `💵 Uang: ${formatRupiah(
          paymentData.uang_diterima,
        )}\n💵 Kembalian: ${formatRupiah(kembalian)}\n`;
      }

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
                    <strong>Beli ≥ 3 items → GRATIS diskon 10%!</strong> 🎉
                  </li>
                  <li>
                    Bisa pakai <strong>kode promo</strong> untuk diskon lebih
                    besar
                  </li>
                  <li>
                    Atau gunakan <strong>diskon manual</strong> untuk kasus
                    khusus
                  </li>
                </ul>
              </div>

              {/* ✅ AUTO-DISCOUNT BANNER (TAMBAHAN BARU) */}
              {autoDiscount.active && (
                <div
                  style={{
                    background:
                      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    animation: 'pulse 2s infinite',
                  }}
                >
                  🎉 {autoDiscount.description} - Hemat Rp{' '}
                  {autoDiscount.discount_amount.toLocaleString()}!
                </div>
              )}

              <CustomerForm
                customerData={customerData}
                setCustomerData={setCustomerData}
                showCustomerDetails={showCustomerDetails}
                setShowCustomerDetails={setShowCustomerDetails}
              />

              <ProductSelector
                products={products}
                loadingProducts={loadingProducts}
                currentItem={currentItem}
                setCurrentItem={setCurrentItem}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                handleAddItem={handleAddItem}
                handleFileChange={handleFileChange}
              />

              <CartItems items={items} handleRemoveItem={handleRemoveItem} />

              <OrderSettings
                orderSettings={orderSettings}
                setOrderSettings={setOrderSettings}
                kodePromo={kodePromo}
                setKodePromo={setKodePromo}
                promoData={promoData}
                promoError={promoError}
                loadingPromo={loadingPromo}
                onValidatePromo={handleValidatePromo}
                onRemovePromo={handleRemovePromo}
                autoDiscount={autoDiscount}
              />

              <TotalSummary
                items={items}
                subtotal={subtotal}
                totalHarga={totalHarga}
                orderSettings={orderSettings}
                promoData={promoData}
                autoDiscount={autoDiscount}
              />
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
          <PaymentForm
            paymentData={paymentData}
            setPaymentData={setPaymentData}
            customerData={customerData}
            items={items}
            subtotal={subtotal}
            totalHarga={totalHarga}
            kembalian={kembalian}
            qrCodeUrl={qrCodeUrl}
            orderSettings={orderSettings}
            promoData={promoData}
            autoDiscount={autoDiscount}
            loading={loading}
            onBack={() => setStep('order')}
            onSubmit={handleSubmitOrder}
          />
        )}
      </div>
    </div>
  );
};

export default CreateOrderKasir;
