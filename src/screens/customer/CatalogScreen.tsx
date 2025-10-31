// screens/customer/CatalogScreen.tsx
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
import API_CONFIG from '../../config/api';

interface CatalogScreenProps {
  onBack: () => void;
  onSelectService: (service: Product) => void;
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
}: CatalogScreenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

      console.log('=== FULL API RESPONSE ===');
      console.log(JSON.stringify(data, null, 2));
      console.log('=========================');

      // Debug info
      console.log('📊 Response type:', typeof data);
      console.log('📊 Is array?:', Array.isArray(data));
      console.log('📊 Has success?:', data?.success);
      console.log('📊 Keys:', data ? Object.keys(data) : []);

      // Cek berbagai kemungkinan struktur response
      let productList: Product[] = [];

      // Jika response langsung array
      if (Array.isArray(data)) {
        productList = data;
        console.log('✅ Found products (direct array):', productList.length);
      }
      // Jika ada property success
      else if (data.success) {
        // Kemungkinan 1: data.data.products
        if (data.data && Array.isArray(data.data.products)) {
          productList = data.data.products;
          console.log(
            '✅ Found products in data.data.products:',
            productList.length,
          );
        }
        // Kemungkinan 2: data.products
        else if (Array.isArray(data.products)) {
          productList = data.products;
          console.log(
            '✅ Found products in data.products:',
            productList.length,
          );
        }
        // Kemungkinan 3: data.data (langsung array)
        else if (Array.isArray(data.data)) {
          productList = data.data;
          console.log(
            '✅ Found products in data.data (array):',
            productList.length,
          );
        }
        // Kemungkinan 4: data itu sendiri adalah array produk
        else if (data.length) {
          productList = [data];
          console.log('✅ Found single product:', productList.length);
        }
      }
      // Jika tidak ada success property tapi ada data
      else if (data.data) {
        if (Array.isArray(data.data)) {
          productList = data.data;
          console.log('✅ Found products in data.data:', productList.length);
        } else if (Array.isArray(data.data.products)) {
          productList = data.data.products;
          console.log(
            '✅ Found products in data.data.products:',
            productList.length,
          );
        }
      }

      console.log('📦 Total products found:', productList.length);

      if (productList.length > 0) {
        console.log(
          '📋 First product sample:',
          JSON.stringify(productList[0], null, 2),
        );
        setProducts(productList);
        Alert.alert('Berhasil', `${productList.length} produk berhasil dimuat`);
      } else {
        console.warn('⚠️ No products found in response');
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

  // Mapping icon berdasarkan kategori
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

  // Mapping warna berdasarkan kategori
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Katalog Layanan</Text>
        <View style={{ width: 40 }} />
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
                  onPress={() => onSelectService(product)}
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

// Service Card Component
function ServiceCard({
  product,
  icon,
  color,
  onPress,
}: {
  product: Product;
  icon: string;
  color: string;
  onPress: () => void;
}) {
  const formatPrice = (price: string) => {
    const numPrice = parseInt(price);
    return `Rp ${numPrice.toLocaleString('id-ID')}`;
  };

  return (
    <TouchableOpacity
      style={styles.serviceCard}
      activeOpacity={0.7}
      onPress={onPress}
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
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
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
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
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
  arrow: {
    fontSize: 24,
    color: '#9CA3AF',
    marginLeft: 8,
  },
});
