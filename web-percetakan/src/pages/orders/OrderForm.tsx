import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './orders.css';

const API_BASE_URL = 'http://localhost/api-percetakan/api';

interface Product {
  id_product: string;
  nama_product: string;
  harga: number;
  kategori: string;
}

interface OrderItem {
  id_product: string;
  nama_product: string;
  ukuran: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
  keterangan: string;
}

interface User {
  id_user: string;
  nama: string;
  email: string;
  no_telepon: string;
  alamat: string;
}

interface OrderFormProps {
  onClose: (success: boolean) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [jenisOrder, setJenisOrder] = useState<string>('online');
  const [kecepatanPengerjaan, setKecepatanPengerjaan] =
    useState<string>('normal');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [diskon, setDiskon] = useState<number>(0);
  const [ongkir, setOngkir] = useState<number>(0);
  const [catatanPelanggan, setCatatanPelanggan] = useState<string>('');

  // Current item state
  const [currentProduct, setCurrentProduct] = useState<string>('');
  const [currentUkuran, setCurrentUkuran] = useState<string>('');
  const [currentJumlah, setCurrentJumlah] = useState<number>(1);
  const [currentKeterangan, setCurrentKeterangan] = useState<string>('');

  useEffect(() => {
    fetchUsers();
    fetchProducts();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users.php`, {
        headers: { Accept: 'application/json' },
      });
      if (response.data.status === 'success') {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products.php`, {
        headers: { Accept: 'application/json' },
      });
      if (response.data.status === 'success') {
        setProducts(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddItem = () => {
    if (!currentProduct || !currentJumlah) {
      alert('Pilih produk dan masukkan jumlah');
      return;
    }

    const product = products.find(p => p.id_product === currentProduct);
    if (!product) return;

    const subtotal = product.harga * currentJumlah;

    const newItem: OrderItem = {
      id_product: product.id_product,
      nama_product: product.nama_product,
      ukuran: currentUkuran,
      jumlah: currentJumlah,
      harga_satuan: product.harga,
      subtotal: subtotal,
      keterangan: currentKeterangan,
    };

    setItems([...items, newItem]);

    // Reset current item
    setCurrentProduct('');
    setCurrentUkuran('');
    setCurrentJumlah(1);
    setCurrentKeterangan('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - diskon + ongkir;
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) {
      alert('Pilih customer');
      return;
    }

    if (items.length === 0) {
      alert('Tambahkan minimal 1 item pesanan');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('id_user', selectedUser);
      formData.append('jenis_order', jenisOrder);
      formData.append('kecepatan_pengerjaan', kecepatanPengerjaan);
      formData.append('subtotal', calculateSubtotal().toString());
      formData.append('diskon', diskon.toString());
      formData.append('ongkir', ongkir.toString());
      formData.append('total_harga', calculateTotal().toString());
      formData.append('catatan_pelanggan', catatanPelanggan);

      const response = await axios.post(
        `${API_BASE_URL}/orders.php?op=create`,
        formData,
        {
          headers: { Accept: 'application/json' },
        },
      );

      if (response.data.status === 'success') {
        const orderId = response.data.data.id_order;

        // Create order items
        for (const item of items) {
          const itemFormData = new FormData();
          itemFormData.append('id_order', orderId);
          itemFormData.append('id_product', item.id_product);
          itemFormData.append('ukuran', item.ukuran);
          itemFormData.append('jumlah', item.jumlah.toString());
          itemFormData.append('harga_satuan', item.harga_satuan.toString());
          itemFormData.append('subtotal', item.subtotal.toString());
          itemFormData.append('keterangan', item.keterangan);

          await axios.post(
            `${API_BASE_URL}/order_items.php?op=create`,
            itemFormData,
            {
              headers: { Accept: 'application/json' },
            },
          );
        }

        alert('✅ Pesanan berhasil dibuat!');
        onClose(true);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      alert(
        '❌ Gagal membuat pesanan: ' +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div
        className="modal-content modal-large"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>🛒 Buat Pesanan Baru</h2>
          <button className="modal-close" onClick={() => onClose(false)}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Customer Selection */}
            <section className="detail-section">
              <h3>👤 Pilih Customer</h3>
              <div className="form-group">
                <label>Customer *</label>
                <select
                  className="form-control"
                  value={selectedUser}
                  onChange={e => setSelectedUser(e.target.value)}
                  required
                >
                  <option value="">-- Pilih Customer --</option>
                  {users.map(user => (
                    <option key={user.id_user} value={user.id_user}>
                      {user.nama} - {user.email}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            {/* Order Info */}
            <section className="detail-section">
              <h3>📋 Informasi Pesanan</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Jenis Order *</label>
                  <select
                    className="form-control"
                    value={jenisOrder}
                    onChange={e => setJenisOrder(e.target.value)}
                    required
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline/Walk-in</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Kecepatan Pengerjaan *</label>
                  <select
                    className="form-control"
                    value={kecepatanPengerjaan}
                    onChange={e => setKecepatanPengerjaan(e.target.value)}
                    required
                  >
                    <option value="normal">Normal (3-5 hari)</option>
                    <option value="cepat">Cepat (1-2 hari) +20%</option>
                    <option value="express">Express (same day) +50%</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Add Items */}
            <section className="detail-section">
              <h3>📦 Tambah Item Pesanan</h3>
              <div className="add-item-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Produk *</label>
                    <select
                      className="form-control"
                      value={currentProduct}
                      onChange={e => setCurrentProduct(e.target.value)}
                    >
                      <option value="">-- Pilih Produk --</option>
                      {products.map(product => (
                        <option
                          key={product.id_product}
                          value={product.id_product}
                        >
                          {product.nama_product} - {formatRupiah(product.harga)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Ukuran</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Misal: A4, A3, 10x15 cm"
                      value={currentUkuran}
                      onChange={e => setCurrentUkuran(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Jumlah *</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={currentJumlah}
                      onChange={e => setCurrentJumlah(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Keterangan</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Catatan khusus untuk item ini..."
                    value={currentKeterangan}
                    onChange={e => setCurrentKeterangan(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleAddItem}
                >
                  ➕ Tambah Item
                </button>
              </div>
            </section>

            {/* Items List */}
            {items.length > 0 && (
              <section className="detail-section">
                <h3>📋 Daftar Item ({items.length})</h3>
                <div className="items-table-wrapper">
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Produk</th>
                        <th>Ukuran</th>
                        <th>Jumlah</th>
                        <th>Harga Satuan</th>
                        <th>Subtotal</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <div className="item-name">{item.nama_product}</div>
                            {item.keterangan && (
                              <small className="item-note">
                                {item.keterangan}
                              </small>
                            )}
                          </td>
                          <td>{item.ukuran || '-'}</td>
                          <td className="text-center">{item.jumlah}</td>
                          <td className="text-right">
                            {formatRupiah(item.harga_satuan)}
                          </td>
                          <td className="text-right">
                            <strong>{formatRupiah(item.subtotal)}</strong>
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn-danger-small"
                              onClick={() => handleRemoveItem(index)}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Pricing */}
            <section className="detail-section">
              <h3>💰 Perhitungan Harga</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Diskon (Rp)</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    value={diskon}
                    onChange={e => setDiskon(Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>Ongkir (Rp)</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    value={ongkir}
                    onChange={e => setOngkir(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="price-summary">
                <div className="price-row">
                  <span>Subtotal:</span>
                  <span>{formatRupiah(calculateSubtotal())}</span>
                </div>
                <div className="price-row">
                  <span>Diskon:</span>
                  <span className="text-danger">- {formatRupiah(diskon)}</span>
                </div>
                <div className="price-row">
                  <span>Ongkir:</span>
                  <span>+ {formatRupiah(ongkir)}</span>
                </div>
                <div className="price-row price-total">
                  <span>TOTAL:</span>
                  <span>{formatRupiah(calculateTotal())}</span>
                </div>
              </div>
            </section>

            {/* Notes */}
            <section className="detail-section">
              <h3>📝 Catatan</h3>
              <div className="form-group">
                <label>Catatan Pelanggan</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Catatan khusus dari pelanggan..."
                  value={catatanPelanggan}
                  onChange={e => setCatatanPelanggan(e.target.value)}
                />
              </div>
            </section>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => onClose(false)}
              disabled={submitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-success"
              disabled={submitting || items.length === 0}
            >
              {submitting ? '⏳ Menyimpan...' : '✅ Buat Pesanan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
