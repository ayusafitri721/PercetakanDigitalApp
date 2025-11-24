// kasirUtils.ts - Helper functions untuk Kasir Dashboard

export interface Order {
  id_order: string;
  kode_order: string;
  nama_customer: string;
  email_customer?: string;
  telepon_customer?: string;
  total_harga: number;
  status_order: string;
  status_pembayaran?: string;
  metode_pembayaran?: string; // ✅ TAMBAHAN untuk revenue tracking
  jumlah_bayar?: number; // ✅ TAMBAHAN untuk actual payment amount
  jenis_order?: string;
  tanggal_order: string;
  tanggal_selesai?: string;
}

// ✅ NEW: Interface untuk Revenue Data
export interface RevenueData {
  total_pemasukan: number;
  total_pending: number;
  total_cash: number;
  total_transfer: number;
  total_qris: number;
  paid_transactions: number;
  pending_transactions: number;
}

// Format rupiah
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Get date only (YYYY-MM-DD)
export const getDateOnly = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format date dengan label hari ini/kemarin
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const todayDate = getDateOnly(now.toISOString());
  const yesterdayDate = getDateOnly(
    new Date(Date.now() - 86400000).toISOString(),
  );
  const orderDate = getDateOnly(dateString);

  if (orderDate === todayDate) {
    return (
      'Hari ini, ' +
      date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    );
  } else if (orderDate === yesterdayDate) {
    return (
      'Kemarin, ' +
      date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    );
  }
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// Get status label dengan emoji
export const getStatusLabel = (status: string): string => {
  const labels: { [key: string]: string } = {
    pending: '⏳ Pending',
    validasi: '✅ Validasi',
    dibayar: '💳 Dibayar',
    diproses: '🔄 Diproses',
    cetak: '🖨️ Cetak',
    siap: '📦 Siap Diambil',
    dikirim: '🚚 Dikirim',
    selesai: '✔️ Selesai',
    dibatalkan: '❌ Dibatalkan',
  };
  return labels[status] || status;
};

// Get status color
export const getStatusColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    pending: '#ffc107',
    validasi: '#17a2b8',
    dibayar: '#17a2b8',
    diproses: '#007bff',
    cetak: '#007bff',
    siap: '#28a745',
    dikirim: '#6c757d',
    selesai: '#28a745',
    dibatalkan: '#dc3545',
  };
  return colors[status] || '#6c757d';
};

// Check if order is paid
export const isOrderPaid = (order: Order): boolean => {
  if (order.jenis_order === 'offline') return true;
  if (order.status_pembayaran) {
    const paidStatuses = ['dibayar', 'diterima', 'lunas', 'confirmed', 'paid'];
    return paidStatuses.includes(order.status_pembayaran.toLowerCase());
  }
  return [
    'dibayar',
    'diproses',
    'validasi',
    'cetak',
    'selesai',
    'dikirim',
    'siap',
  ].includes(order.status_order);
};

// Get status pembayaran
export const getStatusPembayaran = (order: Order): string => {
  if (order.status_pembayaran) {
    const paidStatuses = ['dibayar', 'diterima', 'lunas', 'confirmed'];
    return paidStatuses.includes(order.status_pembayaran.toLowerCase())
      ? 'Lunas'
      : 'Pending';
  }
  if (
    [
      'dibayar',
      'diproses',
      'validasi',
      'cetak',
      'siap',
      'selesai',
      'dikirim',
    ].includes(order.status_order)
  )
    return 'Lunas';
  return 'Pending';
};

// Get status pembayaran color
export const getStatusPembayaranColor = (order: Order): string => {
  return getStatusPembayaran(order) === 'Lunas' ? '#28a745' : '#ffc107';
};

// ✅ ENHANCED: Calculate stats dengan revenue data
export const calculateStats = (orders: Order[]) => {
  const now = new Date();
  const todayDate = getDateOnly(now.toISOString());

  // Calculate week start
  const startOfWeek = new Date(now);
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(now.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);
  const weekStartDate = getDateOnly(startOfWeek.toISOString());

  // Calculate month start
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthStartDate = getDateOnly(startOfMonth.toISOString());

  // Filter orders by period
  const todayOrders = orders.filter(
    o => getDateOnly(o.tanggal_order) === todayDate,
  );
  const weekOrders = orders.filter(
    o => getDateOnly(o.tanggal_order) >= weekStartDate,
  );
  const monthOrders = orders.filter(
    o => getDateOnly(o.tanggal_order) >= monthStartDate,
  );

  // Calculate revenues (paid only)
  const todayRevenue = todayOrders
    .filter(isOrderPaid)
    .reduce((sum, o) => {
      const amount = o.jumlah_bayar || parseFloat(o.total_harga.toString());
      return sum + amount;
    }, 0);

  const weekRevenue = weekOrders
    .filter(isOrderPaid)
    .reduce((sum, o) => {
      const amount = o.jumlah_bayar || parseFloat(o.total_harga.toString());
      return sum + amount;
    }, 0);

  const monthRevenue = monthOrders
    .filter(isOrderPaid)
    .reduce((sum, o) => {
      const amount = o.jumlah_bayar || parseFloat(o.total_harga.toString());
      return sum + amount;
    }, 0);

  // ✅ Calculate pending payment amount
  const pendingOrders = orders.filter(o => {
    if (o.status_pembayaran)
      return o.status_pembayaran.toLowerCase() === 'pending';
    return o.status_order === 'pending';
  });

  const pendingPayment = pendingOrders.length;
  const pendingPaymentAmount = pendingOrders.reduce(
    (sum, o) => sum + parseFloat(o.total_harga.toString()),
    0,
  );

  // ✅ Count completed today with revenue
  const completedTodayOrders = orders.filter(
    o =>
      o.status_order === 'selesai' &&
      o.tanggal_selesai &&
      getDateOnly(o.tanggal_selesai) === todayDate,
  );

  const completedToday = completedTodayOrders.length;
  const completedTodayRevenue = completedTodayOrders.reduce((sum, o) => {
    const amount = o.jumlah_bayar || parseFloat(o.total_harga.toString());
    return sum + amount;
  }, 0);

  return {
    todayOrders: todayOrders.length,
    todayRevenue,
    weekRevenue,
    monthRevenue,
    pendingPayment,
    pendingPaymentAmount, // ✅ NEW
    completedToday,
    completedTodayRevenue, // ✅ NEW
  };
};

// ✅ NEW: Calculate Revenue Data (seperti Admin Dashboard)
export const calculateRevenueData = (orders: Order[]): RevenueData => {
  const now = new Date();
  const todayDate = getDateOnly(now.toISOString());

  // Filter today's orders only
  const todayOrders = orders.filter(
    o => getDateOnly(o.tanggal_order) === todayDate,
  );

  // Separate paid and pending transactions
  const paidTxs = todayOrders.filter(order => {
    if (order.status_pembayaran) {
      const paidStatuses = ['dibayar', 'diterima', 'lunas', 'confirmed', 'paid'];
      return paidStatuses.includes(order.status_pembayaran.toLowerCase());
    }
    return [
      'dibayar',
      'diproses',
      'validasi',
      'cetak',
      'siap',
      'selesai',
      'dikirim',
    ].includes(order.status_order);
  });

  const pendingTxs = todayOrders.filter(order => {
    if (order.status_pembayaran) {
      return order.status_pembayaran.toLowerCase() === 'pending';
    }
    return order.status_order === 'pending';
  });

  // Calculate total pemasukan (paid)
  const total_pemasukan = paidTxs.reduce((sum, order) => {
    const amount = order.jumlah_bayar || parseFloat(order.total_harga.toString());
    return sum + amount;
  }, 0);

  // Calculate total pending
  const total_pending = pendingTxs.reduce(
    (sum, order) => sum + parseFloat(order.total_harga.toString()),
    0,
  );

  // Calculate by payment method
  const total_cash = paidTxs
    .filter(order => order.metode_pembayaran?.toLowerCase() === 'cash')
    .reduce((sum, order) => {
      const amount = order.jumlah_bayar || parseFloat(order.total_harga.toString());
      return sum + amount;
    }, 0);

  const total_transfer = paidTxs
    .filter(order => order.metode_pembayaran?.toLowerCase() === 'transfer')
    .reduce((sum, order) => {
      const amount = order.jumlah_bayar || parseFloat(order.total_harga.toString());
      return sum + amount;
    }, 0);

  const total_qris = paidTxs
    .filter(order => order.metode_pembayaran?.toLowerCase() === 'qris')
    .reduce((sum, order) => {
      const amount = order.jumlah_bayar || parseFloat(order.total_harga.toString());
      return sum + amount;
    }, 0);

  return {
    total_pemasukan,
    total_pending,
    total_cash,
    total_transfer,
    total_qris,
    paid_transactions: paidTxs.length,
    pending_transactions: pendingTxs.length,
  };
};

// Filter orders by period
export const filterOrdersByPeriod = (
  orders: Order[],
  period: 'today' | 'week' | 'month',
): Order[] => {
  const now = new Date();
  const todayDate = getDateOnly(now.toISOString());

  // Calculate week start
  const startOfWeek = new Date(now);
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(now.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);
  const weekStartDate = getDateOnly(startOfWeek.toISOString());

  // Calculate month start
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthStartDate = getDateOnly(startOfMonth.toISOString());

  if (period === 'today') {
    return orders.filter(order => getDateOnly(order.tanggal_order) === todayDate);
  } else if (period === 'week') {
    return orders.filter(
      order => getDateOnly(order.tanggal_order) >= weekStartDate,
    );
  } else {
    return orders.filter(
      order => getDateOnly(order.tanggal_order) >= monthStartDate,
    );
  }
};