import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../context/AuthContext';
import './Notifications.css';

const BASE = 'https://nfews-backend-production.up.railway.app/api';

const Notifications = () => {
  const { user, token } = useAuth();
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [district, setDistrict] = useState('Accra Metropolitan');
  const [riskLevel, setRiskLevel] = useState('danger');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const riskMessages = {
    caution: 'NFEWS CAUTION: Significant rainfall forecast in {district}. Monitor water levels closely.',
    danger:  'NFEWS DANGER: High flood risk in {district}. Avoid low-lying areas and waterways.',
    critical:'NFEWS CRITICAL ALERT: Extreme flood risk in {district}. Evacuate immediately if in flood-prone areas!',
  };

  useEffect(() => {
    setMessage(riskMessages[riskLevel]?.replace('{district}', district) || '');
  }, [riskLevel, district]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await axios.get(`${BASE}/notifications/logs.php`, {
        headers: { Authorization: 'Bearer ' + token }
      });
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const sendSMS = async () => {
    if (!phone || !message) return;
    setSending(true);
    setResult(null);
    try {
      const res = await axios.post(`${BASE}/notifications/send_sms.php`, {
        phone, message, district, risk_level: riskLevel
      });
      setResult({ success: res.data.success, msg: res.data.success ? 'SMS sent successfully!' : 'Failed to send SMS.' });
      if (res.data.success) {
        setPhone('');
        fetchLogs();
      }
    } catch (err) {
      setResult({ success: false, msg: 'Error sending SMS.' });
    } finally {
      setSending(false);
    }
  };

  if (user?.role !== 'admin') return (
    <div className="page-content">
      <Navbar title="Notifications" />
      <div className="notif-denied">
        <div>🔒</div>
        <h2>Access Denied</h2>
        <p>Only administrators can send alerts.</p>
      </div>
    </div>
  );

  return (
    <div className="page-content">
      <Navbar title="Notifications" subtitle="SMS Alert System — NFEWS" />
      <div className="notif-body">

        {/* Send SMS Card */}
        <div className="notif-card">
          <div className="notif-card-header">
            <h3>📱 Send SMS Alert</h3>
            <span className="notif-badge">Powered by Arkesel</span>
          </div>
          <div className="notif-form">

            <div className="notif-row">
              <div className="notif-field">
                <label>District</label>
                <input
                  type="text"
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  placeholder="e.g. Accra Metropolitan"
                />
              </div>
              <div className="notif-field">
                <label>Risk Level</label>
                <select value={riskLevel} onChange={e => setRiskLevel(e.target.value)}>
                  <option value="caution">⚡ Caution</option>
                  <option value="danger">⚠️ Danger</option>
                  <option value="critical">🚨 Critical</option>
                </select>
              </div>
            </div>

            <div className="notif-field">
              <label>Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 0244000000"
              />
            </div>

            <div className="notif-field">
              <label>Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                placeholder="Enter alert message..."
              />
              <span className="notif-char-count">{message.length} / 160 chars</span>
            </div>

            {result && (
              <div className={`notif-result ${result.success ? 'success' : 'error'}`}>
                {result.success ? '✅' : '❌'} {result.msg}
              </div>
            )}

            <button
              className="notif-send-btn"
              onClick={sendSMS}
              disabled={sending || !phone || !message}
            >
              {sending ? '⏳ Sending...' : '🚀 Send SMS Alert'}
            </button>
          </div>
        </div>

        {/* SMS Logs */}
        <div className="notif-card">
          <div className="notif-card-header">
            <h3>📋 SMS History</h3>
            <button className="notif-refresh-btn" onClick={fetchLogs}>↻ Refresh</button>
          </div>
          {loadingLogs ? (
            <div className="notif-loading"><div className="spinner"></div><p>Loading logs...</p></div>
          ) : logs.length === 0 ? (
            <div className="notif-empty">No SMS sent yet.</div>
          ) : (
            <div className="notif-table-wrap">
              <table className="notif-table">
                <thead>
                  <tr><th>#</th><th>Phone</th><th>District</th><th>Risk</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={log.id}>
                      <td>{i + 1}</td>
                      <td>{log.phone}</td>
                      <td>{log.district}</td>
                      <td><span className={`badge badge-${log.risk_level}`}>{log.risk_level}</span></td>
                      <td><span className={`status-badge ${log.status}`}>{log.status}</span></td>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Notifications;