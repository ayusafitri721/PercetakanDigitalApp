// src/types/User.ts
export interface User {
  id_user: string;
  nama: string;
  email: string;
  role: string;
  no_telepon: string;
  alamat: string;
  kota?: string;       // optional biar aman
  provinsi?: string;   // optional biar aman
}