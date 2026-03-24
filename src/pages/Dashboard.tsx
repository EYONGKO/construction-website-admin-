import React, { useEffect, useMemo, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Space, Typography, Progress, Alert, Button } from 'antd';
import {
  ProjectOutlined,
  ToolOutlined,
  ContactsOutlined,
  FileTextOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { contactApi, projectApi, quoteApi, serviceApi } from '../services/api.ts';
import type { AdminProject, AdminService, ContactMessage, QuoteRequest } from '../types/data.ts';
import { formatDate, formatDateTime, getProjectTypeLabel, shortenText } from '../utils/format.ts';

const { Text, Title } = Typography;

interface ActivityRow {
  key: string;
  type: string;
  name: string;
  detail: string;
  submittedAt: string;
  route: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [services, setServices] = useState<AdminService[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [projectData, serviceData, contactData, quoteData] = await Promise.allSettled([
          projectApi.getAll(),
          serviceApi.getAll(),
          contactApi.getAll(),
          quoteApi.getAll(),
        ]);

        const failedSources: string[] = [];

        if (projectData.status === 'fulfilled') {
          setProjects(projectData.value);
        } else {
          failedSources.push('projects');
          setProjects([]);
        }

        if (serviceData.status === 'fulfilled') {
          setServices(serviceData.value);
        } else {
          failedSources.push('services');
          setServices([]);
        }

        if (contactData.status === 'fulfilled') {
          setContacts(contactData.value);
        } else {
          failedSources.push('contacts');
          setContacts([]);
        }

        if (quoteData.status === 'fulfilled') {
          setQuotes(quoteData.value);
        } else {
          failedSources.push('quotes');
          setQuotes([]);
        }

        if (failedSources.length) {
          setError(`Some dashboard sources could not be loaded: ${failedSources.join(', ')}. Check the API base URL in Settings and confirm the backend is running.`);
        } else {
          setError('');
        }
      } catch (loadError) {
        console.error(loadError);
        setError('The dashboard could not load live data from the backend. Check the API connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const coverage = useMemo(() => {
    const total = projects.length + services.length;
    if (!total) {
      return 0;
    }

    const withDescriptions =
      projects.filter((item) => item.description?.trim()).length +
      services.filter((item) => item.description?.trim()).length;

    return Math.round((withDescriptions / total) * 100);
  }, [projects, services]);

  const latestActivity = useMemo<ActivityRow[]>(() => {
    const contactRows = contacts.map((item) => ({
      key: `contact-${item.id}`,
      type: 'Contact',
      name: item.name,
      detail: shortenText(item.message, 72),
      submittedAt: formatDateTime(item.createdAt),
      route: '/contacts',
    }));

    const quoteRows = quotes.map((item) => ({
      key: `quote-${item.id}`,
      type: 'Quote',
      name: item.name,
      detail: getProjectTypeLabel(item.projectType),
      submittedAt: formatDateTime(item.createdAt),
      route: '/quotes',
    }));

    return [...contactRows, ...quoteRows].slice(0, 8);
  }, [contacts, quotes]);

  const activityColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (value: string) => (
        <Tag color={value === 'Quote' ? 'gold' : 'blue'}>{value}</Tag>
      ),
    },
    {
      title: 'Sender',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Summary',
      dataIndex: 'detail',
      key: 'detail',
    },
    {
      title: 'Received',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
    },
    {
      title: 'Open',
      key: 'open',
      render: (_: unknown, record: ActivityRow) => (
        <Button type="link" icon={<ArrowRightOutlined />} onClick={() => navigate(record.route)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="admin-page">
      {error && (
        <Alert
          type="error"
          showIcon
          message="Connection problem"
          description={error}
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={[20, 20]}>
        <Col xs={24} md={12} xl={6}>
          <Card className="metric-card">
            <Statistic title="Published projects" value={projects.length} prefix={<ProjectOutlined />} loading={loading} />
            <Text type="secondary">Visible through the website projects catalog.</Text>
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="metric-card">
            <Statistic title="Live services" value={services.length} prefix={<ToolOutlined />} loading={loading} />
            <Text type="secondary">Service records powering the frontend service pages.</Text>
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="metric-card">
            <Statistic title="Contact messages" value={contacts.length} prefix={<ContactsOutlined />} loading={loading} />
            <Text type="secondary">Incoming website enquiries waiting for follow-up.</Text>
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="metric-card">
            <Statistic title="Quote requests" value={quotes.length} prefix={<FileTextOutlined />} loading={loading} />
            <Text type="secondary">New requests captured from the quote workflow.</Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} style={{ marginTop: 4 }}>
        <Col xs={24} xl={14}>
          <Card title="Recent activity" extra={<Button type="link" onClick={() => navigate('/quotes')}>Open queue</Button>}>
            <Table
              columns={activityColumns}
              dataSource={latestActivity}
              loading={loading}
              pagination={false}
              scroll={{ x: 720 }}
              locale={{ emptyText: 'No recent contact or quote activity yet.' }}
            />
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card title="Content health">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Title level={5} style={{ margin: 0 }}>Content completeness</Title>
                  <Text strong>{coverage}%</Text>
                </Space>
                <Progress percent={coverage} strokeColor="#c89116" trailColor="#edf1f7" />
                <Text type="secondary">
                  Measures how many published projects and services have descriptions ready for the frontend.
                </Text>
              </div>

              <div className="dashboard-insight">
                <Text strong>Latest project update</Text>
                <Text>{projects[0] ? `${projects[0].title} - ${formatDate(projects[0].completedDate)}` : 'No project has been published yet.'}</Text>
              </div>

              <div className="dashboard-insight">
                <Text strong>Latest service update</Text>
                <Text>{services[0] ? services[0].title : 'No service has been published yet.'}</Text>
              </div>

              <div className="dashboard-insight">
                <Text strong>Next admin priorities</Text>
                <Text>
                  Review quote responses, keep project images current, and confirm every service record has a strong public description.
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
