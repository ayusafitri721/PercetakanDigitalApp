import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  X,
  Edit2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface SettingsPageProps {
  currentUser: {
    nama: string;
    email: string;
    no_telepon?: string;
    role: string;
  };
}

const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: currentUser.nama,
    email: currentUser.email,
    phone: currentUser.no_telepon || '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama harus diisi';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password minimal 6 karakter';
    }

    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccessMessage('Pengaturan berhasil disimpan!');
      setIsEditing(false);
      setFormData(prev => ({
        ...prev,
        newPassword: '',
        confirmPassword: '',
      }));

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Gagal menyimpan pengaturan. Silakan coba lagi.');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: currentUser.nama,
      email: currentUser.email,
      phone: currentUser.no_telepon || '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({});
    setErrorMessage('');
  };

  return (
    <div style={{ padding: 0 }}>
      <div style={{ marginBottom: '24px' }}>
        <h2
          style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '8px',
          }}
        >
          Pengaturan Akun
        </h2>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          Kelola informasi profil dan keamanan akun Anda
        </p>
      </div>

      {successMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            borderRadius: '10px',
            marginBottom: '20px',
            background: '#dcfce7',
            color: '#166534',
            border: '1px solid #bbf7d0',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          <CheckCircle size={20} />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            borderRadius: '10px',
            marginBottom: '20px',
            background: '#fee2e2',
            color: '#991b1b',
            border: '1px solid #fecaca',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          <AlertCircle size={20} />
          {errorMessage}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '24px',
          alignItems: 'start',
        }}
        className="settings-grid"
      >
        {/* Profile Card */}
        <div>
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '32px 24px',
              borderRadius: '16px',
              textAlign: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            }}
          >
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '42px',
                fontWeight: '700',
                margin: '0 auto 16px',
                border: '4px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {currentUser.nama.charAt(0).toUpperCase()}
            </div>
            <h3
              style={{
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '4px',
              }}
            >
              {currentUser.nama}
            </h3>
            <div
              style={{
                display: 'inline-block',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                margin: '8px 0',
                textTransform: 'capitalize',
              }}
            >
              {currentUser.role}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '8px' }}>
              {currentUser.email}
            </div>
          </div>

          {/* Info Card */}
          <div
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e8ecef',
              marginTop: '16px',
            }}
          >
            <h4
              style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '16px',
              }}
            >
              Informasi Akun
            </h4>
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid #f3f4f6',
                }}
              >
                <span
                  style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    fontWeight: '500',
                  }}
                >
                  Status
                </span>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: '#dcfce7',
                    color: '#166534',
                  }}
                >
                  Aktif
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                }}
              >
                <span
                  style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    fontWeight: '500',
                  }}
                >
                  Role
                </span>
                <span
                  style={{
                    fontSize: '14px',
                    color: '#1f2937',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                  }}
                >
                  {currentUser.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div
          style={{
            background: 'white',
            padding: '28px',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e8ecef',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid #f3f4f6',
            }}
          >
            <h3
              style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}
            >
              Informasi Pribadi
            </h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Edit2 size={16} />
                Edit Profil
              </button>
            )}
          </div>

          <div>
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                }}
              >
                <User size={16} color="#667eea" />
                Nama Lengkap
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${errors.name ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#1f2937',
                  background: isEditing ? 'white' : '#f9fafb',
                  cursor: isEditing ? 'text' : 'not-allowed',
                }}
              />
              {errors.name && (
                <span
                  style={{
                    display: 'block',
                    color: '#ef4444',
                    fontSize: '12px',
                    marginTop: '4px',
                  }}
                >
                  {errors.name}
                </span>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '20px',
              }}
              className="form-row-responsive"
            >
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px',
                  }}
                >
                  <Mail size={16} color="#667eea" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${errors.email ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#1f2937',
                    background: isEditing ? 'white' : '#f9fafb',
                    cursor: isEditing ? 'text' : 'not-allowed',
                  }}
                />
                {errors.email && (
                  <span
                    style={{
                      display: 'block',
                      color: '#ef4444',
                      fontSize: '12px',
                      marginTop: '4px',
                    }}
                  >
                    {errors.email}
                  </span>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px',
                  }}
                >
                  <Phone size={16} color="#667eea" />
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#1f2937',
                    background: isEditing ? 'white' : '#f9fafb',
                    cursor: isEditing ? 'text' : 'not-allowed',
                  }}
                />
              </div>
            </div>

            {isEditing && (
              <>
                <div
                  style={{
                    margin: '28px 0 24px',
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      background: 'white',
                      padding: '0 16px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#6b7280',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    Ubah Password (Opsional)
                  </span>
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: 0,
                      right: 0,
                      height: '1px',
                      background: '#e5e7eb',
                      zIndex: 0,
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px',
                    }}
                  >
                    <Lock size={16} color="#667eea" />
                    Password Baru
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Minimal 6 karakter"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `1px solid ${
                        errors.newPassword ? '#ef4444' : '#d1d5db'
                      }`,
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                  {errors.newPassword && (
                    <span
                      style={{
                        display: 'block',
                        color: '#ef4444',
                        fontSize: '12px',
                        marginTop: '4px',
                      }}
                    >
                      {errors.newPassword}
                    </span>
                  )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px',
                    }}
                  >
                    <Lock size={16} color="#667eea" />
                    Konfirmasi Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Ketik ulang password baru"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `1px solid ${
                        errors.confirmPassword ? '#ef4444' : '#d1d5db'
                      }`,
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                  {errors.confirmPassword && (
                    <span
                      style={{
                        display: 'block',
                        color: '#ef4444',
                        fontSize: '12px',
                        marginTop: '4px',
                      }}
                    >
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    marginTop: '28px',
                    paddingTop: '20px',
                    borderTop: '1px solid #e5e7eb',
                  }}
                  className="form-actions-responsive"
                >
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      background: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      opacity: loading ? 0.6 : 1,
                    }}
                  >
                    <X size={16} />
                    Batal
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      opacity: loading ? 0.6 : 1,
                    }}
                  >
                    {loading ? (
                      <>
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            borderTopColor: 'white',
                            borderRadius: '50%',
                            animation: 'spin 0.6s linear infinite',
                          }}
                        />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .settings-grid { grid-template-columns: 1fr !important; }
          .form-row-responsive { grid-template-columns: 1fr !important; }
          .form-actions-responsive { flex-direction: column; }
          .form-actions-responsive button { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;
