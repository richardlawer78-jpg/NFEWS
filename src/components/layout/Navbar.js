import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = ({ title, subtitle, onMenuToggle }) => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="hamburger-btn" onClick={onMenuToggle}>
          ☰
        </button>
        <div className="navbar-title-group">
          <h1 className="navbar-title">{title}</h1>
          {subtitle && <p className="navbar-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-online">
          <span className="online-dot"></span>
          <span className="online-text">Live</span>
        </div>

        <div className="navbar-time">
          {new Date().toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
          })}
        </div>

        {user ? (
          <div className="navbar-user">
            <div className="user-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
            <button onClick={logout} className="logout-btn" title="Logout">
              ⏻
            </button>
          </div>
        ) : (
          <div className="navbar-guest">
            <span className="guest-label">👤 Guest View</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;