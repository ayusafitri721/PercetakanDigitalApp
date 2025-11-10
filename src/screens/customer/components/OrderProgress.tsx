// src/screens/customer/components/OrderProgress.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface OrderProgressProps {
  currentStep: number;
}

export default function OrderProgress({ currentStep }: OrderProgressProps) {
  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.step, currentStep >= 1 && styles.stepActive]}>
          <Text
            style={[styles.stepText, currentStep >= 1 && styles.stepTextActive]}
          >
            1
          </Text>
        </View>
        <View style={[styles.line, currentStep >= 2 && styles.lineActive]} />
        <View style={[styles.step, currentStep >= 2 && styles.stepActive]}>
          <Text
            style={[styles.stepText, currentStep >= 2 && styles.stepTextActive]}
          >
            2
          </Text>
        </View>
        <View style={[styles.line, currentStep >= 3 && styles.lineActive]} />
        <View style={[styles.step, currentStep >= 3 && styles.stepActive]}>
          <Text
            style={[styles.stepText, currentStep >= 3 && styles.stepTextActive]}
          >
            3
          </Text>
        </View>
      </View>
      <View style={styles.labels}>
        <Text style={styles.label}>Detail</Text>
        <Text style={styles.label}>Pengiriman</Text>
        <Text style={styles.label}>Bayar</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  step: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActive: { backgroundColor: '#4F46E5' },
  stepText: { fontSize: 14, fontWeight: '700', color: '#9CA3AF' },
  stepTextActive: { color: '#FFF' },
  line: {
    width: 60,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  lineActive: { backgroundColor: '#4F46E5' },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
});
