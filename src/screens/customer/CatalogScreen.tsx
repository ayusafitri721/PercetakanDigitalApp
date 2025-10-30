// screens/customer/CatalogScreen.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

interface CatalogScreenProps {
  onBack: () => void;
  onSelectService: (service: Service) => void;
}

interface Service {
  id: number;
  icon: string;
  name: string;
  description: string;
  price: string;
  color: string;
  category: string;
}

const SERVICES: Service[] = [
  {
    id: 1,
    icon: '📄',
    name: 'Cetak Dokumen',
    description: 'Kertas A4, F4, Legal',
    price: 'Mulai dari Rp 500',
    color: '#4F46E5',
    category: 'document',
  },
  {
    id: 2,
    icon: '🎴',
    name: 'Cetak Banner',
    description: 'MMT, Flexi, Vinyl',
    price: 'Mulai dari Rp 25.000/m²',
    color: '#10B981',
    category: 'banner',
  },
  {
    id: 3,
    icon: '👕',
    name: 'Sablon Kaos',
    description: 'DTF, Rubber, Plastisol',
    price: 'Mulai dari Rp 15.000',
    color: '#F59E0B',
    category: 'textile',
  },
  {
    id: 4,
    icon: '🖼️',
    name: 'Cetak Stiker',
    description: 'Vinyl, Chromo, Transparan',
    price: 'Mulai dari Rp 10.000',
    color: '#EF4444',
    category: 'sticker',
  },
  {
    id: 5,
    icon: '🎁',
    name: 'Cetak Packaging',
    description: 'Dus, Paper Bag, Label',
    price: 'Mulai dari Rp 5.000',
    color: '#8B5CF6',
    category: 'packaging',
  },
  {
    id: 6,
    icon: '📸',
    name: 'Cetak Foto',
    description: '4R, 5R, A4, Canvas',
    price: 'Mulai dari Rp 2.000',
    color: '#EC4899',
    category: 'photo',
  },
];

export default function CatalogScreen({
  onBack,
  onSelectService,
}: CatalogScreenProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Katalog Layanan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Pilih jenis layanan cetak yang Anda butuhkan
        </Text>

        {SERVICES.map(service => (
          <ServiceCard
            key={service.id}
            service={service}
            onPress={() => onSelectService(service)}
          />
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

// Service Card Component
function ServiceCard({
  service,
  onPress,
}: {
  service: Service;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.serviceCard}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: service.color + '20' },
        ]}
      >
        <Text style={styles.icon}>{service.icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{service.name}</Text>
        <Text style={styles.description}>{service.description}</Text>
        <Text style={[styles.price, { color: service.color }]}>
          {service.price}
        </Text>
      </View>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#1F2937',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 16,
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 24,
    color: '#9CA3AF',
    marginLeft: 8,
  },
});
