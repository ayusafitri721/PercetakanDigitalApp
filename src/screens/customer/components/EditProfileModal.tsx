// components/EditProfileModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_BASE_URL } from '../../../config/api';

interface EditProfileModalProps {
  visible: boolean;
  user: {
    id_user: string;
    nama: string;
    email: string;
    no_telepon?: string;
    alamat?: string;
    kota?: string;
    provinsi?: string;
  };
  onClose: () => void;
  onUpdate: (updatedUser: any) => void;
}

export default function EditProfileModal({
  visible,
  user,
  onClose,
  onUpdate,
}: EditProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    no_telepon: '',
    alamat: '',
    kota: '',
    provinsi: '',
  });

  useEffect(() => {
    if (visible) {
      setFormData({
        nama: user.nama || '',
        email: user.email || '',
        no_telepon: user.no_telepon || '',
        alamat: user.alamat || '',
        kota: user.kota || '',
        provinsi: user.provinsi || '',
      });
    }
  }, [visible, user]);

  const handleUpdate = async () => {
    if (!formData.nama.trim()) {
      Alert.alert('Error', 'Nama tidak boleh kosong');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email tidak boleh kosong');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nama', formData.nama.trim());
      formDataToSend.append('email', formData.email.trim());
      formDataToSend.append('no_telepon', formData.no_telepon.trim());
      formDataToSend.append('alamat', formData.alamat.trim());
      formDataToSend.append('kota', formData.kota.trim());
      formDataToSend.append('provinsi', formData.provinsi.trim());

      const response = await fetch(
        `${API_BASE_URL}/users.php?op=update&id=${user.id_user}`,
        {
          method: 'POST',
          body: formDataToSend,
        },
      );
      const result = await response.json();

      if (result.success) {
        // Fetch updated user data
       const detailResponse = await fetch(
         `${API_BASE_URL}/users.php?op=detail&id=${user.id_user}`,
       );
        const detailResult = await detailResponse.json();

        if (detailResult.success) {
          onUpdate(detailResult.data);
          Alert.alert('Sukses', 'Profile berhasil diupdate');
          onClose();
        }
      } else {
        Alert.alert('Error', result.message || 'Gagal update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Nama */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Lengkap *</Text>
              <View style={styles.inputContainer}>
                <Icon name="person-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  value={formData.nama}
                  onChangeText={text =>
                    setFormData({ ...formData, nama: text })
                  }
                  placeholder="Masukkan nama lengkap"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <View style={styles.inputContainer}>
                <Icon name="mail-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={text =>
                    setFormData({ ...formData, email: text })
                  }
                  placeholder="Masukkan email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* No Telepon */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>No. Telepon</Text>
              <View style={styles.inputContainer}>
                <Icon name="call-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  value={formData.no_telepon}
                  onChangeText={text =>
                    setFormData({ ...formData, no_telepon: text })
                  }
                  placeholder="Masukkan nomor telepon"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Alamat */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Alamat</Text>
              <View style={styles.inputContainer}>
                <Icon name="location-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  value={formData.alamat}
                  onChangeText={text =>
                    setFormData({ ...formData, alamat: text })
                  }
                  placeholder="Masukkan alamat lengkap"
                  placeholderTextColor="#9CA3AF"
                  multiline
                />
              </View>
            </View>

            {/* Kota */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kota</Text>
              <View style={styles.inputContainer}>
                <Icon name="business-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  value={formData.kota}
                  onChangeText={text =>
                    setFormData({ ...formData, kota: text })
                  }
                  placeholder="Masukkan kota"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Provinsi */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Provinsi</Text>
              <View style={styles.inputContainer}>
                <Icon name="map-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  value={formData.provinsi}
                  onChangeText={text =>
                    setFormData({ ...formData, provinsi: text })
                  }
                  placeholder="Masukkan provinsi"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <Text style={styles.note}>* Wajib diisi</Text>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleUpdate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="checkmark" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Simpan</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#1F2937',
  },
  note: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
