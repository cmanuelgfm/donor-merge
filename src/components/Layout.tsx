import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { label: 'Home', to: '/dashboard' },
  { label: 'Supporters', to: '/supporters' },
  { label: 'Transactions', to: '/transactions' },
  { label: 'Fundraising', to: '/fundraising' },
  { label: 'Reports', to: '/reports' },
  { label: 'Administration', to: '/administration' },
];

export const Layout = () => {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">gofundme<span>PRO</span></div>
        <div className="nav-toggle">
          <span className="dot" />
        </div>
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">Terms of Service · Privacy Notice</div>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="help">Help</div>
          <div className="user">
            <div className="avatar">CM</div>
            <div>
              <div className="user-name">Colin Manuel</div>
              <div className="user-org">Campaign Studio Testing</div>
            </div>
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
