/**
 * Konfigurasi API untuk seluruh aplikasi
 * Ganti IP sesuai sama ipconfig kalian masing2
 */
export const API_CONFIG = {
  // Base URL API
  BASE_URL: 'http://10.155.114.126/api-percetakan/api',
  
  // Timeout settings
  TIMEOUT: 10000, // 10 detik
  
  // Endpoints
  ENDPOINTS: {
    // Auth
    LOGIN: '/auth.php?op=login',
    REGISTER: '/auth.php?op=register',
    
    // Products
    PRODUCTS: '/products.php',
    PRODUCT_DETAIL: '/products.php?op=detail',
    PRODUCTS_BY_CATEGORY: '/products.php?op=by_category',
    
    // Orders
    ORDERS: '/orders.php',
    ORDER_CREATE: '/orders.php?op=create',
    ORDER_HISTORY: '/orders.php?op=history',
    
    // Categories
    CATEGORIES: '/categories.php',
  },
  
  // Helper function untuk build URL
  getUrl: (endpoint: string) => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
  },
};

// Export individual untuk backward compatibility
export const API_BASE_URL = API_CONFIG.BASE_URL;
export const REQUEST_TIMEOUT = API_CONFIG.TIMEOUT;
export const ENDPOINTS = API_CONFIG.ENDPOINTS;

// Export default untuk kemudahan
export default API_CONFIG;