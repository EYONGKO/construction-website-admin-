import React, { useMemo } from 'react';
import { Layout, Menu, Typography, Avatar, Button, Tooltip } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext.tsx';
import {
  DashboardOutlined,
  ProjectOutlined,
  ToolOutlined,
  ContactsOutlined,
  FileTextOutlined,
  TeamOutlined,
  EditOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;
const { Text } = Typography;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed, toggleCollapse } = useSidebar();

  const user = useMemo(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      return { name: 'Admin User', email: 'admin@construct.com' };
    }

    try {
      return JSON.parse(stored);
    } catch {
      return { name: 'Admin User', email: 'admin@construct.com' };
    }
  }, []);

  const primaryItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/projects', icon: <ProjectOutlined />, label: 'Projects' },
    { key: '/services', icon: <ToolOutlined />, label: 'Services' },
    { key: '/contacts', icon: <ContactsOutlined />, label: 'Contacts' },
    { key: '/quotes', icon: <FileTextOutlined />, label: 'Quotes' },
    { key: '/team', icon: <TeamOutlined />, label: 'Team' },
    { key: '/content', icon: <EditOutlined />, label: 'Content' },
  ];

  const secondaryItems = [
    { key: '/profile', icon: <UserOutlined />, label: 'Profile' },
    { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
    { key: '/logout', icon: <LogoutOutlined />, label: 'Logout' },
  ];

  return (
    <Sider
      width={296}
      collapsed={collapsed}
      collapsedWidth={92}
      trigger={null}
      className="admin-sidebar"
    >
      <div className="admin-sidebar-top">
        <div className="admin-brand">
          <div className="admin-brand-symbol" />
          {!collapsed && (
            <div className="admin-brand-copy">
              <strong>Construct</strong>
              <span>Control Center</span>
            </div>
          )}
        </div>
        <Tooltip title={collapsed ? 'Expand menu' : 'Collapse menu'}>
          <Button
            type="text"
            className="sidebar-toggle-button"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapse}
          />
        </Tooltip>
      </div>

      <div className="admin-sidebar-section">
        {!collapsed && <Text className="admin-sidebar-label">Workspace</Text>}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={primaryItems}
          onClick={({ key }) => navigate(key)}
          className="admin-sidebar-menu"
        />
      </div>

      <div className="admin-sidebar-section admin-sidebar-section-secondary">
        {!collapsed && <Text className="admin-sidebar-label">Account</Text>}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={secondaryItems}
          onClick={({ key }) => navigate(key)}
          className="admin-sidebar-menu"
        />
      </div>

      <div className="admin-sidebar-user">
        <Avatar size={collapsed ? 40 : 48} icon={<UserOutlined />} />
        {!collapsed && (
          <div>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
        )}
      </div>
    </Sider>
  );
};

export default Sidebar;
