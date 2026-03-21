import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(Boolean(token));
    setLoading(false);
  }, []);

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
        }}
      >
        <Layout className="admin-shell">
          <Sidebar />
          <Layout
            className="admin-shell-main"
            style={{
              marginLeft: sidebarCollapsed ? 92 : 296,
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
