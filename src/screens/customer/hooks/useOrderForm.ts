// src/screens/customer/hooks/useOrderForm.ts
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';

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
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  city: string;
  province: string;
  shippingCost: number;
  paymentMethod: 'transfer' | 'qris' | '';
}

interface CurrentUser {
  id_user: string;
  nama: string;
  email: string;
  role: string;
  no_telepon?: string;
  alamat?: string;
  kota?: string;
  provinsi?: string;
}

const INITIAL_ORDER_DETAILS: OrderDetails = {
  material: '',
  size: '',
  quantity: 1,
  speed: 'normal',
  notes: '',
  deliveryMethod: 'cod',
  recipientName: '',
  recipientPhone: '',
  shippingAddress: '',
  city: '',
  province: '',
  shippingCost: 15000,
  paymentMethod: '',
};

export function useOrderForm(service: any) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [paymentProof, setPaymentProof] = useState<UploadedFile | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails>(INITIAL_ORDER_DETAILS);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    console.log('🔄 OrderForm mounted - Loading current user...');
    console.log('🔍 Current loadingUser state:', loadingUser);
    console.log('🔍 Current currentUser state:', currentUser);
    loadCurrentUser();
    
    return () => {
      console.log('🧹 OrderForm unmounted');
    };
  }, []);

  const loadCurrentUser = async () => {
    try {
      setLoadingUser(true);
      console.log('📱 Reading user data from AsyncStorage...');
      
      const keys = await AsyncStorage.getAllKeys();
      console.log('🔑 All AsyncStorage keys:', keys);
      
      let userDataString = await AsyncStorage.getItem('userData');
      let userData = null;

      if (userDataString) {
        console.log('✅ Found userData in AsyncStorage:', userDataString.substring(0, 100));
        userData = JSON.parse(userDataString);
        console.log('📦 Parsed userData:', JSON.stringify(userData, null, 2));
      } else {
        console.log('⚠️ userData not found, trying currentUser key...');
        userDataString = await AsyncStorage.getItem('currentUser');
        if (userDataString) {
          console.log('✅ Found currentUser in AsyncStorage:', userDataString.substring(0, 100));
          const user = JSON.parse(userDataString);
          userData = { user };
          console.log('📦 Wrapped user data:', JSON.stringify(userData, null, 2));
        } else {
          console.log('❌ currentUser also not found, trying @user key...');
          userDataString = await AsyncStorage.getItem('@user');
          if (userDataString) {
            console.log('✅ Found @user in AsyncStorage');
            const user = JSON.parse(userDataString);
            userData = { user };
          }
        }
      }

      if (!userData || !userData.user) {
        console.error('❌ No valid user data found in storage');
        console.error('❌ userData object:', userData);
        Alert.alert('Error', 'Session expired. Silakan login kembali.');
        setCurrentUser(null);
        setLoadingUser(false);
        return;
      }

      const user = userData.user;
      console.log('✅✅✅ CURRENT USER LOADED:', JSON.stringify(user, null, 2));

      setCurrentUser(user);
      
      setOrderDetails(prev => ({
        ...prev,
        recipientName: user.nama || '',
        recipientPhone: user.no_telepon || '',
        shippingAddress: user.alamat || '',
        city: user.kota || '',
        province: user.provinsi || '',
      }));
      console.log('📝 Auto-filled address from user profile:', {
        nama: user.nama,
        phone: user.no_telepon,
        alamat: user.alamat,
        kota: user.kota,
        provinsi: user.provinsi,
      });

    } catch (error) {
      console.error('❌ Error loading user:', error);
      Alert.alert('Error', 'Gagal memuat data user. Silakan login kembali.');
      setCurrentUser(null);
    } finally {
      setLoadingUser(false);
      console.log('✅ loadCurrentUser finished, loadingUser set to false');
    }
  };

  const updateCurrentUser = (updatedUserData: CurrentUser) => {
    try {
      console.log('🔄 Updating current user in state and storage...');
      
      setCurrentUser(updatedUserData);
      
      AsyncStorage.getItem('userData').then(userDataString => {
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          userData.user = updatedUserData;
          AsyncStorage.setItem('userData', JSON.stringify(userData));
          console.log('✅ User data updated in AsyncStorage');
        }
      });

      setOrderDetails(prev => ({
        ...prev,
        recipientName: updatedUserData.nama,
        recipientPhone: updatedUserData.no_telepon || '',
        shippingAddress: updatedUserData.alamat || '',
        city: updatedUserData.kota || '',
        province: updatedUserData.provinsi || '',
      }));

      console.log('✅ Order details updated with new address:', {
        kota: updatedUserData.kota,
        provinsi: updatedUserData.provinsi,
      });
    } catch (error) {
      console.error('❌ Error updating user:', error);
    }
  };

  const updateDetails = (details: Partial<OrderDetails>) => {
    setOrderDetails(prev => ({ ...prev, ...details }));
  };

  const handlePickImage = async (type: 'design' | 'payment') => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
      });

      if (result.didCancel) {
        console.log('User cancelled image picker');
        return;
      }

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to pick image');
        return;
      }

      const asset = result.assets?.[0];
      if (!asset || !asset.uri) {
        Alert.alert('Error', 'No image selected');
        return;
      }

      const file: UploadedFile = {
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        type: asset.type || 'image/jpeg',
        size: asset.fileSize || 0,
      };

      if (type === 'design') {
        setUploadedFile(file);
        console.log('✅ Design file uploaded:', file.name);
      } else {
        setPaymentProof(file);
        console.log('✅ Payment proof uploaded:', file.name);
      }
    } catch (error) {
      console.error('❌ Image picker error:', error);
      Alert.alert('Error', 'Gagal memilih gambar');
    }
  };

  const calculatePrice = (): number => {
    if (!service || !orderDetails.material || !orderDetails.size) {
      return 0;
    }

    const basePrice = parseFloat(service.harga_dasar) || 0;
    const quantity = orderDetails.quantity || 1;
    const speedMultiplier = orderDetails.speed === 'express' ? 1.5 : 1;

    return Math.round(basePrice * quantity * speedMultiplier);
  };

  const calculateTotal = (): number => {
    return calculatePrice() + orderDetails.shippingCost;
  };

  const resetForm = () => {
    console.log('🔄 Resetting order form...');
    setUploadedFile(null);
    setPaymentProof(null);
    setOrderDetails(INITIAL_ORDER_DETAILS);
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
    loadCurrentUser,
    updateCurrentUser,
  };
}