import { useState, useEffect, useCallback } from 'react';
import { getAllZones } from '../../api/zonesApi';
import Navbar from '../../components/layout/Navbar';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import './Weather.css';

const BASE_URL = '' + (process.env.REACT_APP_API_URL || 'https://nfews-backend-production.up.railway.app/api') + '';

const WeatherIcon = ({ description }) => {
  const icons = {
    'clear sky': '☀️', 'few clouds': '🌤️', 'scattered clouds': '⛅',
    'broken clouds': '☁️', 'overcast clouds': '☁️', 'light rain': '🌦️',
    'moderate rain': '🌧️', 'heavy rain': '⛈️', 'heavy intensity rain': '⛈️',
    'drizzle': '🌦️', 'thunderstorm': '⛈️', 'snow': '❄️', 'mist': '🌫️',
    'fog': '🌫️', 'haze': '🌫️',
  };
  return <span>{icons[description] || '🌡️'}</span>;
};

const RiskBadge = ({ level }) => {
  const config = {
    safe:     { label: '✅ Safe',     className: 'weather-risk-safe' },
    caution:  { label: '⚡ Caution',  className: 'weather-risk-caution' },
    danger:   { label: '⚠️ Danger',   className: 'weather-risk-danger' },
    critical: { label: '🚨 Critical', className: 'weather-risk-critical' },
  };
  const c = config[level] || config.safe;
  return <span className={`weather-risk-badge ${c.className}`}>{c.label}</span>;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="weather-tooltip">
        <p className="tooltip-time">{label}</p>
        <p style={{ color: '#38bdf8' }}>🌧️ Rain: <strong>{payload[0]?.value}mm</strong></p>
        {payload[1] && <p style={{ color: '#f59e0b' }}>🌡️ Temp: <strong>{payload[1]?.value}°C</strong>}
        </p>}
      </div>
    );
  }
  return null;
};

const Weather = () => {
  const [zones, setZones] = useState([]);
  const [selectedId, setSelectedId] = useState(47);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const data = await getAllZones('GH');
        setZones((data.districts || []).slice(0, 20));
      } catch (err) {
        console.error('Failed to fetch zones:', err);
      }
    };
    fetchZones();
  }, []);

  const fetchWeather = useCallback(async (id, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/weather/index.php?district_id=${id}`);
      setWeather(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch weather:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather(selectedId);
    const interval = setInterval(() => fetchWeather(selectedId, true), 300000);
    return () => clearInterval(interval);
  }, [selectedId, fetchWeather]);

  const handleDistrictChange = (id) => {
    setSelectedId(id);
    setWeather(null);
  };

  return (
    <div className="page-content">
      <Navbar
        title="Weather Monitor"
        subtitle="Real-time rainfall & weather data — West Africa"
      />
      <div className="weather-body">

        {/* Toolbar */}
        <div className="weather-toolbar">
          <div className="weather-district-select-wrap">
            <span className="weather-select-icon">📍</span>
            <select
              className="weather-district-select"
              value={selectedId}
              onChange={e => handleDistrictChange(Number(e.target.value))}
            >
              {zones.map(z => (
                <option key={z.id} value={z.id}>
                  {z.name} — {z.region_name}
                </option>
              ))}
            </select>
          </div>
          <button
            className="weather-refresh-btn"
            onClick={() => fetchWeather(selectedId, true)}
            disabled={refreshing}
          >
            {refreshing ? '⏳ Refreshing...' : '↻ Refresh'}
          </button>
          {lastUpdated && (
            <span className="weather-last-updated">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        {(loading && !weather) ? (
          <div className="loading-screen">
            <div className="spinner"></div>
            <p>Fetching weather data...</p>
          </div>
        ) : weather ? (
          <>
            {/* Mock Data Notice */}
            {weather.source === 'mock_data' && (
              <div className="weather-notice">
                ℹ️ {weather.note}
              </div>
            )}

            {/* Current Weather Hero */}
            <div className="weather-hero">
              <div className="weather-hero-bg"></div>
              <div className="weather-hero-content">
                <div className="weather-hero-left">
                  <div className="weather-hero-location">
                    <h2>{weather.district}</h2>
                    <p>{weather.region}, {weather.country}</p>
                    <p className="weather-coords">
                      🌐 {parseFloat(weather.lat).toFixed(4)}°N, {parseFloat(weather.lng).toFixed(4)}°E
                    </p>
                  </div>
                  <div className="weather-hero-temp">
                    <span className="weather-main-icon">
                      <WeatherIcon description={weather.current.description} />
                    </span>
                    <span className="weather-temp-value">{weather.current.temp}°C</span>
                  </div>
                  <p className="weather-description">
                    {weather.current.description?.charAt(0).toUpperCase() + weather.current.description?.slice(1)}
                  </p>
                  <p className="weather-feels">Feels like {weather.current.feels_like}°C</p>
                </div>
                <div className="weather-hero-right">
                  <RiskBadge level={weather.risk_assessment.risk_level} />
                  <div className="weather-stats-grid">
                    {[
                      { icon: '💧', label: 'Current Rainfall', value: `${weather.current.rainfall_mm}mm/h` },
                      { icon: '💦', label: 'Humidity',          value: `${weather.current.humidity}%` },
                      { icon: '💨', label: 'Wind Speed',        value: `${weather.current.wind_speed}m/s` },
                      { icon: '👁️', label: 'Visibility',        value: `${(weather.current.visibility / 1000).toFixed(1)}km` },
                    ].map((s, i) => (
                      <div key={i} className="weather-stat">
                        <span className="weather-stat-icon">{s.icon}</span>
                        <div>
                          <div className="weather-stat-label">{s.label}</div>
                          <div className="weather-stat-value">{s.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="weather-risk-card">
              <div className="weather-risk-header">
                <h3>⚡ Flood Risk Assessment</h3>
                <RiskBadge level={weather.risk_assessment.risk_level} />
              </div>
              <div className="weather-risk-body">
                <div className="weather-risk-stats">
                  <div className="weather-risk-stat">
                    <div className="weather-risk-stat-label">Forecast Rainfall (24h)</div>
                    <div className="weather-risk-stat-value" style={{ color: '#38bdf8' }}>
                      {weather.risk_assessment.total_forecast_rain}mm
                    </div>
                  </div>
                  <div className="weather-risk-stat">
                    <div className="weather-risk-stat-label">District Threshold</div>
                    <div className="weather-risk-stat-value" style={{ color: '#f59e0b' }}>
                      {weather.risk_assessment.rainfall_threshold}mm
                    </div>
                  </div>
                  <div className="weather-risk-stat">
                    <div className="weather-risk-stat-label">Threshold Usage</div>
                    <div className="weather-risk-stat-value" style={{
                      color: weather.risk_assessment.total_forecast_rain >= weather.risk_assessment.rainfall_threshold
                        ? '#dc2626' : '#22c55e'
                    }}>
                      {Math.min(
                        (weather.risk_assessment.total_forecast_rain / weather.risk_assessment.rainfall_threshold * 100),
                        100
                      ).toFixed(0)}%
                    </div>
                  </div>
                </div>
                <div className="weather-risk-progress">
                  <div
                    className="weather-risk-progress-fill"
                    style={{
                      width: `${Math.min(
                        (weather.risk_assessment.total_forecast_rain / weather.risk_assessment.rainfall_threshold * 100),
                        100
                      )}%`,
                      background: weather.risk_assessment.risk_level === 'critical' ? '#dc2626' :
                                  weather.risk_assessment.risk_level === 'danger'   ? '#ef4444' :
                                  weather.risk_assessment.risk_level === 'caution'  ? '#f59e0b' : '#22c55e'
                    }}
                  ></div>
                </div>
                <p className="weather-risk-recommendation">
                  💬 {weather.risk_assessment.recommendation}
                </p>
              </div>
            </div>

            {/* Forecast Chart */}
            <div className="weather-chart-card">
              <div className="weather-chart-header">
                <h3>🌧️ 24-Hour Rainfall Forecast</h3>
                <span className="weather-chart-sub">{weather.forecast.length} time periods</span>
              </div>
              <div className="weather-chart-wrapper">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={weather.forecast} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v}mm`} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine
                      y={weather.risk_assessment.rainfall_threshold / weather.forecast.length}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      label={{ value: 'Threshold', fill: '#ef4444', fontSize: 11 }}
                    />
                    <Bar dataKey="rain" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Rainfall" />
                    <Bar dataKey="temp" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Temperature" opacity={0.6} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Forecast Table */}
            <div className="weather-forecast-card">
              <div className="weather-chart-header">
                <h3>📋 Detailed Forecast</h3>
              </div>
              <div className="weather-forecast-grid">
                {weather.forecast.map((f, i) => (
                  <div key={i} className="forecast-item">
                    <div className="forecast-time">{f.time}</div>
                    <div className="forecast-icon">
                      <WeatherIcon description={f.description} />
                    </div>
                    <div className="forecast-rain">🌧️ {f.rain}mm</div>
                    <div className="forecast-temp">🌡️ {f.temp}°C</div>
                    <div className="forecast-desc">{f.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="weather-empty">
            <span>🌤️</span>
            <p>Select a district to view weather data</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;