import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Projects from './pages/Projects.tsx';
import Services from './pages/Services.tsx';
import Contacts from './pages/Contacts.tsx';
import Quotes from './pages/Quotes.tsx';
import Team from './pages/Team.tsx';
import ContentPage from './pages/Content.tsx';
import Profile from './pages/Profile.tsx';
import Settings from './pages/Settings.tsx';
import Login from './pages/Login.tsx';
import Logout from './pages/Logout.tsx';
import AuthContext from './contexts/AuthContext.tsx';
import SidebarContext from './contexts/SidebarContext.tsx';
import type { AdminUser } from './types/data.ts';

const { Content } = Layout;
const MOBILE_BREAKPOINT = 992;

function App() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(Boolean(token));
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobile && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [isMobile, mobileMenuOpen]);

  useEffect(() => {
    if (isMobile && sidebarCollapsed) {
      setSidebarCollapsed(false);
    }
  }, [isMobile, sidebarCollapsed]);

  useEffect(() => {
    document.body.classList.toggle('admin-mobile-menu-open', isMobile && mobileMenuOpen);

    return () => {
      document.body.classList.remove('admin-mobile-menu-open');
    };
  }, [isMobile, mobileMenuOpen]);

  const login = (token: string, user: AdminUser) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const shellOffset = useMemo(() => {
    if (isMobile) {
      return 0;
    }

    return sidebarCollapsed ? 92 : 296;
  }, [isMobile, sidebarCollapsed]);

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-loading-spinner" />
        <p>Loading administration workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <SidebarContext.Provider
        value={{
          collapsed: sidebarCollapsed,
          toggleCollapse: () => setSidebarCollapsed((current) => !current),
          mobileOpen: mobileMenuOpen,
          toggleMobile: toggleMobileMenu,
          closeMobile: closeMobileMenu,
        }}
      >
        <Layout className="admin-shell">
          <button 
            className="mobile-menu-toggle" 
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <g>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </g>
              ) : (
                <g>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </g>
              )}
            </svg>
          </button>
          
          <div 
            className={`mobile-menu-overlay ${mobileMenuOpen ? 'active' : ''}`}
            onClick={closeMobileMenu}
          />
          
          <div className={`admin-sidebar-shell ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <Sidebar />
          </div>
          
          <Layout
            className="admin-shell-main"
            style={{
              marginLeft: shellOffset,
            }}
          >
            <Header />
            <Content className="admin-content">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/quotes" element={<Quotes />} />
                <Route path="/team" element={<Team />} />
                <Route path="/content" element={<ContentPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Content>
            <Footer />
          </Layout>
        </Layout>
      </SidebarContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
