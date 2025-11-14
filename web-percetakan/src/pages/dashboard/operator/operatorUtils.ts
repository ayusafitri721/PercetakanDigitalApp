// operatorUtils.ts - Helper Functions & API Calls
import axios from 'axios';
import { API_BASE_URL } from '../../../config';
import type { Order, Stats } from './operatorTypes';

// ============ FORMAT HELPERS ============
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date().toISOString().split('T')[0];

  if (dateString.startsWith(today)) {
    return (
      'Hari ini, ' +
      date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    );
  }
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const getStatusBadge = (status: string) => {
  const map: { [key: string]: { label: string; color: string } } = {
    pending: { label: '⏳ Menunggu', color: '#ffc107' },
    dibayar: { label: '✅ Siap Dikerjakan', color: '#17a2b8' },
    validasi: { label: '✅ Siap Dikerjakan', color: '#17a2b8' },
    diproses: { label: '🖨️ Sedang Diproses', color: '#007bff' },
    cetak: { label: '🖨️ Sedang Dicetak', color: '#007bff' },
    selesai: { label: '✅ SELESAI', color: '#28a745' },
    dikirim: { label: '🚚 Dikirim', color: '#6c757d' },
    dibatalkan: { label: '❌ Dibatalkan', color: '#dc3545' },
  };
  return map[status] || { label: status, color: '#6c757d' };
};

// ============ DATA PROCESSING ============
export const calculateStats = (queue: Order[], allOrders: Order[]): Stats => {
  const today = new Date().toISOString().split('T')[0];

  const todayQueue = queue.filter(o =>
    o.tanggal_order.startsWith(today),
  ).length;

  const inProgress = queue.filter(o =>
    ['diproses', 'cetak'].includes(o.status_order),
  ).length;

  const expressQueue = queue.filter(
    o => o.kecepatan_pengerjaan === 'express',
  ).length;

  const todayCompleted = allOrders.filter(
    o => o.status_order === 'selesai' && o.tanggal_order.startsWith(today),
  ).length;

  return { todayQueue, inProgress, todayCompleted, expressQueue };
};

export const filterQueueOrders = (orders: Order[]): Order[] => {
  const queue = orders.filter((o: Order) => {
    const isPaid =
      (o.status_pembayaran &&
        ['dibayar', 'diterima', 'lunas', 'confirmed'].includes(
          o.status_pembayaran.toLowerCase(),
        )) ||
      ['dibayar', 'diproses', 'validasi', 'cetak'].includes(
        o.status_order,
      ) ||
      (o.jenis_order === 'offline' && o.status_order !== 'pending');

    const notFinished = !['selesai', 'dikirim', 'dibatalkan'].includes(
      o.status_order,
    );

    return isPaid && notFinished;
  });

  queue.sort((a: Order, b: Order) => {
    if (
      a.kecepatan_pengerjaan === 'express' &&
      b.kecepatan_pengerjaan !== 'express'
    )
      return -1;
    if (
      a.kecepatan_pengerjaan !== 'express' &&
      b.kecepatan_pengerjaan === 'express'
    )
      return 1;
    return (
      new Date(a.tanggal_order).getTime() -
      new Date(b.tanggal_order).getTime()
    );
  });

  return queue;
};

// ============ API CALLS ============
export const apiService = {
  async fetchOrders() {
    const response = await axios.get(`${API_BASE_URL}/orders.php`, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  },

  async fetchOrderDetail(orderId: string) {
    const orderResponse = await axios.get(`${API_BASE_URL}/orders.php`, {
      params: { op: 'detail', id: orderId },
      headers: { Accept: 'application/json' },
    });

    if (orderResponse.data.status !== 'success') {
      throw new Error('Gagal ambil detail order');
    }

    let orderDetail = orderResponse.data.data;

    try {
      const filesResponse = await axios.get(
        `${API_BASE_URL}/design_files.php`,
        {
          params: { op: 'by_order', id_order: orderId },
          headers: { Accept: 'application/json' },
        },
      );

      if (filesResponse.data.status === 'success') {
        orderDetail.design_files = filesResponse.data.data?.files || [];
      }
    } catch (fileError) {
      console.warn('Tidak ada file design:', fileError);
      orderDetail.design_files = [];
    }

    return orderDetail;
  },

  async updateOrderStatus(orderId: string, status: string) {
    const formData = new FormData();
    formData.append('status_order', status);

    const response = await axios.post(
      `${API_BASE_URL}/orders.php?op=update&id=${orderId}`,
      formData,
      { headers: { Accept: 'application/json' } },
    );

    return response.data;
  },

  async uploadFile(file: File) {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('folder', 'result_files');

    const response = await axios.post(
      `${API_BASE_URL}/upload_file.php`,
      uploadFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      },
    );

    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Gagal upload file ke server');
    }

    return response.data.data;
  },

  async createResultFile(data: {
    id_order: string;
    nama_file: string;
    file_url: string;
    ukuran_file: number;
    tipe_file: string;
    keterangan: string;
  }) {
    const resultFormData = new FormData();
    resultFormData.append('id_order', data.id_order);
    resultFormData.append('nama_file', data.nama_file);
    resultFormData.append('file_url', data.file_url);
    resultFormData.append('ukuran_file', data.ukuran_file.toString());
    resultFormData.append('tipe_file', data.tipe_file);
    resultFormData.append('keterangan', data.keterangan);

    const response = await axios.post(
      `${API_BASE_URL}/result_files.php?op=create`,
      resultFormData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
      },
    );

    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Gagal menyimpan file hasil');
    }

    return response.data;
  },

  getDownloadUrl(fileUrl: string) {
    return `${API_BASE_URL}/download_file.php?file=${encodeURIComponent(fileUrl)}`;
  },
};