import React, { useMemo } from 'react';
import { Avatar, Button, Card, Form, Input, Space, Typography, message } from 'antd';
import { SaveOutlined, UserOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface ProfileValues {
  name: string;
  email: string;
  role: string;
}

const Profile: React.FC = () => {
  const [form] = Form.useForm<ProfileValues>();

  const user = useMemo(() => {
    const stored = localStorage.getItem('user');

    if (!stored) {
      return { name: 'Admin User', email: 'admin@construct.com', role: 'Administrator' };
    }

    try {
      return JSON.parse(stored);
    } catch {
      return { name: 'Admin User', email: 'admin@construct.com', role: 'Administrator' };
    }
  }, []);

  const handleSave = async () => {
    const values = await form.validateFields();
    localStorage.setItem('user', JSON.stringify(values));
    message.success('Profile updated for this admin workspace.');
  };

  return (
    <div className="admin-page">
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space size="large" align="center">
            <Avatar size={72} icon={<UserOutlined />} />
            <div>
              <Title level={4} style={{ margin: 0 }}>{user.name}</Title>
              <Text type="secondary">{user.email}</Text>
            </div>
          </Space>

          <Form form={form} layout="vertical" initialValues={user}>
            <Form.Item name="name" label="Display name" rules={[{ required: true, message: 'Enter a name.' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email address" rules={[{ required: true, message: 'Enter an email.' }, { type: 'email' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Enter a role.' }]}>
              <Input />
            </Form.Item>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              Save profile
            </Button>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default Profile;
