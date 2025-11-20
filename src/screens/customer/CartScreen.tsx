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
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useCart } from './contexts/CartContext';

interface CartScreenProps {
  onBack: () => void;
  onCheckoutSuccess: (orderId: number, kodeOrder: string) => void;
}

export default function CartScreen({
  onBack,
  onCheckoutSuccess,
}: CartScreenProps) {
  const {
    cartItems,
    cartOrder,
    cartCount,
    loading,
    updateCartItem,
    removeFromCart,
    clearCart,
    checkout,
    refreshCart,
  } = useCart();

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [catatanPelanggan, setCatatanPelanggan] = useState('');
  const [kecepatanPengerjaan, setKecepatanPengerjaan] = useState('normal');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    refreshCart();
  }, []);

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

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Perhatian', 'Keranjang Anda masih kosong');
      return;
    }

    try {
      setCheckoutLoading(true);

      const result = await checkout({
        catatan_pelanggan: catatanPelanggan,
        kecepatan_pengerjaan: kecepatanPengerjaan,
      });

      if (result.success && result.orderId && result.kodeOrder) {
        setShowCheckoutModal(false);
        Alert.alert(
          'Checkout Berhasil!',
          `Order ID: ${result.kodeOrder}\n\nPesanan Anda sedang diproses.`,
          [
            {
              text: 'OK',
              onPress: () =>
                onCheckoutSuccess(result.orderId!, result.kodeOrder!),
            },
          ],
        );
      }
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setCheckoutLoading(false);
    }
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
        // Empty Cart
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

          {/* Bottom Bar */}
          <View style={styles.bottomBar}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalPrice}>
                {formatPrice(cartOrder?.total_harga || 0)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => setShowCheckoutModal(true)}
              disabled={loading}
            >
              <Icon name="card" size={20} color="#FFFFFF" />
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Checkout Modal */}
      <Modal
        visible={showCheckoutModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCheckoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Checkout</Text>
              <TouchableOpacity onPress={() => setShowCheckoutModal(false)}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Order Summary */}
              <View style={styles.summarySection}>
                <Text style={styles.sectionTitle}>Ringkasan Pesanan</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Jumlah Item:</Text>
                  <Text style={styles.summaryValue}>{cartCount} item</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal:</Text>
                  <Text style={styles.summaryValue}>
                    {formatPrice(cartOrder?.subtotal || 0)}
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalRowLabel}>Total:</Text>
                  <Text style={styles.totalRowValue}>
                    {formatPrice(cartOrder?.total_harga || 0)}
                  </Text>
                </View>
              </View>

              {/* Speed Selection */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Kecepatan Pengerjaan</Text>
                <View style={styles.speedOptions}>
                  <TouchableOpacity
                    style={[
                      styles.speedOption,
                      kecepatanPengerjaan === 'normal' &&
                        styles.speedOptionActive,
                    ]}
                    onPress={() => setKecepatanPengerjaan('normal')}
                  >
                    <Icon
                      name={
                        kecepatanPengerjaan === 'normal'
                          ? 'radio-button-on'
                          : 'radio-button-off'
                      }
                      size={20}
                      color={
                        kecepatanPengerjaan === 'normal' ? '#4F46E5' : '#9CA3AF'
                      }
                    />
                    <Text style={styles.speedLabel}>Normal (2-3 hari)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.speedOption,
                      kecepatanPengerjaan === 'express' &&
                        styles.speedOptionActive,
                    ]}
                    onPress={() => setKecepatanPengerjaan('express')}
                  >
                    <Icon
                      name={
                        kecepatanPengerjaan === 'express'
                          ? 'radio-button-on'
                          : 'radio-button-off'
                      }
                      size={20}
                      color={
                        kecepatanPengerjaan === 'express'
                          ? '#4F46E5'
                          : '#9CA3AF'
                      }
                    />
                    <Text style={styles.speedLabel}>Express (1 hari)</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Customer Note */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Catatan (Opsional)</Text>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Tambahkan catatan untuk pesanan Anda..."
                  value={catatanPelanggan}
                  onChangeText={setCatatanPelanggan}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            {/* Checkout Button */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.confirmButtonText}>
                    Konfirmasi Pesanan
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  summarySection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
  },
  totalRowLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalRowValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  formSection: {
    marginBottom: 20,
  },
  speedOptions: {
    gap: 12,
  },
  speedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    gap: 12,
  },
  speedOptionActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  speedLabel: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1F2937',
    minHeight: 100,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
