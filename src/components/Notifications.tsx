import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Dropdown, List, Space, Tag, Typography } from 'antd';
import { BellOutlined, ContactsOutlined, FileTextOutlined, ToolOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { contactApi, quoteApi, serviceApi } from '../services/api.ts';

const { Text } = Typography;

interface NotificationItem {
  key: string;
  title: string;
  description: string;
  route: string;
  tone: 'gold' | 'blue' | 'green';
  icon: React.ReactNode;
}

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ contacts: 0, quotes: 0, services: 0 });

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [contacts, quotes, services] = await Promise.all([
          contactApi.getAll(),
          quoteApi.getAll(),
          serviceApi.getAll(),
        ]);

        setCounts({
          contacts: contacts.length,
          quotes: quotes.length,
          services: services.length,
        });
      } catch {
        setCounts({ contacts: 0, quotes: 0, services: 0 });
      }
    };

    loadCounts();
  }, []);

  const items = useMemo<NotificationItem[]>(
    () => [
      {
        key: 'contacts',
        title: 'Contact inbox',
        description: `${counts.contacts} messages waiting in the admin inbox.`,
        route: '/contacts',
        tone: 'blue',
        icon: <ContactsOutlined />,
      },
      {
        key: 'quotes',
        title: 'Quote requests',
        description: `${counts.quotes} requests captured from the frontend quote form.`,
        route: '/quotes',
        tone: 'gold',
        icon: <FileTextOutlined />,
      },
      {
        key: 'services',
        title: 'Published services',
        description: `${counts.services} services currently available to the website.`,
        route: '/services',
        tone: 'green',
        icon: <ToolOutlined />,
      },
    ],
    [counts]
  );

  const overlay = (
    <div className="notifications-panel">
      <div className="notifications-panel-header">
        <Text strong>Workspace summary</Text>
        <Text type="secondary">Live counts from the shared backend</Text>
      </div>
      <List
        dataSource={items}
        renderItem={(item) => (
          <List.Item className="notifications-item" onClick={() => navigate(item.route)}>
            <Space align="start">
              <span className={`notification-icon notification-icon-${item.tone}`}>{item.icon}</span>
              <div>
                <Text strong>{item.title}</Text>
                <div>
                  <Text type="secondary">{item.description}</Text>
                </div>
              </div>
            </Space>
            <Tag>{item.key}</Tag>
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <Dropdown dropdownRender={() => overlay} trigger={['click']} placement="bottomRight">
      <Badge count={items.length} size="small" color="#c89116">
        <Button icon={<BellOutlined />} className="soft-action-button admin-notification-trigger" />
      </Badge>
    </Dropdown>
  );
};

export default Notifications;
