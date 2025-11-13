import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../../../config';

// Import Types dengan keyword "type"
import type {
  Product,
  OrderItem,
  CustomerData,
  CurrentItem,
  OrderSettings as OrderSettingsType,
  PaymentData as PaymentDataType,
  CreateOrderKasirProps,
} from './types';

// Import Utils (ini tetap normal, bukan type)
import { formatRupiah, isProductNeedDesign, generateQRCodeUrl } from './utils';

// Import Components (ini juga normal)
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
  }, [items, orderSettings.kecepatan_pengerjaan, orderSettings.diskon]);

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
              {/* Info Banner */}
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
              />

              <TotalSummary
                items={items}
                subtotal={subtotal}
                totalHarga={totalHarga}
                orderSettings={orderSettings}
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
