import React from 'react';

const FinanceReport: React.FC = () => {
  return (
    <div className="finance-report">
      <div className="coming-soon">
        <div className="coming-soon-icon">💵</div>
        <h2>Laporan Keuangan</h2>
        <p>Fitur ini sedang dalam pengembangan</p>
        <ul className="feature-list">
          <li>✓ Pemasukan & Pengeluaran</li>
          <li>✓ Profit & Loss Statement</li>
          <li>✓ Cash Flow</li>
          <li>✓ Export ke PDF/Excel</li>
        </ul>
      </div>
    </div>
  );
};

export default FinanceReport;
