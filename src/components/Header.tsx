import React, { useMemo } from 'react';
import { Layout, Button, Avatar, Dropdown, Space, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, HomeOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext.tsx';
import Notifications from './Notifications.tsx';
import type { MenuProps } from 'antd';

const { Header: AntHeader } = Layout;
const { Text, Title } = Typography;
const settingsStorageKey = 'construct-admin-settings';

const titles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Operations dashboard',
    subtitle: 'Track website content, incoming requests, and publishing activity in one place.',
  },
  '/projects': {
    title: 'Projects catalog',
    subtitle: 'Manage the product and project records that power the public projects pages.',
  },
  '/services': {
    title: 'Service library',
    subtitle: 'Publish the services that appear across the website and detail pages.',
  },
  '/contacts': {
    title: 'Contact inbox',
    subtitle: 'Review enquiries from the website contact form and keep follow-up organized.',
  },
  '/quotes': {
    title: 'Quote requests',
    subtitle: 'See every request submitted from the frontend quote form and respond quickly.',
  },
  '/team': {
    title: 'Team workspace',
    subtitle: 'Keep internal roles, response ownership, and operating standards visible.',
  },
  '/content': {
    title: 'Website content',
    subtitle: 'Manage the public-facing text, social links, team section, and key page content from one backend-backed form.',
  },
  '/profile': {
    title: 'Profile',
    subtitle: 'Update your administrator information and operating preferences.',
  },
  '/settings': {
    title: 'Settings',
    subtitle: 'Control how the admin workspace behaves for your current environment.',
  },
};

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed } = useSidebar();

  const user = useMemo(() => {
    const stored = localStorage.getItem('user');

    if (!stored) {
      return { name: 'Admin User', role: 'Administrator' };
    }

    try {
      return JSON.parse(stored);
    } catch {
      return { name: 'Admin User', role: 'Administrator' };
    }
  }, []);

  const current = titles[location.pathname] || titles['/dashboard'];
  const websiteUrl = useMemo(() => {
    const fallback = 'http://localhost:3000';
    const stored = localStorage.getItem(settingsStorageKey);

    if (!stored) {
      return fallback;
    }

    try {
      const parsed = JSON.parse(stored);
      return parsed.websiteUrl || fallback;
    } catch {
      return fallback;
    }
  }, []);

  const menuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
  ];

  return (
    <AntHeader
      className="admin-header"
      style={{
        left: collapsed ? 92 : 296,
      }}
    >
      <div className="admin-header-copy">
        <Text className="admin-kicker">Construct Admin</Text>
        <Title level={3}>{current.title}</Title>
        <Text>{current.subtitle}</Text>
      </div>

      <Space size="middle" align="center">
        <Button
          type="default"
          icon={<HomeOutlined />}
          className="soft-action-button"
          onClick={() => window.open(websiteUrl, '_blank', 'noopener,noreferrer')}
        >
          Open website
        </Button>
        <Notifications />
        <Dropdown
          menu={{
            items: menuItems,
            onClick: ({ key }) => navigate(`/${key}`),
          }}
          placement="bottomRight"
        >
          <Button className="admin-user-chip" type="text">
            <Avatar icon={<UserOutlined />} />
            <span>
              <strong>{user.name}</strong>
              <small>{user.role}</small>
            </span>
          </Button>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
