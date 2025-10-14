import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserForm from './UserForm';
import UserDelete from './UserDelete';
import './users.css';

const API_BASE_URL = 'http://localhost/api-percetakan/api';

interface User {
  id_user: string;
  nama: string;
  email: string;
  role: string;
  no_telepon: string;
  alamat: string;
  status_aktif: number;
  tanggal_daftar: string;
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/users.php`);
      console.log('Users Response:', response.data);
      setUsers(response.data.data?.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Gagal memuat data users');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setShowDelete(true);
  };

  const handleFormClose = (success: boolean) => {
    setShowForm(false);
    setSelectedUser(null);
    if (success) {
      fetchUsers(); // Refresh data
    }
  };

  const handleDeleteClose = (success: boolean) => {
    setShowDelete(false);
    setSelectedUser(null);
    if (success) {
      fetchUsers(); // Refresh data
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchSearch =
      user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === 'all' || user.role === filterRole;
    return matchSearch && matchRole;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="users-management">
      {/* Header */}
      <div className="management-header">
        <div className="header-left">
          <h2>Kelola Users</h2>
          <p className="subtitle">Total: {filteredUsers.length} users</p>
        </div>
        <button className="btn-add" onClick={handleAdd}>
          <span>➕</span> Tambah User
        </button>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
        >
          <option value="all">Semua Role</option>
          <option value="admin">Admin</option>
          <option value="kasir">Kasir</option>
          <option value="operator">Operator</option>
          <option value="kurir">Kurir</option>
          <option value="pelanggan">Pelanggan</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama</th>
              <th>Email</th>
              <th>No. Telepon</th>
              <th>Role</th>
              <th>Status</th>
              <th>Tanggal Daftar</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{ textAlign: 'center', padding: '40px' }}
                >
                  Tidak ada data user
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id_user}>
                  <td>#{user.id_user}</td>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">{user.nama.charAt(0)}</div>
                      <span>{user.nama}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.no_telepon || '-'}</td>
                  <td>
                    <span className={`badge badge-${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        user.status_aktif ? 'badge-success' : 'badge-danger'
                      }`}
                    >
                      {user.status_aktif ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td>
                    {new Date(user.tanggal_daftar).toLocaleDateString('id-ID')}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(user)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(user)}
                        title="Hapus"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showForm && <UserForm user={selectedUser} onClose={handleFormClose} />}

      {showDelete && selectedUser && (
        <UserDelete user={selectedUser} onClose={handleDeleteClose} />
      )}
    </div>
  );
};

export default UsersManagement;
