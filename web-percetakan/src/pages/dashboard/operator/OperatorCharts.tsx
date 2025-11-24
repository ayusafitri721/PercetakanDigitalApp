// OperatorCharts.tsx - Statistics Charts Component (Blue Theme)
import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Package } from 'lucide-react';

interface ChartData {
  totalRevenue: number;
  onlineRevenue: number;
  offlineRevenue: number;
  onlineOrders: number;
  offlineOrders: number;
  expressOrders: number;
  normalOrders: number;
  dailyRevenue: { date: string; revenue: number }[];
}

interface OperatorChartsProps {
  completedOrders: any[];
  formatRupiah: (amount: number) => string;
}

const OperatorCharts: React.FC<OperatorChartsProps> = ({
  completedOrders,
  formatRupiah,
}) => {
  const [chartData, setChartData] = useState<ChartData>({
    totalRevenue: 0,
    onlineRevenue: 0,
    offlineRevenue: 0,
    onlineOrders: 0,
    offlineOrders: 0,
    expressOrders: 0,
    normalOrders: 0,
    dailyRevenue: [],
  });

  useEffect(() => {
    calculateChartData();
  }, [completedOrders]);

  const calculateChartData = () => {
    const onlineOrders = completedOrders.filter(
      o => o.jenis_order === 'online',
    );
    const offlineOrders = completedOrders.filter(
      o => o.jenis_order === 'offline',
    );

    const onlineRevenue = onlineOrders.reduce(
      (sum, o) => sum + (o.total_harga || 0),
      0,
    );
    const offlineRevenue = offlineOrders.reduce(
      (sum, o) => sum + (o.total_harga || 0),
      0,
    );
    const totalRevenue = onlineRevenue + offlineRevenue;

    const expressOrders = completedOrders.filter(
      o => o.kecepatan_pengerjaan === 'express',
    ).length;
    const normalOrders = completedOrders.filter(
      o => o.kecepatan_pengerjaan === 'normal',
    ).length;

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const dailyRevenue = last7Days.map(date => {
      const dayOrders = completedOrders.filter(o =>
        o.tanggal_order.startsWith(date),
      );
      const revenue = dayOrders.reduce(
        (sum, o) => sum + (o.total_harga || 0),
        0,
      );
      return { date, revenue };
    });

    setChartData({
      totalRevenue,
      onlineRevenue,
      offlineRevenue,
      onlineOrders: onlineOrders.length,
      offlineOrders: offlineOrders.length,
      expressOrders,
      normalOrders,
      dailyRevenue,
    });
  };

  const maxDailyRevenue = Math.max(
    ...chartData.dailyRevenue.map(d => d.revenue),
    1,
  );

  return (
    <div style={{ margin: '2rem 2.5rem' }}>
      {/* Summary Cards - Blue Theme */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Total Revenue */}
        <div
          style={{
            background: 'linear-gradient(135deg, #364a7c 0%, #2d3e66 100%)',
            padding: '1.75rem',
            borderRadius: '14px',
            color: 'white',
            boxShadow: '0 4px 16px rgba(54, 74, 124, 0.3)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DollarSign size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                Total Revenue
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>
                {formatRupiah(chartData.totalRevenue)}
              </div>
            </div>
          </div>
        </div>

        {/* Online Orders */}
        <div
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            padding: '1.75rem',
            borderRadius: '14px',
            color: 'white',
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}
            >
              🌐
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                Online Orders
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>
                {chartData.onlineOrders}
              </div>
            </div>
          </div>
        </div>

        {/* Offline Orders */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            padding: '1.75rem',
            borderRadius: '14px',
            color: 'white',
            boxShadow: '0 4px 16px rgba(14, 165, 233, 0.3)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}
            >
              🏪
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                Offline Orders
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>
                {chartData.offlineOrders}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Revenue by Order Type - Bar Chart */}
        <div
          style={{
            background: 'white',
            padding: '1.75rem',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}
          >
            <BarChart3 size={20} color="#364a7c" />
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700' }}>
              Revenue by Order Type
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            {/* Online Bar */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                }}
              >
                <div
                  style={{
                    background:
                      'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)',
                    height: `${
                      chartData.totalRevenue > 0
                        ? (chartData.onlineRevenue / chartData.totalRevenue) *
                          100
                        : 0
                    }%`,
                    borderRadius: '8px 8px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '0.875rem',
                    minHeight: '40px',
                  }}
                >
                  {chartData.totalRevenue > 0 &&
                    chartData.onlineRevenue > 0 &&
                    Math.round(
                      (chartData.onlineRevenue / chartData.totalRevenue) * 100,
                    ) + '%'}
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                <div
                  style={{
                    fontSize: '0.875rem',
                    color: '#64748b',
                    marginBottom: '0.25rem',
                  }}
                >
                  🌐 Online
                </div>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#0f172a',
                  }}
                >
                  {formatRupiah(chartData.onlineRevenue)}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    marginTop: '0.25rem',
                  }}
                >
                  {chartData.onlineOrders} orders
                </div>
              </div>
            </div>

            {/* Offline Bar */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                }}
              >
                <div
                  style={{
                    background:
                      'linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)',
                    height: `${
                      chartData.totalRevenue > 0
                        ? (chartData.offlineRevenue / chartData.totalRevenue) *
                          100
                        : 0
                    }%`,
                    borderRadius: '8px 8px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '0.875rem',
                    minHeight: '40px',
                  }}
                >
                  {chartData.totalRevenue > 0 &&
                    chartData.offlineRevenue > 0 &&
                    Math.round(
                      (chartData.offlineRevenue / chartData.totalRevenue) * 100,
                    ) + '%'}
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                <div
                  style={{
                    fontSize: '0.875rem',
                    color: '#64748b',
                    marginBottom: '0.25rem',
                  }}
                >
                  🏪 Offline
                </div>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#0f172a',
                  }}
                >
                  {formatRupiah(chartData.offlineRevenue)}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    marginTop: '0.25rem',
                  }}
                >
                  {chartData.offlineOrders} orders
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders by Speed - Donut Chart */}
        <div
          style={{
            background: 'white',
            padding: '1.75rem',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}
          >
            <TrendingUp size={20} color="#364a7c" />
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700' }}>
              Orders by Speed
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {/* Donut Chart */}
            <div
              style={{ position: 'relative', width: '160px', height: '160px' }}
            >
              <svg width="160" height="160" viewBox="0 0 160 160">
                {/* Background circle */}
                <circle cx="80" cy="80" r="70" fill="#f1f5f9" />

                {/* Express slice */}
                {chartData.expressOrders > 0 && (
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="transparent"
                    stroke="#dc2626"
                    strokeWidth="40"
                    strokeDasharray={`${
                      (chartData.expressOrders /
                        (chartData.expressOrders + chartData.normalOrders)) *
                      439.6
                    } 439.6`}
                    transform="rotate(-90 80 80)"
                  />
                )}

                {/* Normal slice */}
                {chartData.normalOrders > 0 && (
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="transparent"
                    stroke="#3b82f6"
                    strokeWidth="40"
                    strokeDasharray={`${
                      (chartData.normalOrders /
                        (chartData.expressOrders + chartData.normalOrders)) *
                      439.6
                    } 439.6`}
                    strokeDashoffset={`-${
                      (chartData.expressOrders /
                        (chartData.expressOrders + chartData.normalOrders)) *
                      439.6
                    }`}
                    transform="rotate(-90 80 80)"
                  />
                )}

                {/* Center circle */}
                <circle cx="80" cy="80" r="45" fill="white" />

                {/* Center text */}
                <text
                  x="80"
                  y="75"
                  textAnchor="middle"
                  fontSize="12"
                  fill="#64748b"
                  fontWeight="500"
                >
                  Total
                </text>
                <text
                  x="80"
                  y="95"
                  textAnchor="middle"
                  fontSize="24"
                  fill="#0f172a"
                  fontWeight="700"
                >
                  {chartData.expressOrders + chartData.normalOrders}
                </text>
              </svg>
            </div>

            {/* Legend */}
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      background: '#dc2626',
                      borderRadius: '4px',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.875rem',
                      color: '#64748b',
                      fontWeight: '500',
                    }}
                  >
                    ⚡ Express
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#0f172a',
                    marginLeft: '1.5rem',
                  }}
                >
                  {chartData.expressOrders}
                  <span
                    style={{
                      fontSize: '0.875rem',
                      color: '#94a3b8',
                      fontWeight: '500',
                      marginLeft: '0.5rem',
                    }}
                  >
                    (
                    {Math.round(
                      (chartData.expressOrders /
                        (chartData.expressOrders + chartData.normalOrders ||
                          1)) *
                        100,
                    )}
                    %)
                  </span>
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      background: '#3b82f6',
                      borderRadius: '4px',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.875rem',
                      color: '#64748b',
                      fontWeight: '500',
                    }}
                  >
                    🕐 Normal
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#0f172a',
                    marginLeft: '1.5rem',
                  }}
                >
                  {chartData.normalOrders}
                  <span
                    style={{
                      fontSize: '0.875rem',
                      color: '#94a3b8',
                      fontWeight: '500',
                      marginLeft: '0.5rem',
                    }}
                  >
                    (
                    {Math.round(
                      (chartData.normalOrders /
                        (chartData.expressOrders + chartData.normalOrders ||
                          1)) *
                        100,
                    )}
                    %)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Revenue Trend */}
        <div
          style={{
            background: 'white',
            padding: '1.75rem',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            gridColumn: 'span 2',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}
          >
            <Package size={20} color="#364a7c" />
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700' }}>
              Revenue Trend (Last 7 Days)
            </h3>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '0.75rem',
              height: '200px',
            }}
          >
            {chartData.dailyRevenue.map((day, index) => {
              const handleMouseEnter = (
                e: React.MouseEvent<HTMLDivElement>,
              ) => {
                e.currentTarget.style.opacity = '0.8';
              };
              const handleMouseLeave = (
                e: React.MouseEvent<HTMLDivElement>,
              ) => {
                e.currentTarget.style.opacity = '1';
              };

              return (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#64748b',
                      fontWeight: '600',
                      textAlign: 'center',
                    }}
                  >
                    {day.revenue > 0 &&
                      formatRupiah(day.revenue).replace('Rp', '').trim()}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      background:
                        'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)',
                      borderRadius: '8px 8px 0 0',
                      height: `${
                        maxDailyRevenue > 0
                          ? (day.revenue / maxDailyRevenue) * 100
                          : 0
                      }%`,
                      minHeight: day.revenue > 0 ? '30px' : '0',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                    title={`${new Date(day.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    })}: ${formatRupiah(day.revenue)}`}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  />
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#94a3b8',
                      fontWeight: '500',
                    }}
                  >
                    {new Date(day.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorCharts;
