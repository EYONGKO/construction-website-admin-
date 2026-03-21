import React from 'react';
import { Layout, Space, Typography } from 'antd';
import { useSidebar } from '../contexts/SidebarContext.tsx';

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

const Footer: React.FC = () => {
  const { collapsed } = useSidebar();

  return (
    <AntFooter
      className="admin-footer"
      style={{
        marginLeft: collapsed ? 92 : 296,
      }}
    >
      <div>
        <Text strong>Construct Admin</Text>
        <Text>Professional publishing and enquiry management for the website.</Text>
      </div>
      <Space size="large">
        <Text>Frontend synced through shared API records</Text>
        <Text>Version 2.0</Text>
      </Space>
    </AntFooter>
  );
};

export default Footer;
