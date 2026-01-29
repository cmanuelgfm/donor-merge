import { NavLink } from 'react-router-dom';
import { ReactNode } from 'react';
import './layout.css';

const navItems = [
  { label: 'Home', to: '/dashboard' },
  { label: 'Supporters', to: '/supporters' },
  { label: 'Transactions', to: '/transactions' },
  { label: 'Fundraising', to: '/fundraising' },
  { label: 'Reports', to: '/reports' },
  { label: 'Administration', to: '/administration' }
];

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__logo">gofundmePRO</div>
        <nav>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className="nav-link">
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__footer">Give us your feedback</div>
      </aside>
      <div className="main">
        <header className="topbar">
          <div>
            <span className="pill pill--info">Time zone: America/Los_Angeles</span>
          </div>
          <div className="topbar__user">
            <span className="avatar">CM</span>
            <div>
              <div className="topbar__name">Colin Manuel</div>
              <div className="topbar__org">Campaign Studio Testing</div>
            </div>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
};
