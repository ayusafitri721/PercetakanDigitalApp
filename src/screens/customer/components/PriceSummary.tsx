// src/screens/customer/components/PriceSummary.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PriceSummaryProps {
  subtotal: number;
  shippingCost: number;
  total: number;
  color: string;
}

export default function PriceSummary({
  subtotal,
  shippingCost,
  total,
  color,
}: PriceSummaryProps) {
  if (subtotal === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      <View style={styles.row}>
        <Text style={styles.label}>Subtotal:</Text>
        <Text style={styles.value}>Rp {subtotal.toLocaleString('id-ID')}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Ongkir:</Text>
        <Text style={styles.value}>
          Rp {shippingCost.toLocaleString('id-ID')}
        </Text>
      </View>
      <View style={[styles.row, styles.rowTotal]}>
        <Text style={styles.labelTotal}>Total:</Text>
        <Text style={styles.valueTotal}>
          Rp {total.toLocaleString('id-ID')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rowTotal: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  label: { fontSize: 14, fontWeight: '500', color: '#FFF', opacity: 0.9 },
  value: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  labelTotal: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  valueTotal: { fontSize: 22, fontWeight: '700', color: '#FFF' },
});
