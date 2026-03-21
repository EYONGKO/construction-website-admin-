import React, { useEffect } from 'react';
import { Button, Card, Space, Typography } from 'antd';
import { HomeOutlined, LoginOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';

const { Text, Title } = Typography;

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <div className="login-screen">
      <Card className="login-card" style={{ width: 'min(460px, 100%)', textAlign: 'center' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div className="team-card-icon" style={{ margin: '0 auto' }}>
            <LogoutOutlined />
          </div>
          <div>
            <Title level={3}>You have been signed out</Title>
            <Text type="secondary">
              Your admin session was cleared successfully. You can sign in again or open the public website.
            </Text>
          </div>
          <Space style={{ justifyContent: 'center', width: '100%' }} wrap>
            <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
              Sign in again
            </Button>
            <Button icon={<HomeOutlined />} onClick={() => window.open('http://localhost:3000', '_blank', 'noopener,noreferrer')}>
              Open website
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
};

export default Logout;
