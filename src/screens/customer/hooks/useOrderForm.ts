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

  // ⭐⭐⭐ CRITICAL FIX: Load current user SETIAP KALI component mount ⭐⭐⭐
  useEffect(() => {
    console.log('🔄 OrderForm mounted - Loading current user...');
    loadCurrentUser();
    
    // Cleanup function
    return () => {
      console.log('🧹 OrderForm unmounted - Cleaning up...');
      // ⚠️ JANGAN reset currentUser di sini, biar tetap login
    };
  }, []); // Empty deps = run ONCE per mount

  // ✅ FUNCTION: Load user yang SEDANG LOGIN
  const loadCurrentUser = async () => {
    try {
      setLoadingUser(true);
      console.log('📱 Reading user data from AsyncStorage...');
      
      // ⭐ Try multiple keys untuk compatibility
      let userDataString = await AsyncStorage.getItem('userData');
      let userData = null;

      if (userDataString) {
        console.log('✅ Found userData in AsyncStorage');
        userData = JSON.parse(userDataString);
      } else {
        // Fallback ke currentUser key
        console.log('⚠️ userData not found, trying currentUser key...');
        userDataString = await AsyncStorage.getItem('currentUser');
        if (userDataString) {
          console.log('✅ Found currentUser in AsyncStorage');
          const user = JSON.parse(userDataString);
          userData = { user }; // Wrap in object
        }
      }

      if (!userData || !userData.user) {
        console.error('❌ No valid user data found in storage');
        Alert.alert('Error', 'Session expired. Silakan login kembali.');
        setCurrentUser(null);
        setLoadingUser(false);
        return;
      }

      // ⭐ CRITICAL: Set user yang BENAR
      const user = userData.user;
      console.log('✅✅✅ CURRENT USER LOADED:', {
        id: user.id_user,
        nama: user.nama,
        email: user.email,
      });

      setCurrentUser(user);
      
      // Auto-fill recipient data dari user profile
      if (!orderDetails.recipientName) {
        setOrderDetails(prev => ({
          ...prev,
          recipientName: user.nama || '',
          recipientPhone: user.no_telepon || '',
          shippingAddress: user.alamat || '',
        }));
        console.log('📝 Auto-filled recipient data from user profile');
      }

    } catch (error) {
      console.error('❌ Error loading user:', error);
      Alert.alert('Error', 'Gagal memuat data user. Silakan login kembali.');
      setCurrentUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  // ✅ FUNCTION: Update order details
  const updateDetails = (details: Partial<OrderDetails>) => {
    setOrderDetails(prev => ({ ...prev, ...details }));
  };

  // ✅ FUNCTION: Pick image (design atau payment proof)
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

  // ✅ FUNCTION: Calculate price
  const calculatePrice = (): number => {
    if (!service || !orderDetails.material || !orderDetails.size) {
      return 0;
    }

    const basePrice = parseFloat(service.harga_dasar) || 0;
    const quantity = orderDetails.quantity || 1;
    const speedMultiplier = orderDetails.speed === 'express' ? 1.5 : 1;

    return Math.round(basePrice * quantity * speedMultiplier);
  };

  // ✅ FUNCTION: Calculate total (with shipping)
  const calculateTotal = (): number => {
    return calculatePrice() + orderDetails.shippingCost;
  };

  // ✅ FUNCTION: Reset form after successful order
  const resetForm = () => {
    console.log('🔄 Resetting order form...');
    setUploadedFile(null);
    setPaymentProof(null);
    setOrderDetails(INITIAL_ORDER_DETAILS);
    setCurrentStep(1);
    // ⚠️ DON'T reset currentUser - user tetap login!
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
    loadCurrentUser, // Export untuk manual reload kalau perlu
  };
}