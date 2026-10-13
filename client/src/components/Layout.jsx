import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-body)' }}>
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div
        className="main-layout-content"
        style={{
          flex: 1,
          marginLeft: '260px',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          transition: 'margin-left 0.3s ease'
        }}
      >
        <Navbar onOpenSidebar={() => setIsSidebarOpen(true)} />

        <main
          style={{
            flex: 1,
            padding: '2rem',
            maxWidth: '1440px',
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box'
          }}
          className="page-main-container"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
