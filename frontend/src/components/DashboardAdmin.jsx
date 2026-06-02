import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { 
  Users, Store, Star, LogOut, Plus, Search, 
  ArrowUpDown, X, Info, UserCheck, ShieldAlert 
} from 'lucide-react';

export default function DashboardAdmin({ onLogout, userProfile }) {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [usersList, setUsersList] = useState([]);
  const [storesList, setStoresList] = useState([]);
  
  // Modals state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);

  // Filters State
  const [userFilters, setUserFilters] = useState({ name: '', email: '', address: '', role: '', sortBy: 'name', sortOrder: 'ASC' });
  const [storeFilters, setStoreFilters] = useState({ name: '', email: '', address: '', sortBy: 'name', sortOrder: 'ASC' });

  // Add User Form State
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'normal' });
  const [userFormError, setUserFormError] = useState('');
  
  // Add Store Form State
  const [newStore, setNewStore] = useState({ name: '', email: '', password: '', address: '' });
  const [storeFormError, setStoreFormError] = useState('');

  const [notification, setNotification] = useState({ type: '', message: '' });

  const triggerNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 4000);
  };

  const fetchStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers(userFilters);
      setUsersList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStores = async () => {
    try {
      const data = await api.getAdminStores(storeFilters);
      setStoresList(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [userFilters]);

  useEffect(() => {
    fetchStores();
  }, [storeFilters]);

  // Handle Adding User
  const handleAddUser = async (e) => {
    e.preventDefault();
    setUserFormError('');

    // Pre-validations
    if (newUser.name.length < 20 || newUser.name.length > 60) {
      setUserFormError('Name must be between 20 and 60 characters.');
      return;
    }
    if (newUser.address.length > 400) {
      setUserFormError('Address cannot exceed 400 characters.');
      return;
    }
    if (newUser.password.length < 8 || newUser.password.length > 16) {
      setUserFormError('Password must be 8-16 characters.');
      return;
    }
    if (!/[A-Z]/.test(newUser.password)) {
      setUserFormError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(newUser.password)) {
      setUserFormError('Password must contain at least one special character.');
      return;
    }

    try {
      await api.addUser(newUser);
      triggerNotification('success', 'User added successfully!');
      setShowAddUserModal(false);
      setNewUser({ name: '', email: '', password: '', address: '', role: 'normal' });
      fetchUsers();
      fetchStats();
    } catch (err) {
      setUserFormError(err.message || 'Failed to add user.');
    }
  };

  // Handle Adding Store
  const handleAddStore = async (e) => {
    e.preventDefault();
    setStoreFormError('');

    // Pre-validations
    if (newStore.name.length < 20 || newStore.name.length > 60) {
      setStoreFormError('Store name must be between 20 and 60 characters.');
      return;
    }
    if (newStore.address.length > 400) {
      setStoreFormError('Store address cannot exceed 400 characters.');
      return;
    }
    if (newStore.password.length < 8 || newStore.password.length > 16) {
      setStoreFormError('Password must be 8-16 characters.');
      return;
    }
    if (!/[A-Z]/.test(newStore.password)) {
      setStoreFormError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(newStore.password)) {
      setStoreFormError('Password must contain at least one special character.');
      return;
    }

    try {
      await api.addStore(newStore);
      triggerNotification('success', 'Store and Owner added successfully!');
      setShowAddStoreModal(false);
      setNewStore({ name: '', email: '', password: '', address: '' });
      fetchStores();
      fetchStats();
    } catch (err) {
      setStoreFormError(err.message || 'Failed to register store.');
    }
  };

  // View User Details
  const handleViewDetails = async (id) => {
    try {
      const details = await api.getUserDetails(id);
      setSelectedUserDetails(details);
    } catch (err) {
      triggerNotification('error', 'Could not load user details.');
    }
  };

  // Change Sort orders
  const toggleUserSort = (column) => {
    setUserFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  const toggleStoreSort = (column) => {
    setStoreFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <div className="brand-section">
            <div className="brand-logo">A</div>
            <h2>Admin Portal</h2>
          </div>
          <ul className="nav-links">
            <li className="nav-item active">Dashboard</li>
          </ul>
        </div>
        <div className="user-profile-badge">
          <div className="user-name-badge">{userProfile.name}</div>
          <div className="user-role-badge">{userProfile.role}</div>
          <button onClick={onLogout} className="btn btn-danger" style={{ width: '100%', marginTop: '1rem', padding: '0.5rem' }}>
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="section-header">
          <div>
            <h1 className="gradient-text">Administrator Overview</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage system stores, customer roles, and track metrics.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setShowAddUserModal(true)} className="btn btn-secondary">
              <Plus size={18} /> Add User
            </button>
            <button onClick={() => setShowAddStoreModal(true)} className="btn btn-primary">
              <Plus size={18} /> Add Store
            </button>
          </div>
        </header>

        {/* Notifications */}
        {notification.message && (
          <div className={notification.type === 'success' ? 'success-banner' : 'error-banner'}>
            {notification.message}
          </div>
        )}

        {/* Stats Grid */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div>
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{stats.totalUsers}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue">
              <Store size={24} />
            </div>
            <div>
              <div className="stat-label">Total Stores</div>
              <div className="stat-value">{stats.totalStores}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">
              <Star size={24} />
            </div>
            <div>
              <div className="stat-label">Submitted Ratings</div>
              <div className="stat-value">{stats.totalRatings}</div>
            </div>
          </div>
        </section>

        {/* User Accounts Section */}
        <section style={{ marginBottom: '3rem' }}>
          <div className="section-header">
            <h2>User Registrations (Admins & Regular)</h2>
          </div>
          
          {/* User Filters */}
          <div className="filters-wrapper">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <Search size={16} /> <span>Filters:</span>
            </div>
            <input 
              type="text" 
              placeholder="Search Name..." 
              className="filter-input"
              value={userFilters.name}
              onChange={(e) => setUserFilters(p => ({ ...p, name: e.target.value }))}
            />
            <input 
              type="text" 
              placeholder="Search Email..." 
              className="filter-input"
              value={userFilters.email}
              onChange={(e) => setUserFilters(p => ({ ...p, email: e.target.value }))}
            />
            <input 
              type="text" 
              placeholder="Search Address..." 
              className="filter-input"
              value={userFilters.address}
              onChange={(e) => setUserFilters(p => ({ ...p, address: e.target.value }))}
            />
            <select 
              className="filter-input"
              value={userFilters.role}
              onChange={(e) => setUserFilters(p => ({ ...p, role: e.target.value }))}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="normal">Normal User</option>
              <option value="store_owner">Store Owner</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => toggleUserSort('name')}>
                    Name <ArrowUpDown size={14} className="sort-icon" />
                  </th>
                  <th onClick={() => toggleUserSort('email')}>
                    Email <ArrowUpDown size={14} className="sort-icon" />
                  </th>
                  <th onClick={() => toggleUserSort('address')}>
                    Address <ArrowUpDown size={14} className="sort-icon" />
                  </th>
                  <th onClick={() => toggleUserSort('role')}>
                    Role <ArrowUpDown size={14} className="sort-icon" />
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {usersList.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No users found.</td>
                  </tr>
                ) : (
                  usersList.map((usr) => (
                    <tr key={usr.id}>
                      <td style={{ color: 'white', fontWeight: '500' }}>{usr.name}</td>
                      <td>{usr.email}</td>
                      <td>{usr.address}</td>
                      <td>
                        <span className={`badge badge-${usr.role}`}>
                          {usr.role}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleViewDetails(usr.id)} className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.8125rem' }}>
                          <Info size={14} /> Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Stores Section */}
        <section>
          <div className="section-header">
            <h2>Registered Stores</h2>
          </div>

          {/* Store Filters */}
          <div className="filters-wrapper">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <Search size={16} /> <span>Filters:</span>
            </div>
            <input 
              type="text" 
              placeholder="Search Store Name..." 
              className="filter-input"
              value={storeFilters.name}
              onChange={(e) => setStoreFilters(p => ({ ...p, name: e.target.value }))}
            />
            <input 
              type="text" 
              placeholder="Search Email..." 
              className="filter-input"
              value={storeFilters.email}
              onChange={(e) => setStoreFilters(p => ({ ...p, email: e.target.value }))}
            />
            <input 
              type="text" 
              placeholder="Search Address..." 
              className="filter-input"
              value={storeFilters.address}
              onChange={(e) => setStoreFilters(p => ({ ...p, address: e.target.value }))}
            />
          </div>

          {/* Stores Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => toggleStoreSort('name')}>
                    Store Name <ArrowUpDown size={14} className="sort-icon" />
                  </th>
                  <th onClick={() => toggleStoreSort('email')}>
                    Email <ArrowUpDown size={14} className="sort-icon" />
                  </th>
                  <th onClick={() => toggleStoreSort('address')}>
                    Address <ArrowUpDown size={14} className="sort-icon" />
                  </th>
                  <th onClick={() => toggleStoreSort('rating')}>
                    Overall Rating <ArrowUpDown size={14} className="sort-icon" />
                  </th>
                  <th>Owner</th>
                </tr>
              </thead>
              <tbody>
                {storesList.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No stores registered yet.</td>
                  </tr>
                ) : (
                  storesList.map((str) => (
                    <tr key={str.id}>
                      <td style={{ color: 'white', fontWeight: '500' }}>{str.name}</td>
                      <td>{str.email}</td>
                      <td>{str.address}</td>
                      <td style={{ color: 'var(--accent-yellow)', fontWeight: '600' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Star size={14} fill="currentColor" />
                          <span>{str.averageRating > 0 ? str.averageRating : 'Unrated'}</span>
                        </div>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleViewDetails(str.ownerId)} 
                          className="btn btn-secondary" 
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.8125rem' }}
                        >
                          <Info size={14} /> Owner Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* MODAL: ADD USER */}
        {showAddUserModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Register New User Account</h3>
                <button onClick={() => setShowAddUserModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddUser}>
                <div className="modal-body">
                  {userFormError && <div className="error-banner">{userFormError}</div>}
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Min 20 characters, Max 60"
                      required
                      value={newUser.name}
                      onChange={(e) => setNewUser(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="name@example.com"
                      required
                      value={newUser.email}
                      onChange={(e) => setNewUser(p => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Temporary Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="8-16 chars, 1 uppercase, 1 special symbol"
                      required
                      value={newUser.password}
                      onChange={(e) => setNewUser(p => ({ ...p, password: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Postal Address</label>
                    <textarea 
                      className="form-input form-textarea" 
                      placeholder="Full resident address (Max 400 characters)"
                      required
                      value={newUser.address}
                      onChange={(e) => setNewUser(p => ({ ...p, address: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">System Role</label>
                    <select 
                      className="form-input"
                      value={newUser.role}
                      onChange={(e) => setNewUser(p => ({ ...p, role: e.target.value }))}
                    >
                      <option value="normal">Normal User</option>
                      <option value="admin">System Administrator</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddUserModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create User</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD STORE */}
        {showAddStoreModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Register Store & Owner</h3>
                <button onClick={() => setShowAddStoreModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddStore}>
                <div className="modal-body">
                  {storeFormError && <div className="error-banner">{storeFormError}</div>}
                  <div className="form-group">
                    <label className="form-label">Store / Company Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Min 20 characters, Max 60"
                      required
                      value={newStore.name}
                      onChange={(e) => setNewStore(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Business Email</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="business@example.com"
                      required
                      value={newStore.email}
                      onChange={(e) => setNewStore(p => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Owner Account Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="8-16 chars, 1 uppercase, 1 special symbol"
                      required
                      value={newStore.password}
                      onChange={(e) => setNewStore(p => ({ ...p, password: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Store Address</label>
                    <textarea 
                      className="form-input form-textarea" 
                      placeholder="Physical outlet location address (Max 400 characters)"
                      required
                      value={newStore.address}
                      onChange={(e) => setNewStore(p => ({ ...p, address: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddStoreModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Register Store</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: VIEW DETAILS */}
        {selectedUserDetails && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>User Account Details</h3>
                <button onClick={() => setSelectedUserDetails(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body" style={{ color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                  <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)', padding: '0.75rem', borderRadius: '12px' }}>
                    <UserCheck size={28} />
                  </div>
                  <div>
                    <h3 style={{ color: 'white', margin: 0 }}>{selectedUserDetails.name}</h3>
                    <span className={`badge badge-${selectedUserDetails.role}`}>{selectedUserDetails.role}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <strong style={{ color: 'white', display: 'block', fontSize: '0.875rem' }}>Email Address</strong>
                    <span>{selectedUserDetails.email}</span>
                  </div>
                  <div>
                    <strong style={{ color: 'white', display: 'block', fontSize: '0.875rem' }}>Postal Address</strong>
                    <span>{selectedUserDetails.address}</span>
                  </div>
                  {selectedUserDetails.role === 'store_owner' && (
                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <strong style={{ color: 'white', display: 'block', fontSize: '0.875rem' }}>Linked Store</strong>
                        <span style={{ color: 'var(--accent-blue)', fontWeight: '600' }}>{selectedUserDetails.storeName || 'N/A'}</span>
                      </div>
                      <div>
                        <strong style={{ color: 'white', display: 'block', fontSize: '0.875rem' }}>Average Rating</strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-yellow)', fontWeight: '700' }}>
                          <Star size={16} fill="currentColor" />
                          <span>{selectedUserDetails.averageRating > 0 ? `${selectedUserDetails.averageRating} / 5` : 'Unrated'}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({selectedUserDetails.totalRatings} ratings)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={() => setSelectedUserDetails(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
