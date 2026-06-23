 import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        '' + (process.env.REACT_APP_API_URL || 'https://nfews-backend-production.up.railway.app/api') + '/auth/login.php',
        { email, password }
      );
      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="login-page">
      <div className="login-bg"></div>
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M3 18C3 18 5 14 8 14C11 14 11 18 14 18C17 18 17 14 20 14"
                stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M3 12C3 12 5 8 8 8C11 8 11 12 14 12C17 12 17 8 20 8"
                stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8"/>
              <path d="M3 6C3 6 5 2 8 2C11 2 11 6 14 6C17 6 17 2 20 2"
                stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.6"/>
            </svg>
          </div>
          <h1>NFEWS</h1>
          <p>National Flood Early Warning System</p>
          <small>● WEST AFRICA REGION</small>
        </div>

        <div className="login-divider"></div>

        {error && <div className="login-error">⚠ {error}</div>}

        <div className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          <div className="forgot-link-row">
            <Link to="/forgot-password" className="forgot-link">
              Forgot your password?
            </Link>
          </div>

          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? '⏳ Authenticating...' : '🔐 Sign In to NFEWS'}
          </button>
        </div>

        <div className="login-footer">
          <p>🔒 Authorized Personnel Only</p>
          <p style={{ marginTop: '10px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--blue-light)', textDecoration: 'none', fontWeight: 600 }}>
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;