// config/authAPI.ts
import { API_BASE_URL, ENDPOINTS, REQUEST_TIMEOUT } from './api';

// ========================================
// TYPES / INTERFACES
// ========================================

// Login
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id_user: string;
      nama: string;
      email: string;
      role: string;
      no_telepon?: string;
      alamat?: string;
    };
    token: string;
  };
}

// Register
export interface RegisterRequest {
  nama: string;
  email: string;
  password: string;
  no_telepon?: string;
  alamat?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id_user: string;
      nama: string;
      email: string;
      role: string;
      no_telepon?: string;
      alamat?: string;
    };
    token: string;
  };
}

// ========================================
// AUTH API FUNCTIONS
// ========================================

/**
 * LOGIN - Masuk ke aplikasi
 * 
 * @example
 * const result = await login({ email: 'test@mail.com', password: '123456' });
 * if (result.success) {
 *   console.log('Login berhasil!', result.data.user);
 * }
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    // Promise race antara fetch dan timeout
    const fetchPromise = fetch(`${API_BASE_URL}${ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const timeoutPromise = new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout! Periksa koneksi internet.')), REQUEST_TIMEOUT)
    );

    const response = await Promise.race([fetchPromise, timeoutPromise]);
    const data = await response.json() as LoginResponse;
    return data;
  } catch (error: any) {
    if (error.message?.includes('timeout')) {
      throw new Error('Request timeout! Periksa koneksi internet.');
    }
    throw new Error('Tidak dapat terhubung ke server!');
  }
}

/**
 * REGISTER - Daftar akun baru
 * 
 * @example
 * const result = await register({
 *   nama: 'John Doe',
 *   email: 'john@mail.com',
 *   password: '123456',
 *   no_telepon: '08123456789',
 *   alamat: 'Jakarta'
 * });
 */
export async function register(userData: RegisterRequest): Promise<RegisterResponse> {
  try {
    // Promise race antara fetch dan timeout
    const fetchPromise = fetch(`${API_BASE_URL}${ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const timeoutPromise = new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout! Periksa koneksi internet.')), REQUEST_TIMEOUT)
    );

    const response = await Promise.race([fetchPromise, timeoutPromise]);
    const data = await response.json() as RegisterResponse; // Tambahkan 'as RegisterResponse'
    return data;
  } catch (error: any) {
    if (error.message?.includes('timeout')) {
      throw new Error('Request timeout! Periksa koneksi internet.');
    }
    throw new Error('Tidak dapat terhubung ke server!');
  }
}

// Export sebagai object juga (opsional, biar fleksibel)
export const AuthAPI = {
  login,
  register,
};