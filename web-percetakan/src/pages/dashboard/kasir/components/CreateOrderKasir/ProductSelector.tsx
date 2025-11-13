// ProductSelector.tsx - Komponen Pilih Produk & Upload File

import React from 'react';
import type { Product, CurrentItem } from './types'; 
import { formatRupiah, isProductNeedDesign } from './utils';

interface ProductSelectorProps {
  products: Product[];
  loadingProducts: boolean;
  currentItem: CurrentItem;
  setCurrentItem: React.Dispatch<React.SetStateAction<CurrentItem>>;
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  handleAddItem: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  loadingProducts,
  currentItem,
  setCurrentItem,
  selectedCategory,
  setSelectedCategory,
  handleAddItem,
  handleFileChange,
}) => {
  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter(p => p.nama_category === selectedCategory);

  const categories = [
    'all',
    ...Array.from(new Set(products.map(p => p.nama_category))),
  ];

  const needDesign = currentItem.id_product
    ? isProductNeedDesign(currentItem.id_product, products)
    : false;

  return (
    <div
      style={{
        background: '#fff3cd',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
      }}
    >
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>
        ➕ Tambah Produk
      </h3>

      <div style={{ marginBottom: '1rem' }}>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '6px',
            border: '1px solid #ddd',
            background: 'white',
          }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? '📂 Semua Kategori' : `📁 ${cat}`}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '0.5rem',
          marginBottom: '0.5rem',
        }}
      >
        <select
          value={currentItem.id_product}
          onChange={e =>
            setCurrentItem({
              ...currentItem,
              id_product: e.target.value,
            })
          }
          disabled={loadingProducts}
          style={{
            padding: '0.5rem',
            borderRadius: '6px',
            border: '1px solid #ddd',
          }}
        >
          <option value="">-- Pilih Produk --</option>
          {filteredProducts.map(p => (
            <option key={p.id_product} value={p.id_product}>
              {p.nama_product} - {formatRupiah(Number(p.harga_dasar))}/
              {p.satuan}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={currentItem.jumlah}
          onChange={e =>
            setCurrentItem({
              ...currentItem,
              jumlah: parseInt(e.target.value) || 1,
            })
          }
          min="1"
          placeholder="Jumlah"
          style={{
            padding: '0.5rem',
            borderRadius: '6px',
            border: '1px solid #ddd',
          }}
        />
      </div>

      {currentItem.id_product && needDesign && (
        <div
          style={{
            background: '#ffe5e5',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '0.5rem',
            border: '2px dashed #dc3545',
          }}
        >
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'bold',
              color: '#dc3545',
            }}
          >
            📎 Upload File Desain *WAJIB untuk produk ini
          </label>
          <input
            id="file_desain_input"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid #dc3545',
              background: 'white',
            }}
          />
          <p
            style={{
              margin: '0.5rem 0 0 0',
              fontSize: '0.75rem',
              color: '#666',
            }}
          >
            Format: JPG, PNG, PDF | Max: 10MB
          </p>
          {currentItem.file_desain && (
            <p
              style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.85rem',
                color: '#28a745',
                fontWeight: 'bold',
              }}
            >
              ✅ File: {currentItem.file_desain.name} (
              {(currentItem.file_desain.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>
      )}

      {currentItem.id_product && !needDesign && (
        <div
          style={{
            background: '#e8f5e9',
            padding: '0.75rem',
            borderRadius: '6px',
            marginBottom: '0.5rem',
            fontSize: '0.85rem',
            color: '#2e7d32',
          }}
        >
          ℹ️ Produk ini tidak memerlukan file desain
        </div>
      )}

      <textarea
        value={currentItem.catatan}
        onChange={e =>
          setCurrentItem({ ...currentItem, catatan: e.target.value })
        }
        placeholder="Catatan tambahan (opsional)"
        rows={2}
        style={{
          width: '100%',
          padding: '0.5rem',
          borderRadius: '6px',
          border: '1px solid #ddd',
          marginBottom: '0.5rem',
          resize: 'vertical',
        }}
      />

      <button
        type="button"
        onClick={handleAddItem}
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '6px',
          border: 'none',
          background: '#28a745',
          color: 'white',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '1rem',
        }}
      >
        ➕ TAMBAH KE KERANJANG
      </button>
    </div>
  );
};

export default ProductSelector;
