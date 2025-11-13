// types.ts - Interface & Types untuk CreateOrderKasir

export interface Product {
  id_product: string;
  nama_product: string;
  harga_dasar: number;
  satuan: string;
  nama_category: string;
}

export interface OrderItem {
  id_product: string;
  nama_product: string;
  jumlah: number;
  ukuran: string;
  harga_satuan: number;
  subtotal: number;
  catatan: string;
  file_desain?: File | null;
}

export interface CustomerData {
  nama_pelanggan: string;
  no_telepon: string;
  email: string;
  alamat: string;
}

export interface CurrentItem {
  id_product: string;
  jumlah: number;
  ukuran: string;
  catatan: string;
  file_desain: File | null;
}

export interface OrderSettings {
  kecepatan_pengerjaan: 'normal' | 'express';
  diskon: number;
}

export interface PaymentData {
  metode_pembayaran: 'cash' | 'transfer' | 'qris';
  jumlah_bayar: number;
  uang_diterima: number;
}

export interface CreateOrderKasirProps {
  onClose: (success: boolean) => void;
}