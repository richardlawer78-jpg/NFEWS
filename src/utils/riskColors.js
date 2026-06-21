export const riskColors = {
  safe: '#22c55e',
  caution: '#f59e0b',
  danger: '#ef4444',
  critical: '#7f1d1d'
};

export const riskBg = {
  safe: '#dcfce7',
  caution: '#fef3c7',
  danger: '#fee2e2',
  critical: '#fecaca'
};

export const riskLabel = {
  safe: '🟢 Safe',
  caution: '🟡 Caution',
  danger: '🔴 Danger',
  critical: '🚨 Critical'
};

export const getRiskColor = (level) => riskColors[level] || '#gray';
export const getRiskBg = (level) => riskBg[level] || '#f3f4f6';
export const getRiskLabel = (level) => riskLabel[level] || level;