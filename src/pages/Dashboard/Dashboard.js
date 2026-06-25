import { useState, useEffect, useCallback } from 'react';
import { getAllZones } from '../../api/zonesApi';
import { getAlerts } from '../../api/alertsApi';
import Navbar from '../../components/layout/Navbar';
import { getRiskLabel } from '../../utils/riskColors';
import './Dashboard.css';

const StatCard = ({ number, label, color, icon }) => (
  <div className="stat-card" style={{ borderTopColor: color }}>
    <div className="stat-card-top">
      <div className="stat-icon" style={{ background: color + '20', color }}>{icon}</div>
    </div>
    <div className="stat-number" style={{ color }}>{number}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const Dashboard = ({ onMenuToggle }) => {
  const [zones, setZones] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [stats, setStats] = useState({
    total: 0, safe: 0, caution: 0, danger: 0, critical: 0
  });

  const fetchData = useCallback(async () => {
    try {
      const [zonesData, alertsData] = await Promise.all([
        getAllZones(),
        getAlerts()
      ]);
      const districts = zonesData.districts || [];
      setZones(districts);
      setAlerts(alertsData.alerts || []);
      setLastUpdated(new Date());
      setStats({
        total: districts.length,
        safe: districts.filter(d => d.risk_level === 'safe').length,
        caution: districts.filter(d => d.risk_level === 'caution').length,
        danger: districts.filter(d => d.risk_level === 'danger').length,
        critical: districts.filter(d => d.risk_level === 'critical').length,
      });
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const countries = ['all', ...new Set(zones.map(z => z.country_name))];

  const filteredZones = zones.filter(z => {
    const matchSearch = z.name.toLowerCase().includes(search.toLowerCase()) ||
                        z.region_name.toLowerCase().includes(search.toLowerCase());
    const matchCountry = countryFilter === 'all' || z.country_name === countryFilter;
    const matchRisk = riskFilter === 'all' || z.risk_level === riskFilter;
    return matchSearch && matchCountry && matchRisk;
  });

  if (loading) return (
    <div className="page-content">
      <Navbar title="NFEWS Dashboard" subtitle="National Flood Early Warning System" onRefresh={fetchData} onMenuToggle={onMenuToggle} />
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading NFEWS data...</p>
      </div>
    </div>
  );

  return (
    <div className="page-content">
      <Navbar
        title="NFEWS Dashboard"
        subtitle="National Flood Early Warning System — West Africa"
        onRefresh={fetchData}
        onMenuToggle={onMenuToggle}
      />

      <div className="dashboard-body">

        <div className="dashboard-header">
          <div>
            <h2 className="dashboard-heading">Overview</h2>
            {lastUpdated && (
              <p className="last-updated">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          {alerts.length > 0 && (
            <div className="active-alert-banner">
              <span className="alert-banner-dot"></span>
              <span>{alerts.length} Active Alert{alerts.length > 1 ? 's' : ''} — Immediate Attention Required</span>
            </div>
          )}
        </div>

        <div className="stats-grid">
          <StatCard number={stats.total} label="Total Districts" color="#0ea5e9" icon="◉" />
          <StatCard number={stats.critical} label="Critical" color="#dc2626" icon="🚨" />
          <StatCard number={stats.danger} label="Danger" color="#ef4444" icon="⚠️" />
          <StatCard number={stats.caution} label="Caution" color="#f59e0b" icon="⚡" />
          <StatCard number={stats.safe} label="Safe" color="#22c55e" icon="✔" />
          <StatCard number={alerts.length} label="Active Alerts" color="#8b5cf6" icon="🔔" />
        </div>

        {alerts.length > 0 && (
          <div className="dashboard-section">
            <div className="section-header">
              <h3 className="section-title">🚨 Active Alerts</h3>
              <span className="section-count">{alerts.length} alert{alerts.length > 1 ? 's' : ''}</span>
            </div>
            <div className="alerts-list">
              {alerts.map(alert => (
                <div key={alert.id} className={`alert-card alert-${alert.risk_level}`}>
                  <div className="alert-card-left">
                    <div className="alert-card-icon">
                      {alert.risk_level === 'critical' ? '🚨' :
                       alert.risk_level === 'danger' ? '⚠️' : '⚡'}
                    </div>
                    <div className="alert-card-info">
                      <div className="alert-card-location">
                        {alert.district_name}
                        <span className="alert-card-region">
                          {alert.region_name}, {alert.country_name}
                        </span>
                      </div>
                      <p className="alert-card-message">{alert.message}</p>
                      <span className="alert-card-time">
                        {new Date(alert.created_at).toLocaleString()} · via {alert.triggered_by}
                      </span>
                    </div>
                  </div>
                  <div className="alert-card-right">
                    <span className={`badge badge-${alert.risk_level}`}>
                      {getRiskLabel(alert.risk_level)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title">📍 Districts Monitor</h3>
            <span className="section-count">{filteredZones.length} of {zones.length}</span>
          </div>

          <div className="table-filters">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search district or region..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <select className="filter-select" value={countryFilter} onChange={e => setCountryFilter(e.target.value)}>
              {countries.map(c => (
                <option key={c} value={c}>{c === 'all' ? 'All Countries' : c}</option>
              ))}
            </select>
            <select className="filter-select" value={riskFilter} onChange={e => setRiskFilter(e.target.value)}>
              <option value="all">All Risk Levels</option>
              <option value="critical">Critical</option>
              <option value="danger">Danger</option>
              <option value="caution">Caution</option>
              <option value="safe">Safe</option>
            </select>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>District</th>
                  <th>Region</th>
                  <th>Country</th>
                  <th>Risk Level</th>
                  <th>Rainfall Threshold</th>
                  <th>Water Level Threshold</th>
                </tr>
              </thead>
              <tbody>
                {filteredZones.map((zone, index) => (
                  <tr key={zone.id}>
                    <td className="row-num">{index + 1}</td>
                    <td className="district-name">{zone.name}</td>
                    <td>{zone.region_name}</td>
                    <td><span className="country-tag">{zone.country_name}</span></td>
                    <td>
                      <span className={`badge badge-${zone.risk_level}`}>
                        {getRiskLabel(zone.risk_level)}
                      </span>
                    </td>
                    <td className="threshold-val">🌧️ {zone.rainfall_threshold_mm} mm</td>
                    <td className="threshold-val">💧 {zone.water_level_threshold_m} m</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredZones.length === 0 && (
              <div className="table-empty"><p>No districts found matching your filters.</p></div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;