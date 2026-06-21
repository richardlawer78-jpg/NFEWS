import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const mainNavItems = [
  { to: '/dashboard',     icon: '🏠', label: 'Dashboard' },
  { to: '/map',           icon: '🌍', label: 'Flood Map' },
  { to: '/alerts',        icon: '🔔', label: 'Alerts', badge: true },
  { to: '/charts',        icon: '📊', label: 'Charts' },
  { to: '/zones',         icon: '📍', label: 'Zones' },
  { to: '/weather',       icon: '🌧', label: 'Weather' },
  { to: '/notifications', icon: '📨', label: 'Notifications' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  return (
    <>
      <div className={'sidebar-overlay' + (isOpen ? ' active' : '')} onClick={onClose}></div>

      <aside className={'sidebar' + (isOpen ? ' mobile-open' : '')}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M3 18C3 18 5 14 8 14C11 14 11 18 14 18C17 18 17 14 20 14C21 14 22 15 22 15"
                stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M3 12C3 12 5 8 8 8C11 8 11 12 14 12C17 12 17 8 20 8C21 8 22 9 22 9"
                stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M3 6C3 6 5 2 8 2C11 2 11 6 14 6C17 6 17 2 20 2C21 2 22 3 22 3"
                stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-name">NFEWS</span>
            <span className="brand-sub">West Africa</span>
          </div>
          <button className="sidebar-close-btn" onClick={onClose}>X</button>
        </div>

        <div className="sidebar-status">
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span className="status-text">System Online</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-section-label">MAIN MENU</p>
          {mainNavItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link-active' : 'nav-link'
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">1</span>}
            </NavLink>
          ))}
        </nav>

        {user?.role === 'admin' && (
          <nav className="sidebar-nav" style={{ paddingTop: 0 }}>
            <p className="nav-section-label">ADMIN</p>
            <NavLink
              to="/admin"
              onClick={onClose}
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link-active' : 'nav-link'
              }
            >
              <span className="nav-icon">⚙</span>
              <span className="nav-label">Admin Panel</span>
            </NavLink>
          </nav>
        )}

        <div className="sidebar-user">
          <NavLink to="/profile" onClick={onClose} className="sidebar-user-link">
            <div className="sidebar-user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name || 'Guest'}</span>
              <span className="sidebar-user-role">{user?.role || 'citizen'}</span>
            </div>
            <span className="sidebar-user-arrow">)</span>
          </NavLink>
        </div>

        <div className="sidebar-footer">
          <p className="footer-version">NFEWS v1.0.0</p>
          <p className="footer-copy">2026 West Africa EWS</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
