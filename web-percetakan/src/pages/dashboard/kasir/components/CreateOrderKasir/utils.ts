// utils.ts - Helper Functions

import type { Product } from './types';

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const isProductNeedDesign = (
  productId: string,
  products: Product[]
): boolean => {
  const product = products.find(p => p.id_product === productId);
  if (!product) return false;

  const noDesignCategories = [
    'fotokopi',
    'scan',
    'print dokumen',
    'laminating',
  ];
  return !noDesignCategories.some(cat =>
    product.nama_category?.toLowerCase().includes(cat)
  );
};

export const generateQRCodeUrl = (totalHarga: number): string => {
  const qrData = `QRIS_PAYMENT|AMOUNT:${totalHarga}|MERCHANT:PERCETAKAN_XYZ`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    qrData
  )}`;
};