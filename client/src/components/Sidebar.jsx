import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiUsers,
  FiBriefcase,
  FiDollarSign,
  FiLogOut,
  FiX,
  FiZap
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Successfully logged out');
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: FiGrid },
    { to: '/clients', label: 'Clients', icon: FiUsers },
    { to: '/projects', label: 'Projects', icon: FiBriefcase },
    { to: '/payments', label: 'Income & Payments', icon: FiDollarSign }
  ];

  const getInitials = (name) => {
    if (!name) return 'FP';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 8, 15, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 40
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: '260px',
          height: '100vh',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          transform: isOpen ? 'translateX(0)' : undefined,
          transition: 'transform 0.3s ease-in-out',
          userSelect: 'none'
        }}
        className={`sidebar-nav ${isOpen ? 'open' : ''}`}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '1.5rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.25rem',
                boxShadow: 'var(--shadow-primary)'
              }}
            >
              <FiZap />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', color: '#fff' }}>
                Freelance<span className="gradient-text">Pulse</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                PRO WORKSPACE
              </div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="mobile-close-btn"
            style={{
              display: 'none',
              padding: '0.5rem',
              color: 'var(--text-secondary)'
            }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav
          style={{
            padding: '1.25rem 0.75rem',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            overflowY: 'auto'
          }}
        >
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '0.5rem 0.75rem 0.25rem'
            }}
          >
            Navigation
          </div>

          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.14)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                transition: 'all var(--transition-fast)'
              })}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile / Logout Footer */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(13, 18, 31, 0.5)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--gradient-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: '#fff',
                  flexShrink: 0
                }}
              >
                {getInitials(user?.name)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {user?.name || 'Freelancer'}
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {user?.email || 'user@example.com'}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="btn-icon"
              style={{
                color: '#f87171',
                borderColor: 'rgba(239, 68, 68, 0.2)',
                background: 'rgba(239, 68, 68, 0.08)'
              }}
            >
              <FiLogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
