// components/ChangePasswordModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_BASE_URL } from '../../../config/api';

interface ChangePasswordModalProps {
  visible: boolean;
  userId: string;
  onClose: () => void;
  onPasswordChanged?: () => void; // ✅ Tambahkan callback
}

export default function ChangePasswordModal({
  visible,
  userId,
  onClose,
  onPasswordChanged, // ✅ Terima callback
}: ChangePasswordModalProps) {
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChangePassword = async () => {
    // Validasi
    if (!formData.oldPassword.trim()) {
      Alert.alert('Error', 'Password lama tidak boleh kosong');
      return;
    }

    if (!formData.newPassword.trim()) {
      Alert.alert('Error', 'Password baru tidak boleh kosong');
      return;
    }

    if (formData.newPassword.length < 6) {
      Alert.alert('Error', 'Password baru minimal 6 karakter');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Error', 'Konfirmasi password tidak sesuai');
      return;
    }

    if (formData.oldPassword === formData.newPassword) {
      Alert.alert('Error', 'Password baru harus berbeda dengan password lama');
      return;
    }

    setLoading(true);

    try {
      const updateForm = new FormData();
      updateForm.append('password', formData.newPassword);

      const response = await fetch(
        `${API_BASE_URL}/users.php?op=update&id=${userId}`,
        {
          method: 'POST',
          body: updateForm,
        },
      );

      const result = await response.json();

      console.log('Change Password Response:', result);

      const isSuccess =
        result.success === true ||
        result.success === 'true' ||
        result.success === 1 ||
        result.message?.toLowerCase().includes('berhasil');

      if (isSuccess) {
        // Reset form
        setFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });

        // ✅ PENTING: Refresh data user dari server
        if (onPasswordChanged) {
          await onPasswordChanged();
        }

        // Tutup modal
        onClose();

        // Tampilkan alert sukses
        setTimeout(() => {
          Alert.alert('Sukses', 'Password berhasil diubah', [{ text: 'OK' }]);
        }, 300);
      } else {
        Alert.alert('Error', result.message || 'Gagal mengubah password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat mengubah password');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Ubah Password</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Password Lama */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password Lama *</Text>
              <View style={styles.inputContainer}>
                <Icon name="lock-closed-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  value={formData.oldPassword}
                  onChangeText={text =>
                    setFormData({ ...formData, oldPassword: text })
                  }
                  placeholder="Masukkan password lama"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showOldPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowOldPassword(!showOldPassword)}
                  disabled={loading}
                >
                  <Icon
                    name={showOldPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Baru */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password Baru *</Text>
              <View style={styles.inputContainer}>
                <Icon name="lock-closed-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  value={formData.newPassword}
                  onChangeText={text =>
                    setFormData({ ...formData, newPassword: text })
                  }
                  placeholder="Masukkan password baru"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  disabled={loading}
                >
                  <Icon
                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.hint}>Minimal 6 karakter</Text>
            </View>

            {/* Konfirmasi Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Konfirmasi Password Baru *</Text>
              <View style={styles.inputContainer}>
                <Icon name="lock-closed-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  value={formData.confirmPassword}
                  onChangeText={text =>
                    setFormData({ ...formData, confirmPassword: text })
                  }
                  placeholder="Masukkan ulang password baru"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  <Icon
                    name={
                      showConfirmPassword ? 'eye-off-outline' : 'eye-outline'
                    }
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Icon
                name="information-circle-outline"
                size={20}
                color="#4F46E5"
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Tips Password Aman:</Text>
                <Text style={styles.infoText}>• Minimal 6 karakter</Text>
                <Text style={styles.infoText}>
                  • Kombinasi huruf besar & kecil
                </Text>
                <Text style={styles.infoText}>• Tambahkan angka & simbol</Text>
              </View>
            </View>
          </View>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.updateButton,
                loading && styles.updateButtonDisabled,
              ]}
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="checkmark" size={20} color="#FFFFFF" />
                  <Text style={styles.updateButtonText}>Ubah Password</Text>
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
    maxHeight: '85%',
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
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#6366F1',
    marginBottom: 4,
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
  updateButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  updateButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
