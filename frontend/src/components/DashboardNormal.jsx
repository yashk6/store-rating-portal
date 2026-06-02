import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { 
  Store, Star, LogOut, Search, ArrowUpDown, KeyRound, 
  MapPin, Eye, EyeOff, LayoutGrid, CheckCircle2 
} from 'lucide-react';

export default function DashboardNormal({ onLogout, userProfile }) {
  const [activeTab, setActiveTab] = useState('stores'); // 'stores' | 'password'
  const [stores, setStores] = useState([]);
  
  // Search & Filter state
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');

  // Change Password state
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [notification, setNotification] = useState({ type: '', message: '' });

  const triggerNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 4000);
  };

  const fetchStores = async () => {
    try {
      const filters = {
        name: searchName,
        address: searchAddress,
        sortBy,
        sortOrder
      };
      const data = await api.getStoresList(filters);
      setStores(data);
    } catch (err) {
      console.error('Error fetching stores:', err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [searchName, searchAddress, sortBy, sortOrder]);

  // Handle rating submission/modification
  const handleRatingSubmit = async (storeId, value) => {
    try {
      await api.submitRating(storeId, value);
      triggerNotification('success', 'Rating updated successfully!');
      fetchStores(); // Reload stores to update ratings
    } catch (err) {
      triggerNotification('error', err.message || 'Failed to submit rating.');
    }
  };

  // Handle password modification
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    // Password strength check
    if (passwords.newPassword.length < 8 || passwords.newPassword.length > 16) {
      setPassError('Password must be between 8 and 16 characters.');
      return;
    }
    if (!/[A-Z]/.test(passwords.newPassword)) {
      setPassError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(passwords.newPassword)) {
      setPassError('Password must contain at least one special character.');
      return;
    }

    try {
      await api.changePassword(passwords.currentPassword, passwords.newPassword);
      setPassSuccess('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassError(err.message || 'Failed to change password.');
    }
  };

  // Toggle sorting logic
  const handleSort = (field) => {
    setSortBy(field);
    setSortOrder(prev => sortBy === field && prev === 'ASC' ? 'DESC' : 'ASC');
  };

  // Helper component to render stars
  const StarRatingSelector = ({ currentRating, onChange }) => {
    const [hover, setHover] = useState(null);

    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-btn ${(hover || currentRating) >= star ? 'active' : ''}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
          >
            <Star size={20} fill={(hover || currentRating) >= star ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <div className="brand-section">
            <div className="brand-logo">R</div>
            <h2>Reviewer App</h2>
          </div>
          <ul className="nav-links">
            <li 
              className={`nav-item ${activeTab === 'stores' ? 'active' : ''}`}
              onClick={() => setActiveTab('stores')}
            >
              <LayoutGrid size={18} /> Explore Stores
            </li>
            <li 
              className={`nav-item ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <KeyRound size={18} /> Change Password
            </li>
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
        {notification.message && (
          <div className={notification.type === 'success' ? 'success-banner' : 'error-banner'}>
            {notification.message}
          </div>
        )}

        {activeTab === 'stores' && (
          <>
            <header className="section-header">
              <div>
                <h1 className="gradient-text">Registered Business Outlets</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Explore shops, view overall customer ratings, and write your own review.</p>
              </div>
            </header>

            {/* Searching/Sorting Filters Bar */}
            <div className="filters-wrapper">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <Search size={16} /> <span>Search:</span>
              </div>
              <input 
                type="text" 
                placeholder="Search Store Name..." 
                className="filter-input"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
              <input 
                type="text" 
                placeholder="Search Address..." 
                className="filter-input"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
              />
              <button onClick={() => handleSort('name')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                Name <ArrowUpDown size={14} style={{ marginLeft: '0.25rem' }} />
              </button>
              <button onClick={() => handleSort('rating')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                Rating <ArrowUpDown size={14} style={{ marginLeft: '0.25rem' }} />
              </button>
            </div>

            {/* Stores List Grid */}
            {stores.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <Store size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
                <h3>No stores match your search query</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Try refining your name or address filters.</p>
              </div>
            ) : (
              <div className="stores-grid">
                {stores.map((store) => (
                  <div key={store.id} className="store-card">
                    <div className="store-info-section">
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <div style={{ background: 'rgba(59, 132, 246, 0.1)', color: 'var(--accent-blue)', padding: '0.5rem', borderRadius: '10px' }}>
                          <Store size={20} />
                        </div>
                        <div>
                          <h3>{store.name}</h3>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{store.email}</span>
                        </div>
                      </div>
                      <p className="store-info-address" style={{ marginTop: '0.75rem' }}>
                        <MapPin size={12} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'text-bottom' }} />
                        {store.address}
                      </p>
                    </div>

                    <div className="rating-display-block">
                      <span>Overall Average:</span>
                      <strong style={{ color: 'var(--accent-yellow)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Star size={14} fill="currentColor" />
                        {store.overallRating > 0 ? `${store.overallRating} / 5` : 'Unrated'}
                      </strong>
                    </div>

                    <div className="submit-rating-section">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.8125rem', color: 'white', fontWeight: '500' }}>
                          {store.userRating ? "Your submitted rating:" : "Rate this store:"}
                        </span>
                        {store.userRating && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                            <CheckCircle2 size={12} /> Rated ({store.userRating}⭐)
                          </span>
                        )}
                      </div>
                      <StarRatingSelector 
                        currentRating={store.userRating || 0} 
                        onChange={(val) => handleRatingSubmit(store.id, val)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'password' && (
          <div className="profile-section">
            <header className="section-header">
              <div>
                <h1 className="gradient-text">Account Security</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Modify your password details. Validations are enforced.</p>
              </div>
            </header>

            <div className="glass-card">
              <form onSubmit={handlePasswordUpdate}>
                {passError && <div className="error-banner">{passError}</div>}
                {passSuccess && <div className="success-banner">{passSuccess}</div>}

                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="form-label">Current Password</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type={showCurrentPass ? 'text' : 'password'} 
                      className="form-input" 
                      style={{ flex: 1 }}
                      placeholder="Enter your current password"
                      required
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      style={{ padding: '0.5rem' }}
                    >
                      {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type={showNewPass ? 'text' : 'password'} 
                      className="form-input" 
                      style={{ flex: 1 }}
                      placeholder="8-16 chars, 1 uppercase, 1 special symbol"
                      required
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowNewPass(!showNewPass)}
                      style={{ padding: '0.5rem' }}
                    >
                      {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Re-type your new password"
                    required
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  Update Password
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
