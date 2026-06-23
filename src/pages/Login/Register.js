import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'citizen',
    region_id: ''
  });
  const [regions, setRegions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await axios.get('' + (process.env.REACT_APP_API_URL || 'https://nfews-backend-production.up.railway.app/api') + '/zones/index.php');
        const uniqueRegions = [];
        const seen = new Set();
        res.data.districts.forEach(d => {
          if (!seen.has(d.region_name)) {
            seen.add(d.region_name);
            uniqueRegions.push({
              id: d.region_id,
              name: `${d.region_name} (${d.country_name})`
            });
          }
        });
        setRegions(uniqueRegions);
      } catch (err) {
        console.error('Failed to fetch regions');
      }
    };
    fetchRegions();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    setError('');
    setSuccess('');

    if (!form.name || !form.email || !form.password) {
      setError('Name, email and password are required.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        '' + (process.env.REACT_APP_API_URL || 'https://nfews-backend-production.up.railway.app/api') + '/auth/register.php',
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: form.role,
          region_id: form.region_id || null
        }
      );
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg"></div>
      <div className="login-card" style={{ maxWidth: '500px' }}>
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
          <p>Create your account</p>
          <small>● WEST AFRICA REGION</small>
        </div>

        <div className="login-divider"></div>

        {error && <div className="login-error">⚠ {error}</div>}
        {success && <div className="login-success">✅ {success}</div>}

        <div className="login-form">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="+233 XX XXX XXXX"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Account Type</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="form-select"
              >
                <option value="citizen">Citizen</option>
                <option value="district_officer">District Officer</option>
              </select>
            </div>
            <div className="form-group">
              <label>Your Region / Country</label>
              <select
                name="region_id"
                value={form.region_id}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select your region</option>
                {regions.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            className="login-btn"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? '⏳ Creating Account...' : '🌊 Create Account'}
          </button>
        </div>

        <div className="login-footer">
          <p>Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--blue-light)',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;