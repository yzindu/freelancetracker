import React from 'react';

const Dashboard = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Analytics & Dashboard</h2>
          <p className="text-secondary text-sm">Real-time overview of your freelance earnings and projects.</p>
        </div>
      </div>
      <div className="card">
        <p className="text-secondary">Dashboard components and charts loading in Step 18...</p>
      </div>
    </div>
  );
};

export default Dashboard;
