// components/kasir/StatsCards.tsx - ENHANCED VERSION
import React from 'react';
import { ShoppingBag, DollarSign, Clock, CheckCircle } from 'lucide-react';

interface Stats {
  todayOrders: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  pendingPayment: number;
  pendingPaymentAmount: number; 
  completedToday: number;
  completedTodayRevenue: number; 
}

interface StatsCardsProps {
  stats: Stats;
  formatRupiah: (amount: number) => string;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, formatRupiah }) => {
  const statsData = [
    {
      title: 'PESANAN HARI INI',
      value: stats.todayOrders.toString(),
      icon: ShoppingBag,
      gradient: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
      subtitle: null,
    },
    {
      title: 'PENDAPATAN HARI INI',
      value: formatRupiah(stats.todayRevenue),
      icon: DollarSign,
      gradient: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
      subtitle: `Minggu: ${formatRupiah(
        stats.weekRevenue,
      )} • Bulan: ${formatRupiah(stats.monthRevenue)}`,
    },
    {
      title: 'MENUNGGU PEMBAYARAN',
      value: stats.pendingPayment.toString(),
      icon: Clock,
      gradient: 'linear-gradient(135deg, #ed64a6 0%, #d53f8c 100%)',
      subtitle: `Total: ${formatRupiah(stats.pendingPaymentAmount)}`, // ✅ Tampilkan nominal
    },
    {
      title: 'SELESAI HARI INI',
      value: stats.completedToday.toString(),
      icon: CheckCircle,
      gradient: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)',
      subtitle: `Pendapatan: ${formatRupiah(stats.completedTodayRevenue)}`, // ✅ Tampilkan revenue
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '30px',
      }}
    >
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon;

        return (
          <div
            key={index}
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow =
                '0 8px 20px rgba(0, 0, 0, 0.12)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow =
                '0 4px 12px rgba(0, 0, 0, 0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: stat.gradient,
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                <IconComponent size={28} strokeWidth={2.5} />
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '12px',
                  color: '#718096',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {stat.title}
              </h3>
            </div>

            {/* Number */}
            <div
              style={{
                margin: '8px 0 0 0',
                fontSize: '36px',
                fontWeight: 700,
                color: '#1a202c',
                lineHeight: 1,
              }}
            >
              {stat.value}
            </div>

            {/* Subtitle */}
            {stat.subtitle && (
              <div
                style={{
                  margin: '12px 0 0 0',
                  fontSize: '13px',
                  color: '#a0aec0',
                  fontWeight: 500,
                }}
              >
                {stat.subtitle}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
