import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center'
      }}
    >
      <div className="card" style={{ maxWidth: '480px', padding: '3rem 2rem' }}>
        <div style={{ color: 'var(--primary)', fontSize: '3rem', marginBottom: '1rem' }}>
          <FiAlertCircle />
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>404</h1>
        <h2>Page Not Found</h2>
        <p className="text-secondary text-sm" style={{ margin: '1rem 0 2rem' }}>
          The page you requested could not be located in your freelance workspace.
        </p>
        <Link to="/" className="btn btn-primary">
          <FiArrowLeft /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
