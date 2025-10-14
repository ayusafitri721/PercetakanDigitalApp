import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductForm from './ProductForm';
import ProductDelete from './ProductDelete';
import './products.css';

const API_BASE_URL = 'http://localhost/api-percetakan/api';

interface Product {
  id_product: string;
  id_category: string;
  nama_category: string;
  nama_product: string;
  deskripsi: string;
  media_cetak: string;
  ukuran_standar: string;
  satuan: string;
  harga_dasar: number;
  gambar_preview: string;
  status_aktif: number;
  tanggal_dibuat: string;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/products.php`, {
        params: { _t: new Date().getTime() },
      });

      console.log('API Response:', response.data); // Debug log

      // Coba berbagai kemungkinan struktur response
      if (response.data.status === 'success') {
        // Kemungkinan 1: response.data.products (array)
        if (Array.isArray(response.data.products)) {
          setProducts(response.data.products);
        }
        // Kemungkinan 2: response.data.data (array)
        else if (Array.isArray(response.data.data)) {
          setProducts(response.data.data);
        }
        // Kemungkinan 3: response.data.data.products (nested)
        else if (
          response.data.data &&
          Array.isArray(response.data.data.products)
        ) {
          setProducts(response.data.data.products);
        } else {
          console.warn('Products is not an array:', response.data);
          setProducts([]);
        }
      }
      // Jika tidak ada status, cek langsung data
      else if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else if (response.data.data && Array.isArray(response.data.data)) {
        setProducts(response.data.data);
      } else {
        console.warn('Unexpected API response structure:', response.data);
        setProducts([]);
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      console.error('Error details:', error.response?.data);
      alert(
        'Gagal memuat data produk: ' +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Format Rupiah
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Handle Add
  const handleAdd = () => {
    setSelectedProduct(null);
    setShowForm(true);
  };

  // Handle Edit
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  // Handle Delete
  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  // Filter products
  const filteredProducts = products.filter(
    product =>
      product.nama_product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.nama_category?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="products-container">
      <div className="products-header">
        <div>
          <h1>📦 Manajemen Produk</h1>
          <p className="subtitle">Kelola produk percetakan</p>
        </div>
        <button className="btn-add" onClick={handleAdd}>
          + Tambah Produk
        </button>
      </div>

      {/* Search */}
      <div className="search-section">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Cari produk atau kategori..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Product Table */}
      {loading ? (
        <div className="loading">⏳ Memuat data...</div>
      ) : (
        <div className="table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Produk</th>
                <th>Kategori</th>
                <th>Media Cetak</th>
                <th>Ukuran</th>
                <th>Harga Dasar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center">
                    {searchTerm
                      ? 'Tidak ada produk yang sesuai pencarian'
                      : 'Belum ada produk'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id_product}>
                    <td>{product.id_product}</td>
                    <td>
                      <div className="product-info">
                        {product.gambar_preview && (
                          <img
                            src={product.gambar_preview}
                            alt={product.nama_product}
                            className="product-img"
                          />
                        )}
                        <div>
                          <div className="product-name">
                            {product.nama_product}
                          </div>
                          <div className="product-desc">
                            {product.deskripsi}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-category">
                        {product.nama_category}
                      </span>
                    </td>
                    <td>{product.media_cetak || '-'}</td>
                    <td>
                      {product.ukuran_standar} {product.satuan}
                    </td>
                    <td className="text-right font-semibold">
                      {formatRupiah(product.harga_dasar)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(product)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(product)}
                          title="Hapus"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      <div className="summary">
        Total: <strong>{filteredProducts.length}</strong> produk
        {searchTerm && ` (dari ${products.length} total)`}
      </div>

      {/* Modals */}
      {showForm && (
        <ProductForm
          product={selectedProduct}
          onClose={success => {
            setShowForm(false);
            setSelectedProduct(null);
            if (success) fetchProducts();
          }}
        />
      )}

      {showDeleteModal && selectedProduct && (
        <ProductDelete
          product={selectedProduct}
          onClose={success => {
            setShowDeleteModal(false);
            setSelectedProduct(null);
            if (success) fetchProducts();
          }}
        />
      )}
    </div>
  );
};

export default ProductList;
