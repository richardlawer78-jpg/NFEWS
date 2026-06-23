import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import axios from 'axios';
import './Profile.css';

const BASE_URL = '' + (process.env.REACT_APP_API_URL || 'https://nfews-backend-production.up.railway.app/api') + '';

const Profile = () => {
  const { user, login, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/auth/profile.php?user_id=${user.id}`);
        setProfile(res.data);
        setForm({ name: res.data.name, phone: res.data.phone || '' });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    setError('');
    setSuccess('');
    if (!form.name) { setError('Name is required.'); return; }
    setSaving(true);
    try {
      await axios.put(`${BASE_URL}/auth/profile.php`, {
        user_id: user.id,
        name: form.name,
        phone: form.phone,
      });
      setProfile(prev => ({ ...prev, name: form.name, phone: form.phone }));
      login({ ...user, name: form.name }, token);
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');
    if (!passwordForm.current_password || !passwordForm.new_password) {
      setError('Please fill in all password fields.');
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('New passwords do not match.');
      return;
    }
    if (passwordForm.new_password.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    setSaving(true);
    try {
      await axios.put(`${BASE_URL}/auth/profile.php`, {
        user_id: user.id,
        name: profile.name,
        phone: profile.phone || '',
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setSuccess('Password changed successfully!');
      setChangingPassword(false);
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { label: '⚙️ Admin', class: 'role-admin' },
      district_officer: { label: '🏛️ District Officer', class: 'role-officer' },
      citizen: { label: '👤 Citizen', class: 'role-citizen' },
    };
    return badges[role] || { label: role, class: 'role-citizen' };
  };

  if (loading) return (
    <div className="page-content">
      <Navbar title="My Profile" subtitle="Account settings & details" />
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    </div>
  );

  const roleBadge = getRoleBadge(profile?.role);

  return (
    <div className="page-content">
      <Navbar title="My Profile" subtitle="Account settings & details" />
      <div className="profile-body">

        {/* Profile Header Card */}
        <div className="profile-hero">
          <div className="profile-hero-bg"></div>
          <div className="profile-hero-content">
            <div className="profile-avatar-large">
              {profile?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="profile-hero-info">
              <h2 className="profile-hero-name">{profile?.name}</h2>
              <p className="profile-hero-email">{profile?.email}</p>
              <div className="profile-hero-meta">
                <span className={`role-badge ${roleBadge.class}`}>{roleBadge.label}</span>
                {profile?.region_name && (
                  <span className="profile-region">
                    📍 {profile.region_name}{profile.country_name ? `, ${profile.country_name}` : ''}
                  </span>
                )}
                <span className="profile-joined">
                  🗓️ Joined {new Date(profile?.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-grid">

          {/* Account Details */}
          <div className="profile-card">
            <div className="profile-card-header">
              <h3>👤 Account Details</h3>
              {!editing && (
                <button className="btn btn-primary" onClick={() => { setEditing(true); setSuccess(''); setError(''); }}>
                  ✏️ Edit Profile
                </button>
              )}
            </div>

            {success && <div className="profile-success">✅ {success}</div>}
            {error && <div className="profile-error">⚠ {error}</div>}

            {editing ? (
              <div className="profile-form">
                <div className="profile-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="profile-field">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+233 XX XXX XXXX"
                  />
                </div>
                <div className="profile-field">
                  <label>Email Address</label>
                  <input type="email" value={profile?.email} disabled className="input-disabled" />
                  <span className="field-hint">Email cannot be changed</span>
                </div>
                <div className="profile-actions">
                  <button className="btn btn-primary" onClick={handleSaveProfile} disabled={saving}>
                    {saving ? '⏳ Saving...' : '💾 Save Changes'}
                  </button>
                  <button className="btn-cancel" onClick={() => { setEditing(false); setError(''); setForm({ name: profile.name, phone: profile.phone || '' }); }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-details">
                {[
                  { label: 'Full Name',    value: profile?.name,        icon: '👤' },
                  { label: 'Email',        value: profile?.email,       icon: '📧' },
                  { label: 'Phone',        value: profile?.phone || 'Not set', icon: '📱' },
                  { label: 'Role',         value: profile?.role,        icon: '🛡️' },
                  { label: 'Region',       value: profile?.region_name || 'Not set', icon: '📍' },
                  { label: 'Country',      value: profile?.country_name || 'Not set', icon: '🌍' },
                ].map((item, i) => (
                  <div key={i} className="detail-row">
                    <span className="detail-icon">{item.icon}</span>
                    <div className="detail-content">
                      <span className="detail-label">{item.label}</span>
                      <span className="detail-value">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="profile-right">

            {/* Change Password */}
            <div className="profile-card">
              <div className="profile-card-header">
                <h3>🔐 Change Password</h3>
                {!changingPassword && (
                  <button className="btn-outline" onClick={() => { setChangingPassword(true); setSuccess(''); setError(''); }}>
                    Change
                  </button>
                )}
              </div>

              {changingPassword ? (
                <div className="profile-form">
                  {error && <div className="profile-error">⚠ {error}</div>}
                  {success && <div className="profile-success">✅ {success}</div>}
                  <div className="profile-field">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.current_password}
                      onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="profile-field">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      placeholder="Min. 6 characters"
                    />
                  </div>
                  <div className="profile-field">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={e => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                      placeholder="Repeat new password"
                    />
                  </div>
                  <div className="profile-actions">
                    <button className="btn btn-primary" onClick={handleChangePassword} disabled={saving}>
                      {saving ? '⏳ Updating...' : '🔐 Update Password'}
                    </button>
                    <button className="btn-cancel" onClick={() => { setChangingPassword(false); setError(''); setPasswordForm({ current_password: '', new_password: '', confirm_password: '' }); }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="password-hint">
                  Keep your account secure by using a strong, unique password that you don't use elsewhere.
                </p>
              )}
            </div>

            {/* Account Stats */}
            <div className="profile-card">
              <div className="profile-card-header">
                <h3>📊 Account Info</h3>
              </div>
              <div className="account-stats">
                {[
                  { label: 'Account Type',  value: profile?.role?.replace('_', ' '), icon: '🛡️' },
                  { label: 'Account Status', value: 'Active',    icon: '✅' },
                  { label: 'Member Since',  value: new Date(profile?.created_at).toLocaleDateString('en-GB'), icon: '🗓️' },
                  { label: 'System',        value: 'NFEWS v1.0', icon: '🌊' },
                ].map((stat, i) => (
                  <div key={i} className="account-stat-row">
                    <span className="account-stat-icon">{stat.icon}</span>
                    <div>
                      <div className="account-stat-label">{stat.label}</div>
                      <div className="account-stat-value">{stat.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;