// operatorTypes.ts - All Types & Interfaces

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
   result_files?: DesignFile[];
}

export interface Stats {
  todayQueue: number;
  inProgress: number;
  todayCompleted: number;
  expressQueue: number;
}

// NEW: Interface untuk upload per item
export interface ItemUploadStatus {
  id_item: string;
  nama_produk: string;
  jumlah: number;
  file: File | null;
  uploaded: boolean;
}