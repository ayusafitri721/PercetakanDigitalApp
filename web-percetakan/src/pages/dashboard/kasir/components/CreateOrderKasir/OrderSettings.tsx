// OrderSettings.tsx - Komponen Pengaturan Order (Kecepatan & Diskon)

import React from 'react';
import type { OrderSettings as OrderSettingsType } from './types'; 

interface OrderSettingsProps {
  orderSettings: OrderSettingsType;
  setOrderSettings: React.Dispatch<React.SetStateAction<OrderSettingsType>>;
}

const OrderSettings: React.FC<OrderSettingsProps> = ({
  orderSettings,
  setOrderSettings,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginBottom: '1rem',
      }}
    >
      <div>
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '500',
          }}
        >
          Kecepatan Pengerjaan
        </label>
        <select
          value={orderSettings.kecepatan_pengerjaan}
          onChange={e =>
            setOrderSettings({
              ...orderSettings,
              kecepatan_pengerjaan: e.target.value as 'normal' | 'express',
            })
          }
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '6px',
            border: '1px solid #ddd',
          }}
        >
          <option value="normal">⏱️ Normal (Standar)</option>
          <option value="express">⚡ Express (+50% harga)</option>
        </select>
      </div>

      <div>
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '500',
          }}
        >
          Diskon (Rp)
        </label>
        <input
          type="number"
          value={orderSettings.diskon}
          onChange={e =>
            setOrderSettings({
              ...orderSettings,
              diskon: parseFloat(e.target.value) || 0,
            })
          }
          min="0"
          placeholder="0"
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '6px',
            border: '1px solid #ddd',
          }}
        />
      </div>
    </div>
  );
};

export default OrderSettings;
