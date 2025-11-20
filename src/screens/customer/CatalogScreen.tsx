// screens/customer/CatalogScreen.tsx (UPDATED)
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
import { useCart } from './contexts/CartContext';
import API_CONFIG from '../../config/api';

interface CatalogScreenProps {
  onBack: () => void;
  onSelectService: (service: Product, mode: 'direct' | 'cart') => void;
  onViewCart: () => void; // NEW
}

interface Product {
  id_product: string;
  id_category: string;
  nama_category: string;
  nama_product: string;
  deskripsi: string;
  media_cetak: string;
  ukuran_standar: string;
  satuan: string;
  harga_dasar: string;
  gambar_preview: string;
}

export default function CatalogScreen({
  onBack,
  onSelectService,
  onViewCart,
}: CatalogScreenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { itemCount } = useCart(); // NEW: Get cart count

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const url = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.PRODUCTS);
      console.log('🔄 Fetching products from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as any;

      let productList: Product[] = [];

      if (Array.isArray(data)) {
        productList = data;
      } else if (data.success) {
        if (data.data && Array.isArray(data.data.products)) {
          productList = data.data.products;
        } else if (Array.isArray(data.products)) {
          productList = data.products;
        } else if (Array.isArray(data.data)) {
          productList = data.data;
        }
      } else if (data.data) {
        if (Array.isArray(data.data)) {
          productList = data.data;
        } else if (Array.isArray(data.data.products)) {
          productList = data.data.products;
        }
      }

      if (productList.length > 0) {
        setProducts(productList);
      } else {
        Alert.alert('Info', 'Belum ada produk tersedia di database');
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
      Alert.alert(
        'Error',
        'Tidak bisa terhubung ke server!\n' + (error as Error).message,
      );
    } finally {
      setLoading(false);
    }
  };

  const getIconByCategory = (categoryName: string): string => {
    const lower = categoryName.toLowerCase();
    if (lower.includes('dokumen') || lower.includes('document')) return '📄';
    if (lower.includes('banner')) return '🎴';
    if (lower.includes('kaos') || lower.includes('textile')) return '👕';
    if (lower.includes('stiker') || lower.includes('sticker')) return '🖼️';
    if (lower.includes('packaging') || lower.includes('kemasan')) return '🎁';
    if (lower.includes('foto') || lower.includes('photo')) return '📸';
    return '🖨️';
  };

  const getColorByCategory = (categoryName: string): string => {
    const lower = categoryName.toLowerCase();
    if (lower.includes('dokumen')) return '#4F46E5';
    if (lower.includes('banner')) return '#10B981';
    if (lower.includes('kaos')) return '#F59E0B';
    if (lower.includes('stiker')) return '#EF4444';
    if (lower.includes('packaging')) return '#8B5CF6';
    if (lower.includes('foto')) return '#EC4899';
    return '#6366F1';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Katalog Layanan</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Memuat produk...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Cart Badge */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Katalog Layanan</Text>
        {/* NEW: Cart Button */}
        <TouchableOpacity onPress={onViewCart} style={styles.cartButton}>
          <Text style={styles.cartIcon}>🛒</Text>
          {itemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Pilih jenis layanan cetak yang Anda butuhkan
        </Text>

        {products.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>Belum Ada Produk</Text>
            <Text style={styles.emptyText}>
              Produk belum tersedia saat ini.{'\n'}
              Periksa koneksi ke server.
            </Text>
          </View>
        ) : (
          <>
            {products.map(product => {
              const icon = getIconByCategory(product.nama_category);
              const color = getColorByCategory(product.nama_category);

              return (
                <ServiceCard
                  key={product.id_product}
                  product={product}
                  icon={icon}
                  color={color}
                  onDirectOrder={() => onSelectService(product, 'direct')}
                  onAddToCart={() => onSelectService(product, 'cart')}
                />
              );
            })}
            <View style={{ height: 20 }} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

// Service Card Component with Two Buttons
function ServiceCard({
  product,
  icon,
  color,
  onDirectOrder,
  onAddToCart,
}: {
  product: Product;
  icon: string;
  color: string;
  onDirectOrder: () => void;
  onAddToCart: () => void;
}) {
  const formatPrice = (price: string) => {
    const numPrice = parseInt(price);
    return `Rp ${numPrice.toLocaleString('id-ID')}`;
  };

  return (
    <View style={styles.serviceCard}>
      <TouchableOpacity
        style={styles.serviceCardMain}
        activeOpacity={0.7}
        onPress={onDirectOrder}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.name}>{product.nama_product}</Text>
          <Text style={styles.category}>📁 {product.nama_category}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {product.deskripsi || 'Layanan cetak berkualitas'}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color }]}>
              {formatPrice(product.harga_dasar)}
            </Text>
            <Text style={styles.unit}>/{product.satuan}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* NEW: Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.cartButton2]}
          onPress={onAddToCart}
          activeOpacity={0.7}
        >
          <Text style={styles.cartButtonText}>🛒 Keranjang</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.orderButton,
            { backgroundColor: color },
          ]}
          onPress={onDirectOrder}
          activeOpacity={0.7}
        >
          <Text style={styles.orderButtonText}>Pesan Langsung →</Text>
        </TouchableOpacity>
      </View>
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
  backIcon: {
    fontSize: 24,
    color: '#1F2937',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartIcon: {
    fontSize: 20,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
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
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  serviceCardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
  },
  unit: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cartButton2: {
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  cartButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  orderButton: {
    elevation: 2,
  },
  orderButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
});
