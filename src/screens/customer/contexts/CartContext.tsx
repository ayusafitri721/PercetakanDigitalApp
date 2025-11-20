// contexts/CartContext.tsx - FINAL FIXED VERSION
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

// Setup axios instance dengan session support
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface CartItem {
  id_item?: number;
  id_product: string;
  nama_product: string;
  ukuran: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
  keterangan?: string;
  file_url?: string;
}

interface CartOrder {
  id_order?: number;
  kode_order?: string;
  subtotal: number;
  total_harga: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartOrder: CartOrder | null;
  cartCount: number;
  loading: boolean;
  addToCart: (item: Omit<CartItem, 'id_item' | 'subtotal'>) => Promise<boolean>;
  updateCartItem: (id_item: number, jumlah: number) => Promise<boolean>;
  removeFromCart: (id_item: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  checkout: (data: {
    catatan_pelanggan?: string;
    kecepatan_pengerjaan?: string;
  }) => Promise<{ success: boolean; orderId?: number; kodeOrder?: string }>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOrder, setCartOrder] = useState<CartOrder | null>(null);
  const [loading, setLoading] = useState(false);

  const cartCount = cartItems.reduce((sum, item) => sum + item.jumlah, 0);

  useEffect(() => {
    refreshCart();
  }, []);

  const refreshCart = async () => {
    try {
      setLoading(true);
      console.log('🛒 Fetching cart...');

      const response = await api.get('/cart.php?action=get');

      if (response.data.success) {
        console.log(
          '✅ Cart loaded:',
          response.data.data.items?.length || 0,
          'items',
        );
        setCartItems(response.data.data.items || []);
        setCartOrder(response.data.data.order);
      } else {
        setCartItems([]);
        setCartOrder(null);
      }
    } catch (error: any) {
      console.error(
        '❌ Refresh cart error:',
        error.response?.data || error.message,
      );
      if (error.response?.status === 401) {
        setCartItems([]);
        setCartOrder(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (
    item: Omit<CartItem, 'id_item' | 'subtotal'>,
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const subtotal = item.harga_satuan * item.jumlah;

      const response = await api.post('/cart.php?action=add', {
        ...item,
        subtotal,
      });

      if (response.data.success) {
        await refreshCart();
        return true;
      } else {
        throw new Error(
          response.data.message || 'Gagal menambahkan ke keranjang',
        );
      }
    } catch (error: any) {
      console.error('❌ Add to cart error:', error);
      throw new Error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (
    id_item: number,
    jumlah: number,
  ): Promise<boolean> => {
    try {
      setLoading(true);

      const response = await api.put('/cart.php?action=update', {
        id_item,
        jumlah,
      });

      if (response.data.success) {
        await refreshCart();
        return true;
      } else {
        throw new Error(response.data.message || 'Gagal update item');
      }
    } catch (error: any) {
      console.error('❌ Update cart error:', error);
      throw new Error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (id_item: number): Promise<boolean> => {
    try {
      setLoading(true);

      const response = await api.delete(
        `/cart.php?action=delete&id=${id_item}`,
      );

      if (response.data.success) {
        await refreshCart();
        return true;
      } else {
        throw new Error(response.data.message || 'Gagal menghapus item');
      }
    } catch (error: any) {
      console.error('❌ Remove from cart error:', error);
      throw new Error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async (): Promise<boolean> => {
    try {
      setLoading(true);

      const response = await api.delete('/cart.php?action=clear');

      if (response.data.success) {
        setCartItems([]);
        setCartOrder(null);
        return true;
      } else {
        throw new Error(
          response.data.message || 'Gagal mengosongkan keranjang',
        );
      }
    } catch (error: any) {
      console.error('❌ Clear cart error:', error);
      throw new Error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkout = async (data: {
    catatan_pelanggan?: string;
    kecepatan_pengerjaan?: string;
  }): Promise<{ success: boolean; orderId?: number; kodeOrder?: string }> => {
    try {
      setLoading(true);

      const response = await api.post('/cart.php?action=checkout', data);

      if (response.data.success) {
        setCartItems([]);
        setCartOrder(null);
        return {
          success: true,
          orderId: response.data.data.orderId,
          kodeOrder: response.data.data.kodeOrder,
        };
      } else {
        throw new Error(response.data.message || 'Gagal checkout');
      }
    } catch (error: any) {
      console.error('❌ Checkout error:', error);
      throw new Error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartOrder,
        cartCount,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        checkout,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
