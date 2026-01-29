import { PropsWithChildren } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Home', path: '/dashboard' },
  { label: 'Supporters', path: '/supporters' },
  { label: 'Transactions', path: '/transactions' },
  { label: 'Fundraising', path: '/fundraising' },
  { label: 'Reports', path: '/reports' },
  { label: 'Administration', path: '/administration' }
];

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo">gofundmepro</div>
        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span>Terms of Service · Privacy Notice</span>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">Help</div>
          <div className="topbar-right">
            <div className="avatar">CM</div>
            <div>
              <div className="topbar-name">Colin Manuel</div>
              <div className="topbar-org">Campaign Studio Testing</div>
            </div>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
