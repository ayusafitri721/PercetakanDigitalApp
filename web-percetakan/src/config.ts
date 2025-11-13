// src/config.ts

/**
 * Konfigurasi Global Aplikasi
 * Ubah URL di sini untuk mengubah semua endpoint
 */

// Base URL API
export const API_BASE_URL = 'http://localhost/api-percetakan/api';

// Endpoint-endpoint API
export const API_ENDPOINTS = {
  orders: `${API_BASE_URL}/orders.php`,
  payments: `${API_BASE_URL}/payments.php`,
  products: `${API_BASE_URL}/products.php`,
  customers: `${API_BASE_URL}/customers.php`,
  // Tambahkan endpoint lain di sini
};

// Konfigurasi lainnya (optional)
export const APP_CONFIG = {
  appName: 'Sistem Percetakan',
  version: '1.0.0',
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  currency: {
    locale: 'id-ID',
    code: 'IDR',
  },
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  APP_CONFIG,
};