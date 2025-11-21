// screens/customer/CartScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from './contexts/CartContext';
import CartCheckoutScreen from './CartCheckoutScreen';

interface UserData {
  id_customer?: number;
  nama_lengkap?: string;
  email?: string;
  no_telepon?: string;
  alamat?: string;
  kota?: string;
  provinsi?: string;
}

interface CartScreenProps {
  onBack: () => void;
  onCheckoutSuccess: (orderId: number, kodeOrder: string) => void;
}

export default function CartScreen({
  onBack,
  onCheckoutSuccess,
}: CartScreenProps) {
  // ✅ SEMUA HOOKS DI BAGIAN PALING ATAS!
  const {
    cartItems,
    cartOrder,
    cartCount,
    loading,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
  } = useCart();

  // State hooks
  const [showCheckout, setShowCheckout] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // FETCH USER DATA dari AsyncStorage + NORMALISASI DATA!
  useEffect(() => {
    const initScreen = async () => {
      try {
        setLoadingUser(true);
        const userJson = await AsyncStorage.getItem('userData');

        if (userJson) {
          const parsed = JSON.parse(userJson);
          const rawUser = parsed.user || parsed; // bisa {user: {...}} atau langsung {...}

          // NORMALISASI DATA supaya SELALU punya key yang sama!
          const normalizedUser: UserData = {
            id_customer: rawUser.id_user || rawUser.id_customer,
            nama_lengkap: rawUser.nama || rawUser.nama_lengkap || 'Pengguna',
            email: rawUser.email || '',
            no_telepon: rawUser.no_telepon || rawUser.telp || '',
            alamat: rawUser.alamat || '',
            kota: rawUser.kota || '',
            provinsi: rawUser.provinsi || '',
          };

          console.log(
            'CartScreen - User data loaded & normalized:',
            normalizedUser,
          );

          setUserData(normalizedUser);
        } else {
          console.log('CartScreen - No user data in AsyncStorage');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoadingUser(false);
      }

      refreshCart();
    };

    initScreen();
  }, []);

  // Handler functions
  const handleUpdateQuantity = async (
    idItem: number,
    currentQty: number,
    change: number,
  ) => {
    const newQty = currentQty + change;

    if (newQty < 1) {
      Alert.alert('Hapus Item', 'Apakah Anda yakin ingin menghapus item ini?', [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => handleRemoveItem(idItem),
        },
      ]);
      return;
    }

    try {
      await updateCartItem(idItem, newQty);
    } catch (error) {
      Alert.alert('Error', 'Gagal mengupdate jumlah item');
    }
  };

  const handleRemoveItem = async (idItem: number) => {
    try {
      await removeFromCart(idItem);
      Alert.alert('Berhasil', 'Item berhasil dihapus');
    } catch (error) {
      Alert.alert('Error', 'Gagal menghapus item');
    }
  };

  const handleClearCart = () => {
    Alert.alert(
      'Kosongkan Keranjang',
      'Apakah Anda yakin ingin mengosongkan semua item di keranjang?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Kosongkan',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCart();
              Alert.alert('Berhasil', 'Keranjang berhasil dikosongkan');
            } catch (error) {
              Alert.alert('Error', 'Gagal mengosongkan keranjang');
            }
          },
        },
      ],
    );
  };

  const handleCheckoutPress = () => {
    if (cartItems.length === 0) {
      Alert.alert('Perhatian', 'Keranjang Anda masih kosong');
      return;
    }

    if (!userData) {
      Alert.alert('Error', 'Data user tidak ditemukan. Silakan login ulang.');
      return;
    }

    setShowCheckout(true);
  };

  const handleCheckoutBack = () => {
    setShowCheckout(false);
    refreshCart();
  };

  const handleCheckoutSuccessWrapper = (orderId: number, kodeOrder: string) => {
    setShowCheckout(false);
    onCheckoutSuccess(orderId, kodeOrder);
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const renderCartItem = (item: (typeof cartItems)[0]) => (
    <View key={item.id_item} style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.nama_product}</Text>
        <Text style={styles.itemSize}>📏 {item.ukuran}</Text>
        {item.keterangan && (
          <Text style={styles.itemNote} numberOfLines={2}>
            📝 {item.keterangan}
          </Text>
        )}
        <Text style={styles.itemPrice}>
          {formatPrice(item.harga_satuan)} × {item.jumlah}
        </Text>
      </View>

      <View style={styles.itemActions}>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => handleUpdateQuantity(item.id_item!, item.jumlah, -1)}
          >
            <Icon name="remove" size={16} color="#4F46E5" />
          </TouchableOpacity>

          <Text style={styles.qtyText}>{item.jumlah}</Text>

          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => handleUpdateQuantity(item.id_item!, item.jumlah, 1)}
          >
            <Icon name="add" size={16} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        <Text style={styles.itemSubtotal}>{formatPrice(item.subtotal)}</Text>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleRemoveItem(item.id_item!)}
        >
          <Icon name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ✅ PASS userData KE CartCheckoutScreen
  if (showCheckout) {
    return (
      <CartCheckoutScreen
        onBack={handleCheckoutBack}
        onCheckoutSuccess={handleCheckoutSuccessWrapper}
        userData={userData}
      />
    );
  }

  if (loading && cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Keranjang</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Memuat keranjang...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Keranjang ({cartCount})</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity
            onPress={handleClearCart}
            style={styles.clearButton}
          >
            <Icon name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="cart-outline" size={80} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Keranjang Kosong</Text>
          <Text style={styles.emptyText}>
            Belum ada produk di keranjang Anda.{'\n'}
            Yuk mulai belanja!
          </Text>
          <TouchableOpacity style={styles.shopButton} onPress={onBack}>
            <Icon name="storefront" size={20} color="#FFFFFF" />
            <Text style={styles.shopButtonText}>Lihat Katalog</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.itemsContainer}>
              {cartItems.map(renderCartItem)}
            </View>
            <View style={{ height: 120 }} />
          </ScrollView>

          <View style={styles.bottomBar}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalPrice}>
                {formatPrice(cartOrder?.total_harga || 0)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckoutPress}
              disabled={loading}
            >
              <Icon name="card" size={20} color="#FFFFFF" />
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  itemsContainer: {
    padding: 16,
  },
  cartItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  itemInfo: {
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  itemSize: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  itemNote: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 13,
    color: '#6B7280',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  itemSubtotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4F46E5',
    flex: 1,
    textAlign: 'center',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 20,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
