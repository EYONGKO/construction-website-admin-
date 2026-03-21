import React from 'react';

const Header: React.FC = () => {
  const handleLogout = () => {
    console.log('Logging out...');
  };

  return (
    <header style={{
      backgroundColor: 'white',
      padding: '0 24px',
      height: '64px',
      boxShadow: '0 1px 4px rgba(0,21,41,.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'fixed',
      top: 0,
      left: '250px',
      right: 0,
      zIndex: 1000
    }}>
      <div>
        <h2 style={{ margin: 0, color: '#2d4a3d' }}>Admin Dashboard</h2>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: '#666' }}>Admin User</span>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ff6b35',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
