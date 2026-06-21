import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const BASE = 'http://localhost/NFEWS/nfews-backend/api';

const Admin = () => {
  const { user, token } = useAuth();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, aRes] = await Promise.all([
        axios.get(BASE + '/admin/users.php', { headers: { Authorization: 'Bearer ' + token } }),
        axios.get(BASE + '/alerts/index.php')
      ]);
      setUsers(uRes.data.users || []);
      setAlerts(aRes.data.alerts || []);
    } catch (err) {
      console.error('Admin fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleUser = async (id, currentStatus) => {
    try {
      await axios.post(BASE + '/admin/toggle_user.php',
        { user_id: id, is_active: currentStatus ? 0 : 1 },
        { headers: { Authorization: 'Bearer ' + token } }
      );
      setMessage('User updated!');
      fetchData();
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('Failed to update user.');
    }
  };

  const deleteAlert = async (id) => {
    if (!window.confirm('Delete this alert?')) return;
    try {
      await axios.delete(BASE + '/admin/delete_alert.php',
        { data: { alert_id: id }, headers: { Authorization: 'Bearer ' + token } }
      );
      setMessage('Alert deleted!');
      fetchData();
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('Failed to delete alert.');
    }
  };

  if (user?.role !== 'admin') return (
    <div className="page-content">
      <Navbar title="Admin Panel" />
      <div className="admin-denied">
        <div className="denied-icon">🔒</div>
        <h2>Access Denied</h2>
        <p>Only administrators can access this page.</p>
      </div>
    </div>
  );

  return (
    <div className="page-content">
      <Navbar title="Admin Panel" subtitle="System Management - NFEWS" onRefresh={fetchData} />
      <div className="admin-body">

        {message && <div className="admin-message">{message}</div>}

        <div className="admin-tabs">
          {['users', 'alerts'].map(t => (
            <button key={t} className={'admin-tab ' + (tab === t ? 'active' : '')} onClick={() => setTab(t)}>
              {t === 'users' ? '👥 Users' : '🚨 Alerts'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="admin-loading"><div className="spinner"></div><p>Loading...</p></div>
        ) : tab === 'users' ? (
          <div className="admin-section">
            <div className="section-header">
              <h3>👥 Registered Users</h3>
              <span className="section-count">{users.length} total</span>
            </div>
            <div className="admin-table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id}>
                      <td>{i + 1}</td>
                      <td className="district-name">{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className={'role-badge role-' + u.role}>{u.role}</span></td>
                      <td><span className={'status-badge ' + (u.is_active ? 'active' : 'inactive')}>{u.is_active ? '✅ Active' : '❌ Inactive'}</span></td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className={'action-btn ' + (u.is_active ? 'btn-disable' : 'btn-enable')} onClick={() => toggleUser(u.id, u.is_active)}>
                          {u.is_active ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="admin-section">
            <div className="section-header">
              <h3>🚨 All Alerts</h3>
              <span className="section-count">{alerts.length} total</span>
            </div>
            <div className="admin-table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>#</th><th>District</th><th>Country</th><th>Risk Level</th><th>Message</th><th>Date</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {alerts.map((a, i) => (
                    <tr key={a.id}>
                      <td>{i + 1}</td>
                      <td className="district-name">{a.district_name}</td>
                      <td><span className="country-tag">{a.country_name}</span></td>
                      <td><span className={'badge badge-' + a.risk_level}>{a.risk_level}</span></td>
                      <td className="alert-msg-cell">{a.message}</td>
                      <td>{new Date(a.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className="action-btn btn-delete" onClick={() => deleteAlert(a.id)}>🗑 Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
