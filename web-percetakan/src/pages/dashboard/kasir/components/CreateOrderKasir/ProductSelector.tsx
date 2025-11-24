// ProductSelector.tsx - Blue Theme with Lucide Icons

import React from 'react';
import {
  Package,
  Plus,
  CheckCircle,
  Info,
  AlertTriangle,
} from 'lucide-react';
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
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        padding: '1.25rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        border: '2px solid #93c5fd',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Package size={20} color="white" strokeWidth={2.5} />
        </div>
        <h3
          style={{
            margin: 0,
            fontSize: '1.1rem',
            color: '#1e40af',
            fontWeight: '600',
          }}
        >
          Tambah Produk
        </h3>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          style={{
            width: '100%',
            padding: '0.875rem',
            borderRadius: '8px',
            border: '2px solid #93c5fd',
            background: 'white',
            fontSize: '0.95rem',
            fontWeight: '500',
            color: '#1e40af',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.2s',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = '#93c5fd';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'Semua Kategori' : cat}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '0.75rem',
          marginBottom: '0.75rem',
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
            padding: '0.875rem',
            borderRadius: '8px',
            border: '2px solid #93c5fd',
            background: 'white',
            fontSize: '0.95rem',
            fontWeight: '500',
            color: '#1e40af',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.2s',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = '#93c5fd';
            e.currentTarget.style.boxShadow = 'none';
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
            padding: '0.875rem',
            borderRadius: '8px',
            border: '2px solid #93c5fd',
            background: 'white',
            fontSize: '0.95rem',
            fontWeight: '600',
            color: '#1e40af',
            textAlign: 'center',
            outline: 'none',
            transition: 'all 0.2s',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = '#93c5fd';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      {currentItem.id_product && needDesign && (
        <div
          style={{
            background: '#fef2f2',
            padding: '1rem',
            borderRadius: '10px',
            marginBottom: '0.75rem',
            border: '2px solid #fca5a5',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
            }}
          >
            <AlertTriangle size={18} color="#dc2626" strokeWidth={2.5} />
            <label
              style={{
                display: 'block',
                fontWeight: '600',
                color: '#dc2626',
                fontSize: '0.9rem',
              }}
            >
              Upload File Desain *WAJIB untuk produk ini
            </label>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              id="file_desain_input"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '8px',
                border: '2px solid #fca5a5',
                background: 'white',
                fontSize: '0.875rem',
                cursor: 'pointer',
                outline: 'none',
              }}
            />
          </div>
          <p
            style={{
              margin: '0.5rem 0 0 0',
              fontSize: '0.75rem',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Info size={14} />
            Format: JPG, PNG, PDF | Max: 10MB
          </p>
          {currentItem.file_desain && (
            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.75rem',
                background: '#dcfce7',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle size={18} color="#16a34a" strokeWidth={2.5} />
              <p
                style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: '#166534',
                  fontWeight: '600',
                }}
              >
                File: {currentItem.file_desain.name} (
                {(currentItem.file_desain.size / 1024).toFixed(1)} KB)
              </p>
            </div>
          )}
        </div>
      )}

      {currentItem.id_product && !needDesign && (
        <div
          style={{
            background: '#dcfce7',
            padding: '0.875rem',
            borderRadius: '10px',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: '2px solid #86efac',
          }}
        >
          <Info size={18} color="#16a34a" strokeWidth={2.5} />
          <span
            style={{
              fontSize: '0.875rem',
              color: '#166534',
              fontWeight: '500',
            }}
          >
            Produk ini tidak memerlukan file desain
          </span>
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
          padding: '0.875rem',
          borderRadius: '8px',
          border: '2px solid #93c5fd',
          marginBottom: '0.75rem',
          resize: 'vertical',
          fontSize: '0.9rem',
          fontFamily: 'inherit',
          outline: 'none',
          transition: 'all 0.2s',
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = '#3b82f6';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = '#93c5fd';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />

      <button
        type="button"
        onClick={handleAddItem}
        style={{
          width: '100%',
          padding: '1rem',
          borderRadius: '10px',
          border: 'none',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(16,185,129,0.4)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.3)';
        }}
      >
        <Plus size={20} strokeWidth={2.5} />
        TAMBAH KE KERANJANG
      </button>
    </div>
  );
};

export default ProductSelector;
