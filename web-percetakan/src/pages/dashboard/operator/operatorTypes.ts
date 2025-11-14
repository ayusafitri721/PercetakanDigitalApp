// operatorTypes.ts - All Types & Interfaces
// File ini sudah benar, tidak ada perubahan
export interface DesignFile {
  id_file: string;
  nama_file: string;
  file_url: string;
  ukuran_file: number;
  tipe_file: string;
  tanggal_upload: string;
}

export interface OrderItem {
  id_item: string;
  nama_produk: string;
  jumlah: number;
  ukuran: string;
  catatan_item: string;
  harga_satuan?: number;
  file_desain?: string;
}

export interface Order {
  id_order: string;
  kode_order: string;
  nama_customer: string;
  email_customer: string;
  telepon_customer: string;
  total_harga: number;
  status_order: string;
  status_pembayaran: string;
  tanggal_order: string;
  jenis_order: string;
  kecepatan_pengerjaan: string;
  file_design?: string;
  catatan?: string;
  items: OrderItem[];
  design_files?: DesignFile[];
}

export interface Stats {
  todayQueue: number;
  inProgress: number;
  todayCompleted: number;
  expressQueue: number;
}