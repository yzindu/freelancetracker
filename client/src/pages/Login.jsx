import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}>
        <h2>Sign In to FreelancePulse</h2>
        <p className="text-secondary text-sm" style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          Authentication pages loading in Step 13...
        </p>
        <Link to="/register" className="gradient-text" style={{ fontSize: '0.85rem' }}>
          Don't have an account? Register
        </Link>
      </div>
    </div>
  );
};

export default Login;
