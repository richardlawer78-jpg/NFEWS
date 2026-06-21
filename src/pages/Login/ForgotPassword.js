import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  const handleCheckEmail = async () => {
    setError('');
    if (!email) { setError('Please enter your email address.'); return; }
    setLoading(true);
    try {
      const res = await axios.post(
        'http://localhost/NFEWS/nfews-backend/api/auth/forgot_password.php',
        { email, new_password: 'temp_check_only', check_only: true }
      );
      setStep(2);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No account found with this email address.');
      } else {
        setStep(2);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        'http://localhost/NFEWS/nfews-backend/api/auth/forgot_password.php',
        { email, new_password: newPassword }
      );
      setUserName(res.data.name);
      setSuccess(res.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <p>Reset your password</p>
          <small>● WEST AFRICA REGION</small>
        </div>

        <div className="login-divider"></div>

        {/* Step Indicator */}
        <div className="steps-indicator">
          {['Verify Email', 'New Password', 'Done'].map((label, i) => (
            <div key={i} className={`step ${step > i ? 'step-done' : ''} ${step === i + 1 ? 'step-active' : ''}`}>
              <div className="step-circle">{step > i + 1 ? '✓' : i + 1}</div>
              <span className="step-label">{label}</span>
              {i < 2 && <div className={`step-line ${step > i + 1 ? 'step-line-done' : ''}`}></div>}
            </div>
          ))}
        </div>

        {error && <div className="login-error">⚠ {error}</div>}
        {success && <div className="login-success">✅ {success}</div>}

        {/* Step 1 — Enter Email */}
        {step === 1 && (
          <div className="login-form">
            <p className="forgot-desc">
              Enter the email address associated with your NFEWS account and we'll help you reset your password.
            </p>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleCheckEmail()}
              />
            </div>
            <button className="login-btn" onClick={handleCheckEmail} disabled={loading}>
              {loading ? '⏳ Verifying...' : '🔍 Verify Email'}
            </button>
          </div>
        )}

        {/* Step 2 — New Password */}
        {step === 2 && (
          <div className="login-form">
            <p className="forgot-desc">
              Email verified! Enter your new password for <strong style={{ color: 'var(--blue-light)' }}>{email}</strong>
            </p>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleResetPassword()}
              />
            </div>
            <button className="login-btn" onClick={handleResetPassword} disabled={loading}>
              {loading ? '⏳ Resetting...' : '🔐 Reset Password'}
            </button>
            <button
              className="login-btn"
              style={{ background: 'transparent', border: '1px solid var(--navy-4)', marginTop: '8px', boxShadow: 'none' }}
              onClick={() => { setStep(1); setError(''); }}
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step 3 — Success */}
        {step === 3 && (
          <div className="login-form">
            <div className="reset-success">
              <div className="reset-success-icon">🎉</div>
              <h3>Password Reset!</h3>
              <p>Your password has been successfully updated. You can now sign in with your new password.</p>
              <button
                className="login-btn"
                style={{ marginTop: '20px' }}
                onClick={() => navigate('/login')}
              >
                🔐 Go to Login
              </button>
            </div>
          </div>
        )}

        <div className="login-footer">
          <p>Remember your password?{' '}
            <Link to="/login" style={{ color: 'var(--blue-light)', textDecoration: 'none', fontWeight: 600 }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;