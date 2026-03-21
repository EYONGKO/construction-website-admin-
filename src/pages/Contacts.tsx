import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Drawer, Input, Space, Table, Tag, Typography, message } from 'antd';
import { MailOutlined, ReloadOutlined } from '@ant-design/icons';
import { contactApi } from '../services/api.ts';
import type { ContactMessage } from '../types/data.ts';
import { formatDateTime, getMessagePreview } from '../utils/format.ts';
import DialogHeading from '../components/DialogHeading.tsx';

const { Search } = Input;
const { Text } = Typography;

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await contactApi.getAll();
      setContacts(data);
    } catch (error) {
      console.error(error);
      message.error('Unable to load contact messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const filteredContacts = useMemo(() => {
    if (!search.trim()) {
      return contacts;
    }

    const query = search.toLowerCase();
    return contacts.filter((contact) =>
      [contact.name, contact.email, contact.message].some((field) =>
        field?.toLowerCase().includes(query)
      )
    );
  }, [contacts, search]);

  const columns = [
    {
      title: 'Sender',
      key: 'sender',
      render: (_: unknown, record: ContactMessage) => (
        <div>
          <Text strong>{record.name}</Text>
          <div><Text type="secondary">{record.email}</Text></div>
        </div>
      ),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      render: (_: string, record: ContactMessage) => getMessagePreview(record),
    },
    {
      title: 'Received',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) => formatDateTime(value),
    },
    {
      title: 'Status',
      key: 'status',
      render: () => <Tag color="blue">Website lead</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: ContactMessage) => (
        <Button type="link" onClick={() => setSelectedContact(record)}>
          Open message
        </Button>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <Card
        title="Contact form inbox"
        extra={
          <Button icon={<ReloadOutlined />} onClick={loadContacts}>
            Refresh
          </Button>
        }
      >
        <div className="page-toolbar">
          <Search
            placeholder="Search by sender, email, or message"
            allowClear
            onChange={(event) => setSearch(event.target.value)}
            value={search}
          />
          <Text type="secondary">
            Every message here came from the public contact page.
          </Text>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredContacts}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Drawer
        title={
          selectedContact ? (
            <DialogHeading
              eyebrow="Inbox Message"
              title={selectedContact.name}
              description="Review the contact details and message content from the public website."
            />
          ) : null
        }
        open={Boolean(selectedContact)}
        width={520}
        onClose={() => setSelectedContact(null)}
        rootClassName="admin-drawer-shell"
      >
        {selectedContact && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div className="detail-stack">
              <div>
                <Text strong>Email</Text>
                <p>
                  <a href={`mailto:${selectedContact.email}`}>{selectedContact.email}</a>
                </p>
              </div>
              <div>
                <Text strong>Received</Text>
                <p>{formatDateTime(selectedContact.createdAt)}</p>
              </div>
              <div>
                <Text strong>Message</Text>
                <p>{selectedContact.message}</p>
              </div>
            </div>
            <Button
              type="primary"
              icon={<MailOutlined />}
              href={`mailto:${selectedContact.email}?subject=Re:%20Your%20message%20to%20Construct`}
            >
              Reply by email
            </Button>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default Contacts;
