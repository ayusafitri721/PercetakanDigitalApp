// PeriodFilter.tsx
import React from 'react';

interface PeriodFilterProps {
  filterPeriod: 'today' | 'week' | 'month';
  onFilterChange: (period: 'today' | 'week' | 'month') => void;
}

const PeriodFilter: React.FC<PeriodFilterProps> = ({
  filterPeriod,
  onFilterChange,
}) => {
  const periods = [
    { value: 'today', label: '📅 Hari Ini' },
    { value: 'week', label: '📊 Minggu Ini' },
    { value: 'month', label: '📈 Bulan Ini' },
  ] as const;

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {periods.map(period => (
        <button
          key={period.value}
          onClick={() => onFilterChange(period.value)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border:
              filterPeriod === period.value
                ? '2px solid #667eea'
                : '1px solid #ddd',
            background: filterPeriod === period.value ? '#667eea' : 'white',
            color: filterPeriod === period.value ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: filterPeriod === period.value ? '600' : '400',
            fontSize: '0.875rem',
          }}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};

export default PeriodFilter;
