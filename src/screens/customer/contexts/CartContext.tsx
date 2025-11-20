// screens/customer/contexts/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

interface Product {
  id_product: string;
  nama_product: string;
  nama_category: string;
  harga_dasar: string;
  satuan: string;
  media_cetak: string;
  ukuran_standar: string;
  gambar_preview: string;
}

interface CartItem {
  id_item?: number;
  id: string;
  product: Product;
  nama_product: string;
  ukuran: string;
  material?: string;
  quantity: number;
  jumlah: number;
  speed: 'normal' | 'express';
  keterangan: string;
  harga_satuan: number;
  subtotal: number;
  designFile: {
    uri: string;
    name: string;
    type: string;
    size: number;
  } | null;
  addedAt: number;
}

interface CartOrder {
  subtotal: number;
  total_harga: number;
}

interface CartContextType {
  items: CartItem[];
  cartItems: CartItem[];
  cartOrder: CartOrder | null;
  cartCount: number;
  itemCount: number;
  totalPrice: number;
  loading: boolean;
  addToCart: (item: Omit<CartItem, 'id' | 'addedAt'>) => Promise<void>;
  removeFromCart: (itemId: number | string) => Promise<void>;
  updateCartItem: (itemId: number, newQuantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: (data: {
    catatan_pelanggan: string;
    kecepatan_pengerjaan: string;
  }) => Promise<{ success: boolean; orderId?: number; kodeOrder?: string }>;
  refreshCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = '@digital_print_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    saveCart();
  }, [items]);

  const loadCart = async () => {
    try {
      const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  };

  const addToCart = async (newItem: Omit<CartItem, 'id' | 'addedAt'>) => {
    const id = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const cartItem: CartItem = {
      ...newItem,
      id,
      id_item: Date.now(),
      addedAt: Date.now(),
      jumlah: newItem.quantity,
      nama_product: newItem.product.nama_product,
      ukuran: newItem.ukuran || newItem.product.ukuran_standar,
      harga_satuan: parseInt(newItem.product.harga_dasar),
    };

    cartItem.subtotal = calculateItemSubtotal(cartItem);

    setItems(prev => [...prev, cartItem]);
    // Tidak perlu alert di sini, akan ditangani di OrderFormScreen
  };

  const removeFromCart = async (itemId: number | string) => {
    setItems(prev =>
      prev.filter(item =>
        typeof itemId === 'number'
          ? item.id_item !== itemId
          : item.id !== itemId,
      ),
    );
  };

  const updateCartItem = async (itemId: number, newQuantity: number) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id_item === itemId) {
          const updated = {
            ...item,
            quantity: newQuantity,
            jumlah: newQuantity,
          };
          updated.subtotal = calculateItemSubtotal(updated);
          return updated;
        }
        return item;
      }),
    );
  };

  const clearCart = async () => {
    setItems([]);
    await AsyncStorage.removeItem(CART_STORAGE_KEY);
  };

  const checkout = async (data: {
    catatan_pelanggan: string;
    kecepatan_pengerjaan: string;
  }): Promise<{ success: boolean; orderId?: number; kodeOrder?: string }> => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const orderId = Date.now();
      const kodeOrder = `ORD-${orderId}`;

      // Clear cart after successful checkout
      await clearCart();

      return {
        success: true,
        orderId,
        kodeOrder,
      };
    } catch (error) {
      throw new Error('Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = async () => {
    await loadCart();
  };

  const isInCart = (productId: string): boolean => {
    return items.some(item => item.product.id_product === productId);
  };

  const calculateItemSubtotal = (item: CartItem): number => {
    const basePrice = item.harga_satuan;
    let total = basePrice * item.quantity;

    if (item.speed === 'express') {
      total *= 1.5;
    }

    return Math.round(total);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0);

  const cartOrder: CartOrder = {
    subtotal: totalPrice,
    total_harga: totalPrice,
  };

  return (
    <CartContext.Provider
      value={{
        items,
        cartItems: items,
        cartOrder,
        cartCount: itemCount,
        itemCount,
        totalPrice,
        loading,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        checkout,
        refreshCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
