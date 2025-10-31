// config/api.ts
// Konfigurasi API untuk seluruh aplikasi
// Ganti IP ini sesuai dengan IP komputer server kamu

export const API_CONFIG = {
  // Base URL API
  BASE_URL: 'http://172.26.150.126/api-percetakan/api',
  
  // Endpoints
  ENDPOINTS: {
    // Auth
    LOGIN: '/auth.php?op=login',
    REGISTER: '/auth.php?op=register',
    
    // Products
    PRODUCTS: '/products.php',
    PRODUCT_DETAIL: '/products.php?op=detail',
    PRODUCTS_BY_CATEGORY: '/products.php?op=by_category',
    
    // Orders (nanti kalau udah ada)
    ORDERS: '/orders.php',
    ORDER_CREATE: '/orders.php?op=create',
    ORDER_HISTORY: '/orders.php?op=history',
    
    // Categories (nanti kalau perlu)
    CATEGORIES: '/categories.php',
  },
  
  // Timeout settings
  TIMEOUT: 10000, // 10 detik
  
  // Helper function untuk build URL
  getUrl: (endpoint: string) => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
  },
};

// Export default untuk kemudahan
export default API_CONFIG;