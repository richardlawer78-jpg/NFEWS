 import { useState, useEffect, useCallback } from 'react';
import { getAlerts } from '../../api/alertsApi';
import Navbar from '../../components/layout/Navbar';
import { getRiskLabel, getRiskColor } from '../../utils/riskColors';
import './Alerts.css';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await getAlerts();
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const filtered = filter === 'all'
    ? alerts
    : alerts.filter(a => a.risk_level === filter);

  if (loading) return <div className="loading">Loading alerts...</div>;

  return (
    <div className="page-content">
      <Navbar title="Active Alerts" onRefresh={fetchAlerts} />
      <div className="alerts-body">

        <div className="alerts-toolbar">
          <h2>🚨 Flood Alerts — West Africa</h2>
          <div className="filter-buttons">
            {['all', 'critical', 'danger', 'caution'].map(level => (
              <button
                key={level}
                className={`filter-btn ${filter === level ? 'active' : ''}`}
                onClick={() => setFilter(level)}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="no-alerts">
            <span>✅</span>
            <p>No alerts for this filter.</p>
          </div>
        ) : (
          <div className="alerts-grid">
            {filtered.map(alert => (
              <div key={alert.id} className={`alert-item ${alert.risk_level}`}>
                <div className="alert-item-header">
                  <span className="alert-item-badge" style={{
                    background: getRiskColor(alert.risk_level),
                    color: 'white'
                  }}>
                    {getRiskLabel(alert.risk_level)}
                  </span>
                  <span className="alert-item-trigger">via {alert.triggered_by}</span>
                </div>
                <h3 className="alert-item-location">📍 {alert.district_name}</h3>
                <p className="alert-item-region">{alert.region_name} — {alert.country_name}</p>
                <p className="alert-item-message">{alert.message}</p>
                <span className="alert-item-time">
                  🕐 {new Date(alert.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;