import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AppLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const role = user?.role || 'Team Member';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="container header-inner">
          <div className="brand">
            <div className="brand-mark">CRM</div>
            <div className="brand-text">
              <span>Atlas CRM</span>
              <small>Customer Operations</small>
            </div>
          </div>
          <nav className="nav">
            <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/dashboard">
              Dashboard
            </NavLink>
            <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/customers">
              Customers
            </NavLink>
          </nav>
          <div className="header-actions">
            <div className="user-chip">
              <span className="user-name">{user?.name || 'Account'}</span>
              <span className="role-pill">{role}</span>
            </div>
            <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>
      <main className="app-main">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
