// src/screens/customer/hooks/useOrderForm.ts
import { useState, useEffect } from 'react';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

export interface UploadedFile {
  uri: string;
  name: string;
  type: string;
  size: number;
}

export interface OrderDetails {
  material: string;
  size: string;
  quantity: number;
  speed: 'normal' | 'express';
  notes: string;
  deliveryMethod: 'cod' | 'transfer_delivery' | 'pickup';
  paymentMethod: 'transfer' | 'qris' | '';
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  city: string;
  province: string;
  shippingCost: number;
}

export function useOrderForm(service: any) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [paymentProof, setPaymentProof] = useState<UploadedFile | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    material: '',
    size: '',
    quantity: 1,
    speed: 'normal',
    notes: '',
    deliveryMethod: 'cod',
    paymentMethod: '',
    recipientName: '',
    recipientPhone: '',
    shippingAddress: '',
    city: '',
    province: '',
    shippingCost: 0,
  });
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users.php`);
      if (response.data.status === 'success') {
        const usersData = response.data.data?.users || response.data.data;
        if (Array.isArray(usersData) && usersData.length > 0) {
          const user =
            usersData.find((u: any) => u.role === 'customer') || usersData[0];
          setCurrentUser(user);
          setOrderDetails(prev => ({
            ...prev,
            recipientName: user.nama || '',
            recipientPhone: user.no_telepon || '',
          }));
        }
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch user:', error.message);
      Alert.alert('Error', 'Gagal memuat data user.');
    } finally {
      setLoadingUser(false);
    }
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 33) return true;
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true;
  };

  const handlePickImage = async (type: 'design' | 'payment') => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Izin Ditolak', 'Aplikasi membutuhkan izin akses galeri.');
        return;
      }

      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.didCancel || result.errorCode) return;

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const maxSize = 10 * 1024 * 1024;

        if (asset.fileSize && asset.fileSize > maxSize) {
          Alert.alert('Error', 'Ukuran file maksimal 10MB!');
          return;
        }

        const fileData = {
          uri: asset.uri || '',
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize || 0,
        };

        if (type === 'design') {
          setUploadedFile(fileData);
        } else {
          setPaymentProof(fileData);
        }

        Alert.alert('Berhasil', 'Gambar berhasil dipilih!');
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memilih gambar');
    }
  };

  const calculatePrice = (): number => {
    if (!service || !orderDetails.material || !orderDetails.size) return 0;
    let total = parseInt(service.harga_dasar) * orderDetails.quantity;
    if (orderDetails.speed === 'express') total *= 1.5;
    return Math.round(total);
  };

  const calculateTotal = (): number => {
    return calculatePrice() + orderDetails.shippingCost;
  };

  const updateDetails = (updates: Partial<OrderDetails>) => {
    setOrderDetails(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setUploadedFile(null);
    setPaymentProof(null);
    setOrderDetails({
      material: '',
      size: '',
      quantity: 1,
      speed: 'normal',
      notes: '',
      deliveryMethod: 'cod',
      paymentMethod: '',
      recipientName: currentUser?.nama || '',
      recipientPhone: currentUser?.no_telepon || '',
      shippingAddress: '',
      city: '',
      province: '',
      shippingCost: 0,
    });
    setCurrentStep(1);
  };

  return {
    uploadedFile,
    setUploadedFile,
    paymentProof,
    setPaymentProof,
    orderDetails,
    updateDetails,
    loading,
    setLoading,
    currentUser,
    loadingUser,
    currentStep,
    setCurrentStep,
    handlePickImage,
    calculatePrice,
    calculateTotal,
    resetForm,
  };
}