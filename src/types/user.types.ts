// src/types/user.types.ts
export interface CurrentUser {
  id_user: string;
  nama: string;
  email: string;
  role: string;  // ✅ Konsisten: required
  no_telepon?: string;
  alamat?: string;
  kota?: string;
  provinsi?: string;
}