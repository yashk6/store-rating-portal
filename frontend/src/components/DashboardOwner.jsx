import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { 
  Store, Star, LogOut, KeyRound, ArrowUpDown, Eye, EyeOff, 
  Users, CheckCircle2, MessageSquareCode 
} from 'lucide-react';

export default function DashboardOwner({ onLogout, userProfile }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'password'
  const [dashboardData, setDashboardData] = useState({
    storeName: '',
    storeEmail: '',
    storeAddress: '',
    averageRating: 0,
    totalRatings: 0,
    ratings: []
  });

  // Table Sorting State
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Change Password state
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const fetchDashboard = async () => {
    try {
      const filters = { sortBy, sortOrder };
      const data = await api.getOwnerDashboard(filters);
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard details:', err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [sortBy, sortOrder]);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

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

  const handleSort = (field) => {
    setSortBy(field);
    setSortOrder(prev => sortBy === field && prev === 'ASC' ? 'DESC' : 'ASC');
  };

  // Helper to render inline rating stars
  const renderStars = (rating) => {
    return (
      <div style={{ display: 'flex', gap: '0.1rem', color: 'var(--accent-yellow)' }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Star 
            key={s} 
            size={14} 
            fill={s <= rating ? 'currentColor' : 'none'} 
            stroke={s <= rating ? 'none' : 'currentColor'}
          />
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
            <div className="brand-logo">S</div>
            <h2>Store Owner</h2>
          </div>
          <ul className="nav-links">
            <li 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <Store size={18} /> Store Dashboard
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
        {activeTab === 'dashboard' && (
          <>
            <header className="section-header">
              <div>
                <h1 className="gradient-text">{dashboardData.storeName || 'Store Outlet'}</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Review client feedback, trace scores, and manage parameters.</p>
              </div>
            </header>

            {/* Stats Summary Grid */}
            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-yellow)' }}>
                  <Star size={24} fill="currentColor" />
                </div>
                <div>
                  <div className="stat-label">Average Store Rating</div>
                  <div className="stat-value">{dashboardData.averageRating > 0 ? `${dashboardData.averageRating} / 5` : 'Unrated'}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon blue">
                  <Users size={24} />
                </div>
                <div>
                  <div className="stat-label">Total Rated Customers</div>
                  <div className="stat-value">{dashboardData.totalRatings}</div>
                </div>
              </div>
            </section>

            {/* List of reviewers table */}
            <section style={{ marginTop: '2rem' }}>
              <div className="section-header">
                <h2>Review Log & Feedbacks</h2>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('userName')}>
                        Customer Name <ArrowUpDown size={14} className="sort-icon" />
                      </th>
                      <th onClick={() => handleSort('userEmail')}>
                        Email Address <ArrowUpDown size={14} className="sort-icon" />
                      </th>
                      <th onClick={() => handleSort('userAddress')}>
                        Postal Location <ArrowUpDown size={14} className="sort-icon" />
                      </th>
                      <th onClick={() => handleSort('rating')}>
                        Score Given <ArrowUpDown size={14} className="sort-icon" />
                      </th>
                      <th onClick={() => handleSort('createdAt')}>
                        Date Left <ArrowUpDown size={14} className="sort-icon" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.ratings.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                          <MessageSquareCode size={36} style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }} />
                          <div style={{ color: 'var(--text-secondary)' }}>No customer ratings registered yet.</div>
                        </td>
                      </tr>
                    ) : (
                      dashboardData.ratings.map((rate) => (
                        <tr key={rate.id}>
                          <td style={{ color: 'white', fontWeight: '500' }}>{rate.userName}</td>
                          <td>{rate.userEmail}</td>
                          <td>{rate.userAddress}</td>
                          <td>{renderStars(rate.rating)}</td>
                          <td>{new Date(rate.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
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

                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type={showCurrentPass ? 'text' : 'password'} 
                      className="form-input" 
                      style={{ flex: 1 }}
                      placeholder="Enter current password"
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
                    placeholder="Confirm new password"
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
