// src/services/checkoutService.ts

const API_BASE_URL = 'http://172.29.112.126/api-percetakan/api';

interface UploadedFile {
  uri: string;
  name: string;
  type: string;
  size: number;
}

interface CartItemData {
  id_product: string | number;
  nama_product: string;
  ukuran: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
  keterangan?: string;
  designFile?: UploadedFile | null;
}

interface CheckoutData {
  id_user: number;
  catatan_pelanggan: string;
  kecepatan_pengerjaan: string;
  delivery_method: 'cod' | 'transfer_delivery' | 'pickup';
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  city: string;
  province: string;
  shipping_cost: number;
  payment_method: 'transfer' | 'qris' | '';
  payment_proof: UploadedFile | null;
  items: CartItemData[];
  subtotal: number;
  total: number;
}

interface CheckoutResult {
  success: boolean;
  orderId?: number;
  kodeOrder?: string;
  message?: string;
  statusPembayaran?: string;
  statusOrder?: string;
  autoApproved?: boolean;
}

export async function processCheckout(data: CheckoutData): Promise<CheckoutResult> {
  try {
    console.log('🚀 Starting checkout process...', data);

    // ✅ TENTUKAN STATUS BERDASARKAN DELIVERY METHOD & PAYMENT PROOF
    let statusOrder = 'diproses'; // ⭐ DEFAULT: SEMUA LANGSUNG DIPROSES
    let statusPembayaran = 'pending';
    let autoApproved = false;

    if (data.delivery_method === 'cod') {
      // COD belum bayar = pending pembayaran, tapi ORDER TETAP DIPROSES
      statusOrder = 'diproses'; // ⭐ TETAP DIPROSES
      statusPembayaran = 'pending'; // ⭐ PEMBAYARAN PENDING
      console.log('💵 COD Belum Bayar - Order: diproses, Pembayaran: pending');
    } else if (data.delivery_method === 'pickup' && data.payment_proof) {
      // Pickup + bukti bayar = LUNAS + DIPROSES
      statusOrder = 'diproses';
      statusPembayaran = 'lunas'; // ⭐ LANGSUNG LUNAS
      autoApproved = true;
      console.log('🏪 Pickup + Bukti Bayar - Order: diproses, Pembayaran: lunas');
    } else if (data.delivery_method === 'transfer_delivery' && data.payment_proof) {
      // Transfer delivery + bukti bayar = LUNAS + DIPROSES
      statusOrder = 'diproses';
      statusPembayaran = 'lunas'; // ⭐ LANGSUNG LUNAS
      autoApproved = true;
      console.log('🚚 Transfer Delivery + Bukti Bayar - Order: diproses, Pembayaran: lunas');
    } else {
      // Default: DIPROSES
      statusOrder = 'diproses';
      statusPembayaran = 'pending';
      console.log('📦 Default - Order: diproses, Pembayaran: pending');
    }

    // STEP 1: CREATE ORDER
    const formData = new FormData();
    formData.append('id_user', data.id_user.toString());
    formData.append('jenis_order', 'online');
    formData.append('kecepatan_pengerjaan', data.kecepatan_pengerjaan || 'normal');
    formData.append('subtotal', data.subtotal.toString());
    formData.append('diskon', '0');
    formData.append('ongkir', data.shipping_cost.toString());
    formData.append('total_harga', data.total.toString());
    formData.append('catatan_pelanggan', data.catatan_pelanggan || '');
    formData.append('catatan_internal', `Delivery: ${data.delivery_method}, Penerima: ${data.recipient_name}, Alamat: ${data.shipping_address}, ${data.city}`);
    formData.append('status_order', statusOrder); // ✅ Status dinamis

    console.log('📤 Sending order to:', `${API_BASE_URL}/orders.php?op=create`);

    const orderResponse = await fetch(`${API_BASE_URL}/orders.php?op=create`, {
      method: 'POST',
      body: formData,
    });

    const orderResult = await orderResponse.json();
    console.log('📦 Order response:', orderResult);

    // ✅ FIX: Cek 'status' === 'success' ATAU 'success' === true
    const isSuccess = orderResult.status === 'success' || orderResult.success === true;
    
    if (!isSuccess || !orderResult.data) {
      throw new Error(orderResult.message || 'Gagal membuat order');
    }

    const id_order = orderResult.data.id_order;
    const kode_order = orderResult.data.kode_order;
    console.log('✅ Order created:', id_order, kode_order);

    // STEP 2: CREATE ORDER ITEMS
    for (const item of data.items) {
      try {
        const itemForm = new FormData();
        itemForm.append('id_order', id_order.toString());
        itemForm.append('id_product', item.id_product.toString());
        itemForm.append('ukuran', item.ukuran || 'Standard');
        itemForm.append('jumlah', item.jumlah.toString());
        itemForm.append('harga_satuan', item.harga_satuan.toString());
        itemForm.append('keterangan', item.keterangan || '');

        if (item.designFile?.uri) {
          itemForm.append('file_desain', {
            uri: item.designFile.uri,
            name: item.designFile.name,
            type: item.designFile.type,
          } as any);
        }

        const itemResponse = await fetch(`${API_BASE_URL}/order_items.php?op=create`, {
          method: 'POST',
          body: itemForm,
        });
        const itemResult = await itemResponse.json();
        console.log('📦 Item response:', itemResult);
      } catch (itemError) {
        console.error('❌ Item error:', itemError);
      }
    }

    // STEP 3: CREATE PAYMENT
    try {
      const payForm = new FormData();
      payForm.append('id_order', id_order.toString());
      payForm.append('jumlah_bayar', data.total.toString());
      payForm.append('status_pembayaran', statusPembayaran); // ✅ Status dinamis

      if (data.delivery_method === 'cod') {
        // COD = pending, bayar ke kurir
        payForm.append('metode_pembayaran', 'cod');
        console.log('💵 Payment COD - pending');
      } else {
        // Transfer/QRIS + Upload bukti bayar
        payForm.append('metode_pembayaran', data.payment_method);
        
        if (data.payment_proof?.uri) {
          payForm.append('bukti_pembayaran', {
            uri: data.payment_proof.uri,
            name: data.payment_proof.name,
            type: data.payment_proof.type,
          } as any);
          console.log('💳 Payment proof uploaded');
        }
      }

      const payResponse = await fetch(`${API_BASE_URL}/payments.php?op=create`, {
        method: 'POST',
        body: payForm,
      });
      const payResult = await payResponse.json();
      console.log('💳 Payment response:', payResult);
    } catch (payError) {
      console.error('❌ Payment error:', payError);
    }

    // STEP 4: CREATE DELIVERY
    try {
      const deliveryForm = new FormData();
      deliveryForm.append('id_order', id_order.toString());

      if (data.delivery_method === 'pickup') {
        deliveryForm.append('metode_pengiriman', 'ambil_sendiri');
        deliveryForm.append('nama_penerima', data.recipient_name || 'Customer');
        deliveryForm.append('no_telepon_penerima', data.recipient_phone || '-');
        deliveryForm.append('alamat_lengkap', 'Ambil di toko');
        deliveryForm.append('ongkos_kirim', '0');
        console.log('🏪 Delivery: Ambil sendiri');
      } else {
        const metode = data.delivery_method === 'cod' ? 'diantar_cod' : 'diantar_reguler';
        deliveryForm.append('metode_pengiriman', metode);
        deliveryForm.append('nama_penerima', data.recipient_name);
        deliveryForm.append('no_telepon_penerima', data.recipient_phone);
        deliveryForm.append('alamat_lengkap', data.shipping_address);
        deliveryForm.append('kota', data.city);
        deliveryForm.append('provinsi', data.province || 'Indonesia');
        deliveryForm.append('ongkos_kirim', data.shipping_cost.toString());
        console.log(`🚚 Delivery: ${metode}`);
      }

      const deliveryResponse = await fetch(`${API_BASE_URL}/deliveries.php?op=create`, {
        method: 'POST',
        body: deliveryForm,
      });
      const deliveryResult = await deliveryResponse.json();
      console.log('🚚 Delivery response:', deliveryResult);
    } catch (deliveryError) {
      console.error('❌ Delivery error:', deliveryError);
    }

    console.log('🎉 Checkout complete!');

    return {
      success: true,
      orderId: id_order,
      kodeOrder: kode_order,
      statusPembayaran,
      statusOrder,
      autoApproved,
      message: 'Checkout berhasil!',
    };

  } catch (error: any) {
    console.error('❌ Checkout error:', error);
    return {
      success: false,
      message: error.message || 'Terjadi kesalahan saat checkout',
    };
  }
}