import React, { useEffect } from 'react';
import { Button, Card, Form, Input, Select, Space, Switch, Typography, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface SettingsValues {
  websiteUrl: string;
  apiBaseUrl: string;
  defaultResponseOwner: string;
  compactTables: boolean;
  openFrontendInNewTab: boolean;
}

const storageKey = 'construct-admin-settings';

const Settings: React.FC = () => {
  const [form] = Form.useForm<SettingsValues>();

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      form.setFieldsValue({
        websiteUrl: 'http://localhost:3000',
        apiBaseUrl: 'https://construction-website-backend-m3aw.onrender.com/api',
        defaultResponseOwner: 'Sales Desk',
        compactTables: false,
        openFrontendInNewTab: true,
      });
      return;
    }

    try {
      form.setFieldsValue(JSON.parse(stored));
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [form]);

  const handleSave = async () => {
    const values = await form.validateFields();
    localStorage.setItem(storageKey, JSON.stringify(values));
    message.success('Workspace settings saved locally.');
  };

  return (
    <div className="admin-page">
      <Card title="Workspace settings">
        <Form form={form} layout="vertical">
          <Form.Item name="websiteUrl" label="Frontend URL" rules={[{ required: true, message: 'Enter the website URL.' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="apiBaseUrl" label="API base URL" rules={[{ required: true, message: 'Enter the API base URL.' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="defaultResponseOwner" label="Default response owner" rules={[{ required: true, message: 'Enter an owner label.' }]}>
            <Select
              options={['Sales Desk', 'Operations Lead', 'Project Coordinator'].map((value) => ({
                label: value,
                value,
              }))}
            />
          </Form.Item>
          <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 24 }}>
            <Form.Item name="compactTables" label="Compact tables" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Switch />
            </Form.Item>
            <Form.Item name="openFrontendInNewTab" label="Open frontend links in new tab" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Switch />
            </Form.Item>
          </Space>
          <Text type="secondary">
            These settings are local to this admin app and help keep the workspace organized without changing backend data.
          </Text>
          <div style={{ marginTop: 24 }}>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              Save settings
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;
