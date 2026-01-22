import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { API_BASE_URL } from '../../config';

interface Transaction {
  id_order: string;
  kode_order: string;
  tanggal_order: string;
  nama_customer: string;
  email_customer: string;
  total_harga: number;
  status_order: string;
  jenis_order: string;
  metode_pembayaran: string;
  status_pembayaran: string;
  jumlah_bayar: number;
  tanggal_bayar: string;
  id_kasir?: string;
  nama_kasir?: string;
  jumlah_item: number;
}

interface FinanceStats {
  total_pemasukan: number;
  total_cash: number;
  total_transfer: number;
  total_qris: number;
  total_pending: number;
  paid_transactions: number;
  pending_transactions: number;
  avg_transaction: number;
}

const FinanceReport: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      console.log('=== FETCHING REAL FINANCE DATA ===');

      // 1. Fetch ALL Orders
      const ordersRes = await axios.get(`${API_BASE_URL}/orders.php`, {
        params: { _t: Date.now() },
      });

      let ordersData = [];
      if (ordersRes.data.status === 'success') {
        ordersData = ordersRes.data.data?.orders || [];
      }

      console.log('📦 Orders fetched:', ordersData.length);

      // 2. Fetch ALL Payments
      const paymentsRes = await axios.get(`${API_BASE_URL}/payments.php`, {
        params: { _t: Date.now() },
      });

      let paymentsData = [];
      if (paymentsRes.data.status === 'success') {
        paymentsData = paymentsRes.data.data?.payments || [];
      }

      console.log('💳 Payments fetched:', paymentsData.length);

      // 3. GABUNGKAN Data Orders dengan Payments
      const enrichedTransactions: Transaction[] = ordersData.map(
        (order: any) => {
          // Cari payment untuk order ini
          const payment = paymentsData.find(
            (p: any) => p.id_order === order.id_order,
          );

          return {
            id_order: order.id_order,
            kode_order: order.kode_order,
            tanggal_order: order.tanggal_order,
            nama_customer: order.nama_customer || 'Guest',
            email_customer: order.email_customer || '-',
            total_harga: parseFloat(order.total_harga),
            status_order: order.status_order,
            jenis_order: order.jenis_order || 'online',
            // Data dari payments
            metode_pembayaran: payment?.metode_pembayaran || '-',
            status_pembayaran: payment?.status_pembayaran || 'pending',
            jumlah_bayar: payment ? parseFloat(payment.jumlah_bayar) : 0,
            tanggal_bayar: payment?.tanggal_bayar || '-',
            nama_kasir: order.nama_kasir || '-',
            jumlah_item: parseInt(order.jumlah_item || 0),
          };
        },
      );

      console.log('✅ Enriched transactions:', enrichedTransactions.length);

      // 4. Filter by date if needed
      let filteredTransactions = enrichedTransactions;
      if (dateRange.start || dateRange.end) {
        filteredTransactions = enrichedTransactions.filter(t => {
          const orderDate = new Date(t.tanggal_order);
          const startDate = dateRange.start ? new Date(dateRange.start) : null;
          const endDate = dateRange.end ? new Date(dateRange.end) : null;

          if (startDate && orderDate < startDate) return false;
          if (endDate && orderDate > endDate) return false;
          return true;
        });
      }

      setTransactions(filteredTransactions);

      // 5. Calculate Statistics
      calculateStats(filteredTransactions);

      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching finance data:', error);
      setLoading(false);
    }
  };

  const calculateStats = (txs: Transaction[]) => {
    // Filter PAID transactions (yang sudah bayar)
    const paidTxs = txs.filter(
      t =>
        t.status_pembayaran === 'diterima' ||
        t.status_order === 'dibayar' ||
        t.status_order === 'selesai',
    );

    // Filter PENDING transactions
    const pendingTxs = txs.filter(
      t =>
        t.status_pembayaran === 'pending' ||
        (t.status_order === 'pending' && !t.metode_pembayaran),
    );

    // Total Pemasukan (yang sudah bayar)
    const totalPemasukan = paidTxs.reduce(
      (sum, t) => sum + (t.jumlah_bayar || t.total_harga),
      0,
    );

    // Breakdown by payment method
    const totalCash = paidTxs
      .filter(t => t.metode_pembayaran === 'cash')
      .reduce((sum, t) => sum + (t.jumlah_bayar || t.total_harga), 0);

    const totalTransfer = paidTxs
      .filter(t => t.metode_pembayaran === 'transfer')
      .reduce((sum, t) => sum + (t.jumlah_bayar || t.total_harga), 0);

    const totalQris = paidTxs
      .filter(t => t.metode_pembayaran === 'qris')
      .reduce((sum, t) => sum + (t.jumlah_bayar || t.total_harga), 0);

    // Pending Revenue
    const totalPending = pendingTxs.reduce((sum, t) => sum + t.total_harga, 0);

    // Average
    const avgTransaction =
      paidTxs.length > 0 ? totalPemasukan / paidTxs.length : 0;

    setStats({
      total_pemasukan: totalPemasukan,
      total_cash: totalCash,
      total_transfer: totalTransfer,
      total_qris: totalQris,
      total_pending: totalPending,
      paid_transactions: paidTxs.length,
      pending_transactions: pendingTxs.length,
      avg_transaction: avgTransaction,
    });

    console.log('📊 Stats calculated:', {
      totalPemasukan,
      totalCash,
      totalTransfer,
      totalQris,
      totalPending,
      paid: paidTxs.length,
      pending: pendingTxs.length,
    });
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === '-') return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentMethodIcon = (method: string) => {
    const icons: Record<string, string> = {
      cash: '💵',
      transfer: '🏦',
      qris: '📱',
      ewallet: '💳',
      cod: '📦',
    };
    return icons[method.toLowerCase()] || '💰';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#FFA726',
      diproses: '#42A5F5',
      selesai: '#66BB6A',
      dibayar: '#66BB6A',
      diterima: '#66BB6A',
      dibatalkan: '#EF5350',
    };
    return colors[status.toLowerCase()] || '#9E9E9E';
  };

  const handleFilter = () => {
    fetchFinanceData();
  };

  const resetFilter = () => {
    setDateRange({ start: '', end: '' });
    setTimeout(() => fetchFinanceData(), 100);
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '50px',
          gap: '15px',
        }}
      >
        <div
          style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #4CAF50',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite',
          }}
        ></div>
        <p>Memuat data keuangan...</p>
      </div>
    );
  }

  const totalTx = transactions.length;
  const totalPotensi = stats ? stats.total_pemasukan + stats.total_pending : 0;

  return (
    <div className="finance-report" style={{ padding: '20px' }}>
      {/* Header Actions */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={fetchFinanceData}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4988C4',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          Refresh Data
        </button>
      </div>

      {/* Date Filters */}
      <div
        style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <label
            style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}
          >
            Dari Tanggal:
          </label>
          <input
            type="date"
            value={dateRange.start}
            onChange={e =>
              setDateRange({ ...dateRange, start: e.target.value })
            }
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
          />
        </div>
        <div>
          <label
            style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}
          >
            Sampai Tanggal:
          </label>
          <input
            type="date"
            value={dateRange.end}
            onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
          />
        </div>
        <button
          onClick={handleFilter}
          style={{
            padding: '8px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Filter
        </button>
        {(dateRange.start || dateRange.end) && (
          <button
            onClick={resetFilter}
            style={{
              padding: '8px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        )}
      </div>

      {/* Main Stats Grid */}
      {stats && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '30px',
            }}
          >
            {/* Total Pemasukan */}
            <div
              style={{
                padding: '25px',
                backgroundColor: '#fff',
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                borderLeft: '5px solid #4CAF50',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px',
                }}
              >
                {/* <span style={{ fontSize: '32px' }}>💰</span> */}
                <h3 style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  Total Pemasukan (Lunas)
                </h3>
              </div>
              <p
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#4CAF50',
                  margin: '10px 0',
                }}
              >
                {formatRupiah(stats.total_pemasukan)}
              </p>
              <small style={{ color: '#999' }}>
                {stats.paid_transactions} transaksi
              </small>
            </div>

            {/* Pending */}
            <div
              style={{
                padding: '25px',
                backgroundColor: '#fff',
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                borderLeft: '5px solid #FFA726',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px',
                }}
              >
                {/* <span style={{ fontSize: '32px' }}>⏳</span> */}
                <h3 style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  Pending Payment
                </h3>
              </div>
              <p
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#FFA726',
                  margin: '10px 0',
                }}
              >
                {formatRupiah(stats.total_pending)}
              </p>
              <small style={{ color: '#999' }}>
                {stats.pending_transactions} transaksi
              </small>
            </div>

            {/* Average */}
            <div
              style={{
                padding: '25px',
                backgroundColor: '#fff',
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                borderLeft: '5px solid #2196F3',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px',
                }}
              >
                {/* <span style={{ fontSize: '32px' }}>📊</span> */}
                <h3 style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  Rata-rata Transaksi
                </h3>
              </div>
              <p
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#2196F3',
                  margin: '10px 0',
                }}
              >
                {formatRupiah(stats.avg_transaction)}
              </p>
              <small style={{ color: '#999' }}>Per transaksi</small>
            </div>

            {/* Total Tx */}
            <div
              style={{
                padding: '25px',
                backgroundColor: '#fff',
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                borderLeft: '5px solid #9C27B0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px',
                }}
              >
                {/* <span style={{ fontSize: '32px' }}>📈</span> */}
                <h3 style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  Total Transaksi
                </h3>
              </div>
              <p
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#9C27B0',
                  margin: '10px 0',
                }}
              >
                {totalTx}
              </p>
              <small style={{ color: '#999' }}>Semua status</small>
            </div>
          </div>

          {/* Payment Methods Breakdown */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '30px',
            }}
          >
            <div
              style={{
                padding: '20px',
                backgroundColor: '#E8F5E9',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>💵</div>
              <div
                style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}
              >
                Cash
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#4CAF50',
                }}
              >
                {formatRupiah(stats.total_cash)}
              </div>
            </div>

            <div
              style={{
                padding: '20px',
                backgroundColor: '#E3F2FD',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🏦</div>
              <div
                style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}
              >
                Transfer
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#2196F3',
                }}
              >
                {formatRupiah(stats.total_transfer)}
              </div>
            </div>

            <div
              style={{
                padding: '20px',
                backgroundColor: '#F3E5F5',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📱</div>
              <div
                style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}
              >
                QRIS
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#9C27B0',
                }}
              >
                {formatRupiah(stats.total_qris)}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Summary */}
      {stats && (
        <div
          style={{
            padding: '25px',
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            marginBottom: '30px',
          }}
        >
          <h3 style={{ marginBottom: '20px', color: '#333' }}>
            💵 Ringkasan Keuangan
          </h3>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '5px',
              }}
            >
              <span style={{ fontWeight: '500' }}>
                Total Pemasukan (Lunas):
              </span>
              <span
                style={{
                  fontWeight: 'bold',
                  color: '#4CAF50',
                  fontSize: '18px',
                }}
              >
                {formatRupiah(stats.total_pemasukan)}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '5px',
              }}
            >
              <span style={{ fontWeight: '500' }}>Pending (Belum Bayar):</span>
              <span
                style={{
                  fontWeight: 'bold',
                  color: '#FFA726',
                  fontSize: '18px',
                }}
              >
                {formatRupiah(stats.total_pending)}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '20px',
                backgroundColor: '#2196F3',
                borderRadius: '5px',
                color: 'white',
              }}
            >
              <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
                Potensi Total:
              </span>
              <span style={{ fontWeight: 'bold', fontSize: '24px' }}>
                {formatRupiah(totalPotensi)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      {transactions.length > 0 && (
        <div
          style={{
            padding: '25px',
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ marginBottom: '20px', color: '#333' }}>
            📋 Riwayat Transaksi
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: '#f8f9fa',
                    borderBottom: '2px solid #ddd',
                  }}
                >
                  <th style={{ padding: '12px', textAlign: 'left' }}>
                    Kode Order
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>
                    Tanggal
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>
                    Customer
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>
                    Metode
                  </th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Total</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>
                    Status
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Kasir</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 20).map(tx => (
                  <tr
                    key={tx.id_order}
                    style={{ borderBottom: '1px solid #eee' }}
                  >
                    <td style={{ padding: '12px' }}>
                      <div>
                        <strong>{tx.kode_order}</strong>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {tx.jenis_order === 'offline'
                            ? '🏪 Offline'
                            : '🌐 Online'}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px' }}>
                      {formatDate(tx.tanggal_order)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div>
                        <strong>{tx.nama_customer}</strong>
                        {tx.email_customer !== '-' && (
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {tx.email_customer}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px' }}>
                        {getPaymentMethodIcon(tx.metode_pembayaran)}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#666',
                          textTransform: 'uppercase',
                        }}
                      >
                        {tx.metode_pembayaran}
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <strong style={{ fontSize: '15px' }}>
                        {formatRupiah(tx.jumlah_bayar || tx.total_harga)}
                      </strong>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span
                        style={{
                          padding: '5px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor:
                            getStatusColor(tx.status_pembayaran) + '20',
                          color: getStatusColor(tx.status_pembayaran),
                        }}
                      >
                        {tx.status_pembayaran}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px' }}>
                      {tx.nama_kasir || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {transactions.length > 20 && (
            <p
              style={{ textAlign: 'center', marginTop: '15px', color: '#666' }}
            >
              Menampilkan 20 dari {transactions.length} transaksi
            </p>
          )}
        </div>
      )}

      {transactions.length === 0 && (
        <div
          style={{
            padding: '50px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
          }}
        >
          <p style={{ fontSize: '18px', color: '#666' }}>
            Tidak ada data transaksi
          </p>
        </div>
      )}
    </div>
  );
};

export default FinanceReport;
