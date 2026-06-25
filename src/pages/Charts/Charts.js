 import { useState, useEffect, useCallback } from 'react';
import {
 AreaChart, Area, LineChart, Line,
 XAxis, YAxis, CartesianGrid,
 Tooltip, Legend, ReferenceLine,
 ResponsiveContainer
} from 'recharts';
import { getReadings, submitReading } from '../../api/readingsApi';
import Navbar from '../../components/layout/Navbar';
import './Charts.css';

const DISTRICTS = [
 { id: 47,  name: 'Accra Metropolitan', threshold: 1.5, color: '#ef4444' },
 { id: 66,  name: 'Kasoa',              threshold: 1.2, color: '#f59e0b' },
 { id: 106, name: 'Keta Municipal',     threshold: 1.2, color: '#8b5cf6' },
];

const CustomTooltip = ({ active, payload, label }) => {
 if (active && payload && payload.length) {
   return (
     <div className="chart-tooltip">
       <p className="tooltip-time">{label}</p>
       {payload.map((entry, i) => (
         <p key={i} style={{ color: entry.color }}>
           {entry.name}: <strong>{entry.value}m</strong>
         </p>
       ))}
     </div>
   );
 }
 return null;
};

const Charts = ({ onMenuToggle }) => {
 const [allReadings, setAllReadings]       = useState({});
 const [selectedDistrict, setSelectedDistrict] = useState(47);
 const [loading, setLoading]               = useState(true);
 const [simulateLevel, setSimulateLevel]   = useState('');
 const [simResult, setSimResult]           = useState(null);
 const [simLoading, setSimLoading]         = useState(false);

 const formatReadings = (readings) =>
   (readings || [])
     .map(r => ({
       time: new Date(r.recorded_at).toLocaleDateString('en-GB', {
         month: 'short', day: 'numeric',
         hour: '2-digit', minute: '2-digit'
       }),
       level: parseFloat(r.level_m),
       district: r.district_name
     }))
     .reverse();

 const fetchAllReadings = useCallback(async () => {
   try {
     const results = {};
     for (const d of DISTRICTS) {
       const data = await getReadings(d.id);
       results[d.id] = formatReadings(data.readings);
     }
     setAllReadings(results);
   } catch (err) {
     console.error('Failed to fetch readings:', err);
   } finally {
     setLoading(false);
   }
 }, []);

 useEffect(() => {
   fetchAllReadings();
   const interval = setInterval(fetchAllReadings, 30000);
   return () => clearInterval(interval);
 }, [fetchAllReadings]);

 const currentDistrict = DISTRICTS.find(d => d.id === selectedDistrict);
 const currentReadings = allReadings[selectedDistrict] || [];
 const threshold       = currentDistrict?.threshold || 1.5;
 const latestLevel     = currentReadings.length > 0
   ? currentReadings[currentReadings.length - 1].level
   : null;
 const riskPercent = latestLevel
   ? Math.min((latestLevel / threshold) * 100, 100).toFixed(1)
   : 0;

 const getRiskStatus = (level) => {
   if (!level)                    return { label: 'NO DATA',  color: '#94a3b8' };
   if (level >= threshold)        return { label: 'CRITICAL', color: '#dc2626' };
   if (level >= threshold * 0.85) return { label: 'DANGER',   color: '#ef4444' };
   if (level >= threshold * 0.65) return { label: 'CAUTION',  color: '#f59e0b' };
   return                                { label: 'SAFE',     color: '#22c55e' };
 };

 const status = getRiskStatus(latestLevel);

 const handleSimulate = async () => {
   if (!simulateLevel) return;
   setSimLoading(true);
   setSimResult(null);
   try {
     const res = await submitReading(selectedDistrict, parseFloat(simulateLevel));
     setSimResult(res);
     const data = await getReadings(selectedDistrict);
     setAllReadings(prev => ({
       ...prev,
       [selectedDistrict]: formatReadings(data.readings)
     }));
     setSimulateLevel('');
   } catch (err) {
     console.error('Simulation failed:', err);
   } finally {
     setSimLoading(false);
   }
 };

 if (loading) return (
   <div className="page-content">
     <Navbar title="Water Level Charts" subtitle="Real-time trend analysis" onMenuToggle={onMenuToggle} />
     <div className="loading-screen">
       <div className="spinner"></div>
       <p>Loading chart data...</p>
     </div>
   </div>
 );

 return (
   <div className="page-content">
     <Navbar
       title="Water Level Charts"
       subtitle="Real-time trend analysis — West Africa"
       onMenuToggle={onMenuToggle}
     />
     <div className="charts-body">

       <div className="charts-header">
         <div className="district-tabs">
           {DISTRICTS.map(d => (
             <button
               key={d.id}
               className={`district-tab ${selectedDistrict === d.id ? 'active' : ''}`}
               style={selectedDistrict === d.id ? {
                 borderColor: d.color,
                 color: d.color,
                 boxShadow: `0 4px 12px ${d.color}30`
               } : {}}
               onClick={() => setSelectedDistrict(d.id)}
             >
               <span className="tab-dot" style={{ background: d.color }}></span>
               {d.name}
             </button>
           ))}
         </div>
       </div>

       <div className="chart-stats">
         {[
           { label: 'Current Level',   value: latestLevel ? `${latestLevel}m` : 'N/A', color: status.color },
           { label: 'Threshold Limit', value: `${threshold}m`,  color: '#0ea5e9' },
           { label: 'Risk Status',     value: status.label,      color: status.color },
           { label: 'Threshold %',     value: `${riskPercent}%`, color: riskPercent >= 100 ? '#dc2626' : riskPercent >= 85 ? '#ef4444' : riskPercent >= 65 ? '#f59e0b' : '#22c55e' },
           { label: 'Total Readings',  value: currentReadings.length, color: '#8b5cf6' },
         ].map((s, i) => (
           <div key={i} className="chart-stat-card" style={{ borderTopColor: s.color }}>
             <div className="chart-stat-label">{s.label}</div>
             <div className="chart-stat-value" style={{ color: s.color }}>{s.value}</div>
           </div>
         ))}
       </div>

       <div className="threshold-bar-section">
         <div className="threshold-bar-label">
           <span>Water Level Progress to Threshold</span>
           <span style={{ color: status.color, fontWeight: 700 }}>
             {riskPercent}% of {threshold}m danger limit
           </span>
         </div>
         <div className="threshold-bar-track">
           <div
             className="threshold-bar-fill"
             style={{ width: `${riskPercent}%`, background: status.color }}
           ></div>
         </div>
         <div className="threshold-bar-labels">
           <span>0m</span>
           <span style={{ color: '#f59e0b' }}>⚡ Caution ({(threshold * 0.65).toFixed(2)}m)</span>
           <span style={{ color: '#ef4444' }}>⚠ Danger ({(threshold * 0.85).toFixed(2)}m)</span>
           <span style={{ color: '#dc2626' }}>🚨 Critical ({threshold}m)</span>
         </div>
       </div>

       <div className="chart-section">
         <div className="chart-section-header">
           <div>
             <h3>📈 Water Level Trend</h3>
             <p className="chart-section-sub">{currentDistrict?.name} — Last {currentReadings.length} readings</p>
           </div>
           <span className={`risk-pill risk-pill-${status.label.toLowerCase()}`}>
             {status.label}
           </span>
         </div>
         <div className="chart-wrapper">
           <ResponsiveContainer width="100%" height={340}>
             <AreaChart data={currentReadings} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
               <defs>
                 <linearGradient id="levelGrad" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%"  stopColor={currentDistrict?.color} stopOpacity={0.25} />
                   <stop offset="95%" stopColor={currentDistrict?.color} stopOpacity={0.02} />
                 </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
               <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} interval="preserveStartEnd" tickLine={false} />
               <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, Math.max(threshold + 0.5, 2.5)]} tickFormatter={v => `${v}m`} axisLine={false} tickLine={false} />
               <Tooltip content={<CustomTooltip />} />
               <ReferenceLine y={threshold} stroke="#dc2626" strokeDasharray="6 3" strokeWidth={2} label={{ value: `🚨 Critical ${threshold}m`, fill: '#dc2626', fontSize: 12, fontWeight: 700 }} />
               <ReferenceLine y={threshold * 0.85} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: `⚠ Danger ${(threshold * 0.85).toFixed(2)}m`, fill: '#f59e0b', fontSize: 11 }} />
               <ReferenceLine y={threshold * 0.65} stroke="#22c55e" strokeDasharray="4 4" label={{ value: `⚡ Caution ${(threshold * 0.65).toFixed(2)}m`, fill: '#22c55e', fontSize: 11 }} />
               <Area type="monotone" dataKey="level" stroke={currentDistrict?.color} strokeWidth={3} fill="url(#levelGrad)" name="Water Level" dot={{ fill: currentDistrict?.color, r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
             </AreaChart>
           </ResponsiveContainer>
         </div>
       </div>

       <div className="chart-section">
         <div className="chart-section-header">
           <div>
             <h3>📊 District Comparison</h3>
             <p className="chart-section-sub">Latest 10 readings per district</p>
           </div>
         </div>
         <div className="chart-wrapper">
           <ResponsiveContainer width="100%" height={300}>
             <LineChart margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
               <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
               <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
               <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v}m`} axisLine={false} tickLine={false} />
               <Tooltip content={<CustomTooltip />} />
               <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '16px' }} />
               {DISTRICTS.map(d => (
                 <Line key={d.id} data={(allReadings[d.id] || []).slice(-10)} type="monotone" dataKey="level" stroke={d.color} strokeWidth={2.5} name={d.name} dot={{ r: 4, fill: d.color, stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
               ))}
             </LineChart>
           </ResponsiveContainer>
         </div>
       </div>

       <div className="chart-section simulate-section">
         <div className="chart-section-header">
           <div>
             <h3>⚡ Simulate Sensor Reading</h3>
             <p className="chart-section-sub">
               Test the threshold alert system for {currentDistrict?.name} (limit: {threshold}m)
             </p>
           </div>
         </div>
         <div className="simulate-body">
           <div className="simulate-hint-row">
             <div className="simulate-hint safe">Safe: below {(threshold * 0.65).toFixed(2)}m</div>
             <div className="simulate-hint caution">Caution: {(threshold * 0.65).toFixed(2)}m – {(threshold * 0.85).toFixed(2)}m</div>
             <div className="simulate-hint danger">Danger: {(threshold * 0.85).toFixed(2)}m – {threshold}m</div>
             <div className="simulate-hint critical">Critical: above {threshold}m</div>
           </div>
           <div className="simulate-controls">
             <div className="simulate-input-wrap">
               <input
                 type="number"
                 step="0.1"
                 min="0"
                 max="5"
                 placeholder="e.g. 1.8"
                 value={simulateLevel}
                 onChange={e => setSimulateLevel(e.target.value)}
                 className="simulate-input"
               />
               <span className="simulate-unit">meters</span>
             </div>
             <button
               className="simulate-btn"
               onClick={handleSimulate}
               disabled={simLoading || !simulateLevel}
             >
               {simLoading ? '⏳ Submitting...' : '⚡ Submit Reading'}
             </button>
           </div>
           {simResult && (
             <div className={`sim-result sim-${simResult.risk_level}`}>
               <div className="sim-result-header">
                 <strong>🎯 Result: {simResult.risk_level?.toUpperCase()}</strong>
                 <span>Level submitted: {simResult.level_m}m</span>
               </div>
               {simResult.alert && <p className="sim-alert-msg">{simResult.alert}</p>}
               {!simResult.alert && <p className="sim-alert-msg">✅ Water level is within safe range.</p>}
             </div>
           )}
         </div>
       </div>

     </div>
   </div>
 );
};

export default Charts;