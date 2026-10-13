import React from 'react';
import { useLocation } from 'react-router-dom';
import { FiMenu, FiCalendar, FiClock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/': 'Dashboard Overview',
  '/clients': 'Client Relationships',
  '/projects': 'Projects Management',
  '/payments': 'Financial Income & Payments'
};

const Navbar = ({ onOpenSidebar }) => {
  const location = useLocation();
  const { user } = useAuth();

  const title = pageTitles[location.pathname] || 'Workspace';

  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(new Date());

  return (
    <header
      style={{
        height: '70px',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'rgba(9, 13, 22, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem'
      }}
      className="top-navbar"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={onOpenSidebar}
          className="mobile-hamburger-btn"
          aria-label="Open Navigation"
          style={{
            display: 'none',
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-main)',
            background: 'rgba(255, 255, 255, 0.04)'
          }}
        >
          <FiMenu size={20} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{title}</h1>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Date Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)'
          }}
          className="navbar-date-badge"
        >
          <FiCalendar size={14} style={{ color: 'var(--primary)' }} />
          <span>{todayStr}</span>
        </div>

        {/* User Greeting */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.85rem'
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>Welcome,</span>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
            {user?.name?.split(' ')[0] || 'Freelancer'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
