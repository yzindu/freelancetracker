import React from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}>
        <h2>Create an Account</h2>
        <p className="text-secondary text-sm" style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          Registration flow loading in Step 13...
        </p>
        <Link to="/login" className="gradient-text" style={{ fontSize: '0.85rem' }}>
          Already have an account? Sign In
        </Link>
      </div>
    </div>
  );
};

export default Register;
