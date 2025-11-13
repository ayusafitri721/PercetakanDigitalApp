// PeriodFilter.tsx
import React from 'react';
import { Calendar, TrendingUp, BarChart3 } from 'lucide-react';

interface PeriodFilterProps {
  filterPeriod: 'today' | 'week' | 'month';
  onFilterChange: (period: 'today' | 'week' | 'month') => void;
}

const PeriodFilter: React.FC<PeriodFilterProps> = ({
  filterPeriod,
  onFilterChange,
}) => {
  const periods = [
    { value: 'today', label: 'Hari Ini', Icon: Calendar },
    { value: 'week', label: 'Minggu Ini', Icon: TrendingUp },
    { value: 'month', label: 'Bulan Ini', Icon: BarChart3 },
  ] as const;

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {periods.map(period => {
        const IconComponent = period.Icon;
        const isActive = filterPeriod === period.value;

        return (
          <button
            key={period.value}
            onClick={() => onFilterChange(period.value)}
            style={{
              padding: '0.625rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: isActive
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : '#f7fafc',
              color: isActive ? 'white' : '#4a5568',
              cursor: 'pointer',
              fontWeight: isActive ? '600' : '500',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              boxShadow: isActive
                ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                : '0 1px 3px rgba(0,0,0,0.08)',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.background = '#edf2f7';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.background = '#f7fafc';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
              }
            }}
          >
            <IconComponent size={16} strokeWidth={2.5} />
            <span>{period.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default PeriodFilter;
