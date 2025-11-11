// components/kasir/StatsCards.tsx
import React from 'react';

interface Stats {
  todayOrders: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  pendingPayment: number;
  completedToday: number;
}

interface StatsCardsProps {
  stats: Stats;
  formatRupiah: (amount: number) => string;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, formatRupiah }) => {
  return (
    <div className="kasir-stats">
      {/* Pesanan Hari Ini */}
      <div className="stat-card">
        <div className="stat-icon" style={{ background: '#667eea' }}>
          📋
        </div>
        <div className="stat-info">
          <h3>Pesanan Hari Ini</h3>
          <p className="stat-number">{stats.todayOrders}</p>
        </div>
      </div>

      {/* Pendapatan */}
      <div className="stat-card">
        <div className="stat-icon" style={{ background: '#43e97b' }}>
          💰
        </div>
        <div className="stat-info">
          <h3>Pendapatan Hari Ini</h3>
          <p className="stat-number">{formatRupiah(stats.todayRevenue)}</p>
          <small
            style={{
              fontSize: '0.75rem',
              color: '#718096',
              marginTop: '0.25rem',
              display: 'block',
            }}
          >
            Minggu: {formatRupiah(stats.weekRevenue)} • Bulan:{' '}
            {formatRupiah(stats.monthRevenue)}
          </small>
        </div>
      </div>

      {/* Pending Payment */}
      <div className="stat-card">
        <div className="stat-icon" style={{ background: '#fa709a' }}>
          ⏳
        </div>
        <div className="stat-info">
          <h3>Menunggu Pembayaran</h3>
          <p className="stat-number">{stats.pendingPayment}</p>
        </div>
      </div>

      {/* Selesai Hari Ini */}
      <div className="stat-card">
        <div className="stat-icon" style={{ background: '#28a745' }}>
          ✅
        </div>
        <div className="stat-info">
          <h3>Selesai Hari Ini</h3>
          <p className="stat-number">{stats.completedToday}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
