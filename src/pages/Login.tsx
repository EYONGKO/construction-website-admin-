import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, message } from 'antd';
import { LockOutlined, MailOutlined, SafetyOutlined, ToolOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';

const { Title, Text } = Typography;

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (values: LoginForm) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (values.email === 'admin@construct.com' && values.password === 'admin123') {
        login('construct-admin-session', {
          id: 1,
          name: 'Admin User',
          email: values.email,
          role: 'Administrator',
        });
        message.success('Welcome back.');
        navigate('/dashboard');
        return;
      }

      message.error('Use the demo credentials shown on the sign-in page.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-panel">
        <div className="login-copy">
          <Text className="admin-kicker">Construct Admin</Text>
          <Title>Professional admin control for your website content and client requests.</Title>
          <Text>
            Publish projects and services, track contact messages, and respond to quote requests from one organized workspace.
          </Text>

          <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 28 }}>
            <div className="login-feature"><SafetyOutlined /> Secure local demo access</div>
            <div className="login-feature"><ToolOutlined /> Built around the live backend data model</div>
          </Space>
        </div>

        <Card className="login-card">
          <Title level={3}>Sign in</Title>
          <Text type="secondary">Use the demo administrator credentials below.</Text>

          <Form layout="vertical" onFinish={handleLogin} style={{ marginTop: 24 }}>
            <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
              <Input prefix={<MailOutlined />} placeholder="admin@construct.com" />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="admin123" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Sign in
            </Button>
          </Form>

          <div className="login-demo-box">
            <Text strong>Demo credentials</Text>
            <p>Email: admin@construct.com</p>
            <p>Password: admin123</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
