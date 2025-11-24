// src/pages/dashboard/kasir/components/RevenueSection.tsx
import React from 'react';
import { TrendingUp, PieChart as PieChartIcon, DollarSign } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface RevenueData {
  total_pemasukan: number;
  total_pending: number;
  total_cash: number;
  total_transfer: number;
  total_qris: number;
  paid_transactions: number;
  pending_transactions: number;
}

interface RevenueSectionProps {
  revenueData: RevenueData;
  formatRupiah: (amount: number) => string;
}

const RevenueSection: React.FC<RevenueSectionProps> = ({
  revenueData,
  formatRupiah,
}) => {
  // Data untuk Bar Chart (Status Pendapatan)
  const revenueChartData = [
    {
      name: 'Lunas',
      amount: revenueData.total_pemasukan,
      fill: '#4CAF50',
    },
    {
      name: 'Pending',
      amount: revenueData.total_pending,
      fill: '#FFA726',
    },
  ];

  // Data untuk Pie Chart (Metode Pembayaran)
  const paymentMethodData = [
    { name: 'Cash', value: revenueData.total_cash, color: '#66BB6A' },
    { name: 'Transfer', value: revenueData.total_transfer, color: '#42A5F5' },
    { name: 'QRIS', value: revenueData.total_qris, color: '#AB47BC' },
  ].filter(item => item.value > 0);

  return (
    <>
      {/* Charts Section: Bar Chart & Pie Chart */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
          gap: '20px',
          marginBottom: '26px',
        }}
      >
        {/* Bar Chart - Status Pendapatan */}
        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid #e8ecef',
          }}
        >
          <h3
            style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <TrendingUp size={20} /> Status Pendapatan Hari Ini
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={value => `${(value / 1000000).toFixed(1)}jt`}
              />
              <Tooltip
                formatter={(value: number) => formatRupiah(value)}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-around',
              fontSize: '13px',
            }}
          >
            <div>
              <span style={{ color: '#6b7280' }}>Lunas: </span>
              <strong style={{ color: '#4CAF50' }}>
                {revenueData.paid_transactions}
              </strong>
            </div>
            <div>
              <span style={{ color: '#6b7280' }}>Pending: </span>
              <strong style={{ color: '#FFA726' }}>
                {revenueData.pending_transactions}
              </strong>
            </div>
          </div>
        </div>

        {/* Pie Chart - Metode Pembayaran */}
        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid #e8ecef',
          }}
        >
          <h3
            style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <PieChartIcon size={20} /> Metode Pembayaran
          </h3>
          {paymentMethodData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatRupiah(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{
                  marginTop: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {paymentMethodData.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '6px',
                      fontSize: '13px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '3px',
                          backgroundColor: item.color,
                        }}
                      ></div>
                      <span style={{ color: '#6b7280' }}>{item.name}</span>
                    </div>
                    <strong style={{ color: '#1f2937' }}>
                      {formatRupiah(item.value)}
                    </strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '300px',
                color: '#9ca3af',
                fontSize: '14px',
              }}
            >
              Belum ada data pembayaran hari ini
            </div>
          )}
        </div>
      </div>

      {/* Ringkasan Keuangan - Bottom Summary Card */}
      <div
        style={{
          background: 'white',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #e8ecef',
          marginBottom: '26px',
        }}
      >
        <h3
          style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <DollarSign size={20} /> Ringkasan Keuangan
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              window.innerWidth > 768 ? 'repeat(3, 1fr)' : '1fr',
            gap: '16px',
          }}
        >
          <div
            style={{
              padding: '16px',
              backgroundColor: '#e0f2fe',
              borderRadius: '10px',
              border: '1px solid #7dd3fc',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                color: '#075985',
                marginBottom: '8px',
              }}
            >
              Total Pemasukan (Lunas)
            </div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 'bold',
                color: '#0369a1',
              }}
            >
              {formatRupiah(revenueData.total_pemasukan)}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: '#0c4a6e',
                marginTop: '4px',
              }}
            >
              {revenueData.paid_transactions} transaksi
            </div>
          </div>

          <div
            style={{
              padding: '16px',
              backgroundColor: '#dbeafe',
              borderRadius: '10px',
              border: '1px solid #93c5fd',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                color: '#1e3a8a',
                marginBottom: '8px',
              }}
            >
              Pending Payment
            </div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 'bold',
                color: '#1e40af',
              }}
            >
              {formatRupiah(revenueData.total_pending)}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: '#1e40af',
                marginTop: '4px',
              }}
            >
              {revenueData.pending_transactions} transaksi
            </div>
          </div>

          <div
            style={{
              padding: '16px',
              backgroundColor: '#1e40af',
              borderRadius: '10px',
              border: '1px solid #1e3a8a',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                color: '#e0f2fe',
                marginBottom: '8px',
              }}
            >
              Total Potensi
            </div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 'bold',
                color: '#ffffff',
              }}
            >
              {formatRupiah(
                revenueData.total_pemasukan + revenueData.total_pending,
              )}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: '#bfdbfe',
                marginTop: '4px',
              }}
            >
              Lunas + Pending
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RevenueSection;
