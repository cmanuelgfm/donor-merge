import { NavLink } from 'react-router-dom';
import { ReactNode } from 'react';
import { mockApi } from '../data/mockApi';

const navItems = [
  { label: 'Home', to: '/dashboard' },
  { label: 'Supporters', to: '/supporters' },
  { label: 'Transactions', to: '/transactions' },
  { label: 'Fundraising', to: '/fundraising' },
  { label: 'Reports', to: '/reports' },
  { label: 'Administration', to: '/administration' }
];

const Layout = ({ children }: { children: ReactNode }) => {
  const summary = mockApi.getDashboardSummary();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo">gofundme<span>pro</span></div>
        <nav className="nav">
          {navItems.map((item) => (
            <NavLink key={item.label} to={item.to} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <span className="timezone">Time & dates displayed in America/Los_Angeles</span>
          </div>
          <div className="topbar-right">
            <div className="pill">Help</div>
            <div className="user">
              <div className="avatar">CM</div>
              <div>
                <div className="user-name">Colin Manuel</div>
                <div className="user-subtitle">Campaign Studio Testing</div>
              </div>
            </div>
          </div>
        </header>
        <main className="content">
          <div className="breadcrumb">
            <span>Supporter Admin</span>
            <span className="dot" />
            <span className="muted">Open duplicates: {summary.duplicatesCount}</span>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
