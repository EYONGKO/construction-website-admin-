import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/projects', label: 'Projects', icon: '🏗️' },
    { path: '/services', label: 'Services', icon: '🔧' },
    { path: '/contacts', label: 'Contacts', icon: '👥' },
    { path: '/quotes', label: 'Quotes', icon: '📄' },
    { path: '/team', label: 'Team', icon: '👨‍💼' },
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  return (
    <div style={{
      width: '250px',
      backgroundColor: '#001529',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      color: 'white',
      padding: '20px 0'
    }}>
      <div style={{
        padding: '0 20px',
        marginBottom: '20px',
        borderBottom: '1px solid #1f1f1f',
        paddingBottom: '20px'
      }}>
        <h3 style={{ color: '#ff6b35', margin: 0 }}>Construction Admin</h3>
      </div>
      
      <nav>
        {menuItems.map((item) => (
          <div
            key={item.path}
            onClick={() => handleMenuClick(item.path)}
            style={{
              padding: '12px 20px',
              cursor: 'pointer',
              backgroundColor: location.pathname === item.path ? '#ff6b35' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'background-color 0.3s'
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== item.path) {
                e.currentTarget.style.backgroundColor = '#1f1f1f';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== item.path) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
