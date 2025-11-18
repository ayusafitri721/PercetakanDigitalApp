// src/screens/customer/utils/orderHelpers.ts
import { Alert } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import { OrderDetails, UploadedFile } from '../hooks/useOrderForm';

export const validateStep = (
  step: number,
  orderDetails: OrderDetails,
  uploadedFile: UploadedFile | null,
  paymentProof: UploadedFile | null,
): boolean => {
  if (step === 1) {
    if (!uploadedFile) {
      Alert.alert('Error', 'Silakan upload file desain terlebih dahulu!');
      return false;
    }
    if (!orderDetails.material || !orderDetails.size) {
      Alert.alert('Error', 'Silakan lengkapi material dan ukuran!');
      return false;
    }
    if (orderDetails.quantity < 1) {
      Alert.alert('Error', 'Jumlah minimal 1!');
      return false;
    }
    return true;
  }

  if (step === 2) {
    if (orderDetails.deliveryMethod !== 'pickup') {
      if (!orderDetails.recipientName.trim()) {
        Alert.alert('Error', 'Nama penerima harus diisi!');
        return false;
      }
      if (!orderDetails.recipientPhone.trim()) {
        Alert.alert('Error', 'Nomor telepon penerima harus diisi!');
        return false;
      }
      if (!orderDetails.shippingAddress.trim()) {
        Alert.alert('Error', 'Alamat pengiriman harus diisi!');
        return false;
      }
      if (!orderDetails.city.trim()) {
        Alert.alert('Error', 'Kota harus diisi!');
        return false;
      }
    }
    return true;
  }

  if (step === 3) {
    if (orderDetails.deliveryMethod === 'cod') return true;
    if (!orderDetails.paymentMethod) {
      Alert.alert('Error', 'Silakan pilih metode pembayaran!');
      return false;
    }
    if (!paymentProof) {
      Alert.alert('Error', 'Silakan upload bukti pembayaran!');
      return false;
    }
    return true;
  }

  return true;
};

export const submitOrder = async (
  currentUser: any,
  orderDetails: OrderDetails,
  service: any,
  uploadedFile: UploadedFile,
  paymentProof: UploadedFile | null,
  calculatePrice: () => number,
  calculateTotal: () => number,
) => {
  // STEP 1: CREATE ORDER
  const orderFormData = new FormData();
  orderFormData.append('id_user', currentUser.id_user.toString());
  orderFormData.append('jenis_order', 'online');
  orderFormData.append('kecepatan_pengerjaan', orderDetails.speed);
  orderFormData.append('subtotal', calculatePrice().toString());
  orderFormData.append('diskon', '0');
  orderFormData.append('ongkir', orderDetails.shippingCost.toString());
  orderFormData.append('total_harga', calculateTotal().toString());
  orderFormData.append('catatan_pelanggan', orderDetails.notes);
  orderFormData.append('status_order', 'validasi');

  const orderResponse = await axios.post(
    `${API_BASE_URL}/orders.php?op=create`,
    orderFormData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    },
  );

  if (orderResponse.data.status !== 'success') {
    throw new Error(orderResponse.data.message || 'Gagal membuat order');
  }

  const id_order = orderResponse.data.data.id_order;
  const kode_order = orderResponse.data.data.kode_order;

  // STEP 2: CREATE ORDER ITEM + UPLOAD DESAIN (DENGAN VALIDASI ✅)
  const itemFormData = new FormData();
  itemFormData.append('id_order', id_order.toString());
  itemFormData.append('id_product', service.id_product);
  itemFormData.append('ukuran', orderDetails.size);
  itemFormData.append('jumlah', orderDetails.quantity.toString());
  itemFormData.append('harga_satuan', service.harga_dasar);
  itemFormData.append(
    'keterangan',
    `Material: ${orderDetails.material}\nKecepatan: ${orderDetails.speed}\n${orderDetails.notes}`,
  );
  itemFormData.append('file_desain', {
    uri: uploadedFile.uri,
    name: uploadedFile.name,
    type: uploadedFile.type,
  } as any);

  const itemResponse = await axios.post(
    `${API_BASE_URL}/order_items.php?op=create`,
    itemFormData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    },
  );

  if (itemResponse.data.status !== 'success') {
    throw new Error(itemResponse.data.message || 'Gagal membuat order item');
  }

  // ⭐ AMBIL VALIDATION DATA DARI RESPONSE
  const fileValidation = itemResponse.data.data.validation;
  console.log('📁 FILE VALIDATION:', fileValidation);

  // STEP 3: CREATE PAYMENT (DENGAN VALIDASI ✅)
  const paymentFormData = new FormData();
  paymentFormData.append('id_order', id_order.toString());
  paymentFormData.append('jumlah_bayar', calculateTotal().toString());

  let paymentValidation = null;

  if (orderDetails.deliveryMethod === 'cod') {
    // COD: pending, bayar ke kurir
    paymentFormData.append('metode_pembayaran', 'cod');
    paymentFormData.append('status_pembayaran', 'pending');
  } else {
    // Transfer/Pickup: upload bukti bayar + validasi
    paymentFormData.append('metode_pembayaran', orderDetails.paymentMethod);
    paymentFormData.append('status_pembayaran', 'pending'); // Backend akan auto-decide
    
    if (paymentProof) {
      paymentFormData.append('bukti_bayar', {
        uri: paymentProof.uri,
        name: paymentProof.name,
        type: paymentProof.type,
      } as any);
    }
  }

  const paymentResponse = await axios.post(
    `${API_BASE_URL}/payments.php?op=create`,
    paymentFormData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    },
  );

  if (paymentResponse.data.status !== 'success') {
    throw new Error(paymentResponse.data.message || 'Gagal membuat payment');
  }

  // ⭐ AMBIL VALIDATION DATA DARI PAYMENT
  paymentValidation = paymentResponse.data.data.validation;
  const autoApproved = paymentResponse.data.data.auto_approved;
  console.log('💳 PAYMENT VALIDATION:', paymentValidation);
  console.log('✅ AUTO APPROVED:', autoApproved);

  // STEP 4: CREATE DELIVERY
  const deliveryFormData = new FormData();
  deliveryFormData.append('id_order', id_order.toString());

  if (orderDetails.deliveryMethod === 'pickup') {
    deliveryFormData.append('metode_pengiriman', 'ambil_sendiri');
    deliveryFormData.append(
      'nama_penerima',
      orderDetails.recipientName || currentUser.nama,
    );
    deliveryFormData.append(
      'no_telepon_penerima',
      orderDetails.recipientPhone || currentUser.no_telepon,
    );
    deliveryFormData.append('alamat_lengkap', 'Ambil di toko');
    deliveryFormData.append('ongkos_kirim', '0');
  } else {
    const metode =
      orderDetails.deliveryMethod === 'cod' ? 'diantar_cod' : 'diantar_reguler';
    deliveryFormData.append('metode_pengiriman', metode);
    deliveryFormData.append('nama_penerima', orderDetails.recipientName);
    deliveryFormData.append('no_telepon_penerima', orderDetails.recipientPhone);
    deliveryFormData.append('alamat_lengkap', orderDetails.shippingAddress);
    deliveryFormData.append('kota', orderDetails.city);
    deliveryFormData.append('provinsi', orderDetails.province || 'Indonesia');
    deliveryFormData.append(
      'ongkos_kirim',
      orderDetails.shippingCost.toString(),
    );
  }

  await axios.post(
    `${API_BASE_URL}/deliveries.php?op=create`,
    deliveryFormData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    },
  );

  // ⭐ RETURN DATA + VALIDATION
  return { 
    kode_order, 
    fileValidation, 
    paymentValidation, 
    autoApproved 
  };
};

export const getSuccessMessage = (
  kode_order: string,
  currentUser: any,
  service: any,
  orderDetails: OrderDetails,
  calculateTotal: () => number,
  fileValidation?: any,
  paymentValidation?: any,
  autoApproved?: boolean,
): string => {
  let msg = `✅ Pesanan Berhasil Dibuat!\n\n`;
  msg += `Kode Order: ${kode_order}\n`;
  msg += `Customer: ${currentUser.nama}\n`;
  msg += `Produk: ${service.nama_product}\n`;
  msg += `Total: Rp ${calculateTotal().toLocaleString('id-ID')}\n\n`;

  // ⭐ TAMPILKAN VALIDATION SCORE
  if (fileValidation) {
    const fileScore = fileValidation.confidence_score;
    let fileIcon = '✅';
    if (fileScore < 75) fileIcon = '⚠️';
    if (fileScore < 60) fileIcon = '❌';
    
    msg += `📁 File Desain: ${fileIcon} ${fileScore}/100\n`;
  }

  if (paymentValidation) {
    const paymentScore = paymentValidation.confidence_score;
    let paymentIcon = '✅';
    if (paymentScore < 75) paymentIcon = '⚠️';
    if (paymentScore < 60) paymentIcon = '❌';
    
    msg += `💳 Bukti Bayar: ${paymentIcon} ${paymentScore}/100\n`;
  }

  msg += `\n`;

  // STATUS MESSAGE
  if (orderDetails.deliveryMethod === 'cod') {
    msg += `📦 Metode: COD (Bayar saat terima)\n`;
    msg += `💳 Status Pembayaran: Pending\n`;
    msg += `📋 Status Order: Menunggu validasi\n\n`;
    msg += `Pesanan akan divalidasi oleh admin. Pembayaran dilakukan saat barang diterima.`;
  } else if (autoApproved) {
    msg += `🎉 PEMBAYARAN AUTO-APPROVED!\n`;
    msg += `💳 Status Pembayaran: Diterima\n`;
    msg += `📋 Status Order: Dalam Proses\n\n`;
    msg += `Pembayaran berhasil diverifikasi secara otomatis! Pesanan sedang diproses.`;
  } else {
    msg += `💳 Status Pembayaran: Menunggu konfirmasi admin\n`;
    msg += `📋 Status Order: Menunggu validasi\n\n`;
    msg += `Pesanan akan divalidasi dan diproses setelah konfirmasi pembayaran.`;
  }

  return msg;
};