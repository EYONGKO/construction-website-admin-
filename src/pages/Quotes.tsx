import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Drawer, Input, Space, Table, Tag, Typography, message } from 'antd';
import { MailOutlined, PhoneOutlined, ReloadOutlined } from '@ant-design/icons';
import { quoteApi } from '../services/api.ts';
import type { QuoteRequest } from '../types/data.ts';
import { formatDateTime, getMessagePreview, getProjectTypeLabel } from '../utils/format.ts';
import DialogHeading from '../components/DialogHeading.tsx';

const { Search } = Input;
const { Text } = Typography;

const Quotes: React.FC = () => {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const data = await quoteApi.getAll();
      setQuotes(data);
    } catch (error) {
      console.error(error);
      message.error('Unable to load quote requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  const filteredQuotes = useMemo(() => {
    if (!search.trim()) {
      return quotes;
    }

    const query = search.toLowerCase();
    return quotes.filter((quote) =>
      [quote.name, quote.email, quote.phone, quote.projectType, quote.description].some((field) =>
        field?.toLowerCase().includes(query)
      )
    );
  }, [quotes, search]);

  const columns = [
    {
      title: 'Client',
      key: 'client',
      render: (_: unknown, record: QuoteRequest) => (
        <div>
          <Text strong>{record.name}</Text>
          <div><Text type="secondary">{record.email}</Text></div>
        </div>
      ),
    },
    {
      title: 'Project type',
      dataIndex: 'projectType',
      key: 'projectType',
      render: (value: string) => <Tag color="gold">{getProjectTypeLabel(value)}</Tag>,
    },
    {
      title: 'Request summary',
      key: 'description',
      render: (_: unknown, record: QuoteRequest) => getMessagePreview(record),
    },
    {
      title: 'Received',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) => formatDateTime(value),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: QuoteRequest) => (
        <Button type="link" onClick={() => setSelectedQuote(record)}>
          Open request
        </Button>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <Card
        title="Quote request queue"
        extra={
          <Button icon={<ReloadOutlined />} onClick={loadQuotes}>
            Refresh
          </Button>
        }
      >
        <div className="page-toolbar">
          <Search
            placeholder="Search by client, project type, phone, or email"
            allowClear
            onChange={(event) => setSearch(event.target.value)}
            value={search}
          />
          <Text type="secondary">
            These requests come directly from the frontend quote form.
          </Text>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredQuotes}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Drawer
        title={
          selectedQuote ? (
            <DialogHeading
              eyebrow="Quote Request"
              title={selectedQuote.name}
              description="Review the client details and project scope submitted from the public quote form."
            />
          ) : null
        }
        open={Boolean(selectedQuote)}
        width={560}
        onClose={() => setSelectedQuote(null)}
        rootClassName="admin-drawer-shell"
      >
        {selectedQuote && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div className="detail-stack">
              <div>
                <Text strong>Project type</Text>
                <p>{getProjectTypeLabel(selectedQuote.projectType)}</p>
              </div>
              <div>
                <Text strong>Email</Text>
                <p><a href={`mailto:${selectedQuote.email}`}>{selectedQuote.email}</a></p>
              </div>
              <div>
                <Text strong>Phone</Text>
                <p><a href={`tel:${selectedQuote.phone}`}>{selectedQuote.phone}</a></p>
              </div>
              <div>
                <Text strong>Submitted</Text>
                <p>{formatDateTime(selectedQuote.createdAt)}</p>
              </div>
              <div>
                <Text strong>Project description</Text>
                <p>{selectedQuote.description}</p>
              </div>
            </div>
            <Space wrap>
              <Button
                type="primary"
                icon={<MailOutlined />}
                href={`mailto:${selectedQuote.email}?subject=Your%20Construct%20quote%20request`}
              >
                Reply by email
              </Button>
              <Button icon={<PhoneOutlined />} href={`tel:${selectedQuote.phone}`}>
                Call client
              </Button>
            </Space>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default Quotes;
