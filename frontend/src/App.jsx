import React, { useState, useEffect } from 'react';
import { api } from './utils/api';
import DashboardAdmin from './components/DashboardAdmin';
import DashboardNormal from './components/DashboardNormal';
import DashboardOwner from './components/DashboardOwner';
import { Store, KeyRound, UserPlus, Eye, EyeOff, ShieldCheck, Mail, MapPin, BadgeHelp } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState({ token: null, user: null });
  const [isLoginView, setIsLoginView] = useState(true); // Toggle Login/Signup
  const [loading, setLoading] = useState(true);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Signup Form State
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', address: '' });
  const [signupError, setSignupError] = useState('');
  const [showSignupPass, setShowSignupPass] = useState(false);

  useEffect(() => {
    // Check if token and user data are already in localstorage
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setSession({ token, user: JSON.parse(user) });
    }
    setLoading(false);
  }, []);

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const data = await api.login(loginEmail, loginPassword);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setSession({ token: data.token, user: data.user });
      setLoginEmail('');
      setLoginPassword('');
    } catch (err) {
      setLoginError(err.message || 'Login failed. Please check credentials.');
    }
  };

  // Handle Signup submission (Normal users only)
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError('');

    // Pre-validations
    if (signupData.name.length < 20 || signupData.name.length > 60) {
      setSignupError('Name must be between 20 and 60 characters.');
      return;
    }
    if (signupData.address.length > 400) {
      setSignupError('Address cannot exceed 400 characters.');
      return;
    }
    if (signupData.password.length < 8 || signupData.password.length > 16) {
      setSignupError('Password must be between 8 and 16 characters.');
      return;
    }
    if (!/[A-Z]/.test(signupData.password)) {
      setSignupError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(signupData.password)) {
      setSignupError('Password must contain at least one special character.');
      return;
    }

    try {
      const data = await api.register(
        signupData.name,
        signupData.email,
        signupData.address,
        signupData.password
      );
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setSession({ token: data.token, user: data.user });
      setSignupData({ name: '', email: '', password: '', address: '' });
    } catch (err) {
      setSignupError(err.message || 'Registration failed. Try again.');
    }
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setSession({ token: null, user: null });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <h3 className="gradient-text" style={{ fontSize: '1.5rem' }}>Loading rating portal...</h3>
      </div>
    );
  }

  // Dashboard Selector based on Role
  if (session.token && session.user) {
    switch (session.user.role) {
      case 'admin':
        return <DashboardAdmin onLogout={handleLogout} userProfile={session.user} />;
      case 'normal':
        return <DashboardNormal onLogout={handleLogout} userProfile={session.user} />;
      case 'store_owner':
        return <DashboardOwner onLogout={handleLogout} userProfile={session.user} />;
      default:
        return (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <h2>Unknown system role.</h2>
            <button className="btn btn-primary" onClick={handleLogout}>Log Out</button>
          </div>
        );
    }
  }

  // Auth Card Renderer
  return (
    <div className="auth-container">
      {isLoginView ? (
        // LOGIN PAGE
        <div className="glass-card auth-card">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)', padding: '0.85rem', borderRadius: '14px', marginBottom: '1rem' }}>
              <ShieldCheck size={32} />
            </div>
            <h1 className="gradient-text" style={{ fontSize: '2rem' }}>Store Rating Portal</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Sign in to continue reviews and dashboard</p>
          </div>

          <form onSubmit={handleLoginSubmit}>
            {loginError && <div className="error-banner">{loginError}</div>}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  className="form-input" 
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  placeholder="name@email.com"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input 
                    type={showLoginPass ? 'text' : 'password'} 
                    className="form-input" 
                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                    placeholder="Enter password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <KeyRound size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                </div>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowLoginPass(!showLoginPass)}
                  style={{ padding: '0.5rem' }}
                >
                  {showLoginPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Sign In
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Don't have an account?{' '}
            <button onClick={() => { setIsLoginView(false); setLoginError(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-family)' }}>
              Register here
            </button>
          </div>
        </div>
      ) : (
        // SIGNUP PAGE
        <div className="glass-card auth-card">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', background: 'rgba(59, 132, 246, 0.1)', color: 'var(--accent-blue)', padding: '0.85rem', borderRadius: '14px', marginBottom: '1rem' }}>
              <UserPlus size={32} />
            </div>
            <h1 className="gradient-text" style={{ fontSize: '2rem' }}>Create Account</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Create customer profile to explore and rate stores</p>
          </div>

          <form onSubmit={handleSignupSubmit}>
            {signupError && <div className="error-banner">{signupError}</div>}

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  placeholder="Min 20 characters, Max 60"
                  required
                  value={signupData.name}
                  onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                />
                <UserPlus size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  className="form-input" 
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  placeholder="name@email.com"
                  required
                  value={signupData.email}
                  onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                />
                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input 
                    type={showSignupPass ? 'text' : 'password'} 
                    className="form-input" 
                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                    placeholder="8-16 chars, 1 uppercase, 1 special symbol"
                    required
                    value={signupData.password}
                    onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                  />
                  <KeyRound size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                </div>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowSignupPass(!showSignupPass)}
                  style={{ padding: '0.5rem' }}
                >
                  {showSignupPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Postal Address</label>
              <div style={{ position: 'relative' }}>
                <textarea 
                  className="form-input form-textarea" 
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  placeholder="Maximum 400 characters"
                  required
                  value={signupData.address}
                  onChange={(e) => setSignupData(prev => ({ ...prev, address: e.target.value }))}
                />
                <MapPin size={16} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--text-secondary)' }} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Register Account
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <button onClick={() => { setIsLoginView(true); setSignupError(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-family)' }}>
              Sign in here
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
