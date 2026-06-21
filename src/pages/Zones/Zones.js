 import { useState, useEffect, useRef } from 'react';
import { getAllZones } from '../../api/zonesApi';
import Navbar from '../../components/layout/Navbar';
import { getRiskLabel, getRiskColor } from '../../utils/riskColors';
import './Zones.css';

const RiskBar = ({ level, threshold }) => {
  const percent = Math.min((level / threshold) * 100, 100);
  const color = percent >= 100 ? '#dc2626' : percent >= 85 ? '#ef4444' : percent >= 65 ? '#f59e0b' : '#22c55e';
  return (
    <div className="risk-bar-track">
      <div className="risk-bar-fill" style={{ width: `${percent}%`, background: color }}></div>
    </div>
  );
};

const ZoneCard = ({ zone, index }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const riskColor = getRiskColor(zone.risk_level);

  return (
    <div
      ref={ref}
      className={`zone-card ${visible ? 'zone-card-visible' : ''}`}
      style={{ animationDelay: `${(index % 12) * 40}ms` }}
    >
      {/* Top accent bar */}
      <div className="zone-card-accent" style={{ background: riskColor }}></div>

      <div className="zone-card-inner">
        {/* Header */}
        <div className="zone-card-head">
          <div className="zone-card-title-group">
            <h3 className="zone-card-title">{zone.name}</h3>
            <div className="zone-card-location">
              <span className="location-pin">📍</span>
              <span>{zone.region_name}</span>
              <span className="location-sep">·</span>
              <span className="location-country">{zone.country_name}</span>
            </div>
          </div>
          <span className={`badge badge-${zone.risk_level}`}>
            {getRiskLabel(zone.risk_level)}
          </span>
        </div>

        {/* Divider */}
        <div className="zone-card-divider"></div>

        {/* Thresholds */}
        <div className="zone-card-metrics">
          <div className="zone-metric">
            <div className="zone-metric-header">
              <span className="zone-metric-icon">🌧️</span>
              <span className="zone-metric-label">Rainfall Threshold</span>
            </div>
            <div className="zone-metric-value">{zone.rainfall_threshold_mm} <span>mm</span></div>
            <RiskBar level={zone.rainfall_threshold_mm} threshold={100} />
          </div>
          <div className="zone-metric">
            <div className="zone-metric-header">
              <span className="zone-metric-icon">💧</span>
              <span className="zone-metric-label">Water Level Limit</span>
            </div>
            <div className="zone-metric-value">{zone.water_level_threshold_m} <span>m</span></div>
            <RiskBar level={zone.water_level_threshold_m} threshold={3} />
          </div>
        </div>

        {/* Footer */}
        <div className="zone-card-footer">
          <div className="zone-coords">
            <span>🌐</span>
            <span>{parseFloat(zone.lat).toFixed(4)}°N, {parseFloat(zone.lng).toFixed(4)}°E</span>
          </div>
          <div className="zone-id">ID #{zone.id}</div>
        </div>
      </div>
    </div>
  );
};

const Zones = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [view, setView] = useState('grid');
  const [sortBy, setSortBy] = useState('risk');

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const data = await getAllZones();
        setZones(data.districts || []);
      } catch (err) {
        console.error('Failed to fetch zones:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchZones();
  }, []);

  const riskOrder = { critical: 0, danger: 1, caution: 2, safe: 3 };
  const countries = ['all', ...new Set(zones.map(z => z.country_name))];

  const filtered = zones
    .filter(z => {
      const matchSearch =
        z.name.toLowerCase().includes(search.toLowerCase()) ||
        z.region_name.toLowerCase().includes(search.toLowerCase()) ||
        z.country_name.toLowerCase().includes(search.toLowerCase());
      const matchCountry = countryFilter === 'all' || z.country_name === countryFilter;
      const matchRisk = riskFilter === 'all' || z.risk_level === riskFilter;
      return matchSearch && matchCountry && matchRisk;
    })
    .sort((a, b) => {
      if (sortBy === 'risk') return riskOrder[a.risk_level] - riskOrder[b.risk_level];
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'country') return a.country_name.localeCompare(b.country_name);
      return 0;
    });

  const stats = {
    total: zones.length,
    critical: zones.filter(z => z.risk_level === 'critical').length,
    danger: zones.filter(z => z.risk_level === 'danger').length,
    caution: zones.filter(z => z.risk_level === 'caution').length,
    safe: zones.filter(z => z.risk_level === 'safe').length,
  };

  if (loading) return (
    <div className="page-content">
      <Navbar title="Flood Zones" subtitle="All monitored districts across West Africa" />
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading zones data...</p>
      </div>
    </div>
  );

  return (
    <div className="page-content">
      <Navbar
        title="Flood Zones"
        subtitle="All monitored districts across West Africa"
      />
      <div className="zones-body">

        {/* Stats */}
        <div className="zones-stats">
          {[
            { label: 'Total Zones',  value: stats.total,    color: '#0ea5e9', risk: 'all' },
            { label: 'Critical',     value: stats.critical, color: '#dc2626', risk: 'critical' },
            { label: 'Danger',       value: stats.danger,   color: '#ef4444', risk: 'danger' },
            { label: 'Caution',      value: stats.caution,  color: '#f59e0b', risk: 'caution' },
            { label: 'Safe',         value: stats.safe,     color: '#22c55e', risk: 'safe' },
          ].map((s, i) => (
            <div
              key={i}
              className={`zones-stat-card ${riskFilter === s.risk ? 'zones-stat-active' : ''}`}
              style={{ '--accent': s.color }}
              onClick={() => setRiskFilter(s.risk)}
            >
              <div className="zones-stat-icon" style={{ color: s.color }}>
                {i === 0 ? '◉' : i === 1 ? '🚨' : i === 2 ? '⚠️' : i === 3 ? '⚡' : '✅'}
              </div>
              <div className="zones-stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="zones-stat-label">{s.label}</div>
              <div className="zones-stat-bar" style={{ background: s.color, width: `${(s.value / stats.total) * 100}%` }}></div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="zones-toolbar">
          <div className="zones-search-wrap">
            <span className="search-icon-inner">🔍</span>
            <input
              type="text"
              placeholder="Search by district, region or country..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="zones-search-input"
            />
            {search && (
              <button className="search-clear-btn" onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          <div className="zones-controls">
            <select className="filter-select" value={countryFilter} onChange={e => setCountryFilter(e.target.value)}>
              {countries.map(c => (
                <option key={c} value={c}>{c === 'all' ? '🌍 All Countries' : c}</option>
              ))}
            </select>

            <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="risk">Sort: Risk Level</option>
              <option value="name">Sort: Name A–Z</option>
              <option value="country">Sort: Country</option>
            </select>

            <div className="view-toggle">
              <button className={`view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')} title="Grid view">▦</button>
              <button className={`view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')} title="List view">≡</button>
            </div>
          </div>
        </div>

        {/* Results Bar */}
        <div className="zones-results-bar">
          <span>
            Showing <strong>{filtered.length}</strong> of <strong>{zones.length}</strong> districts
            {countryFilter !== 'all' && <span className="filter-tag">🌍 {countryFilter}</span>}
            {riskFilter !== 'all' && <span className="filter-tag" style={{ background: getRiskColor(riskFilter) + '20', color: getRiskColor(riskFilter) }}>{riskFilter}</span>}
          </span>
          {(search || countryFilter !== 'all' || riskFilter !== 'all') && (
            <button className="clear-all-btn" onClick={() => { setSearch(''); setCountryFilter('all'); setRiskFilter('all'); }}>
              ✕ Clear all filters
            </button>
          )}
        </div>

        {/* Grid View */}
        {view === 'grid' && (
          <div className="zones-grid">
            {filtered.map((zone, index) => (
              <ZoneCard key={zone.id} zone={zone} index={index} />
            ))}
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <div className="zones-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>District</th>
                  <th>Region</th>
                  <th>Country</th>
                  <th>Risk Level</th>
                  <th>Rainfall Threshold</th>
                  <th>Water Level</th>
                  <th>Coordinates</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((zone, index) => (
                  <tr key={zone.id} className="zones-table-row">
                    <td className="row-num">{index + 1}</td>
                    <td className="district-name">{zone.name}</td>
                    <td>{zone.region_name}</td>
                    <td><span className="country-tag">{zone.country_name}</span></td>
                    <td>
                      <span className={`badge badge-${zone.risk_level}`}>
                        {getRiskLabel(zone.risk_level)}
                      </span>
                    </td>
                    <td className="threshold-val">🌧️ {zone.rainfall_threshold_mm}mm</td>
                    <td className="threshold-val">💧 {zone.water_level_threshold_m}m</td>
                    <td className="coords-val">
                      {parseFloat(zone.lat).toFixed(3)}°, {parseFloat(zone.lng).toFixed(3)}°
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="table-empty">No districts found.</div>
            )}
          </div>
        )}

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="zones-empty">
            <div className="zones-empty-icon">🔍</div>
            <h3>No districts found</h3>
            <p>Try adjusting your search or filters</p>
            <button
              className="btn btn-primary"
              onClick={() => { setSearch(''); setCountryFilter('all'); setRiskFilter('all'); }}
            >
              Clear all filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Zones;