import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import DialogHeading from '../components/DialogHeading.tsx';

const { Search, TextArea } = Input;
const { Text } = Typography;

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  status: 'Active' | 'On Site' | 'Remote';
  focus: string;
}

interface TeamFormValues {
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  status: TeamMember['status'];
  focus: string;
}

const storageKey = 'construct-admin-team';

const defaultTeamMembers: TeamMember[] = [
  {
    id: 'martin-ebong',
    name: 'Martin Ebong',
    role: 'Managing Director',
    department: 'Leadership',
    email: 'martin@cebatconstruction.com',
    phone: '+237699529161',
    status: 'Active',
    focus: 'Leads delivery standards, client coordination, and strategic project oversight.',
  },
  {
    id: 'grace-nkeng',
    name: 'Grace Nkeng',
    role: 'Operations and Site Supervisor',
    department: 'Operations',
    email: 'grace@cebatconstruction.com',
    phone: '+237699529161',
    status: 'On Site',
    focus: 'Coordinates field execution, workforce planning, and timeline follow-through.',
  },
  {
    id: 'daniel-fon',
    name: 'Daniel Fon',
    role: 'Technical Services Lead',
    department: 'Technical Services',
    email: 'daniel@cebatconstruction.com',
    phone: '+237699529161',
    status: 'Active',
    focus: 'Oversees solar, electrical, plumbing, and finishing service quality across live jobs.',
  },
];

const Team: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [form] = Form.useForm<TeamFormValues>();

  const loadTeam = () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem(storageKey);

      if (!stored) {
        setTeamMembers(defaultTeamMembers);
        localStorage.setItem(storageKey, JSON.stringify(defaultTeamMembers));
        return;
      }

      const parsed = JSON.parse(stored);
      setTeamMembers(Array.isArray(parsed) && parsed.length ? parsed : defaultTeamMembers);
    } catch (error) {
      console.error(error);
      setTeamMembers(defaultTeamMembers);
      message.warning('Team workspace was reset to the default members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const filteredTeam = useMemo(() => {
    if (!search.trim()) {
      return teamMembers;
    }

    const query = search.toLowerCase();
    return teamMembers.filter((member) =>
      [member.name, member.role, member.department, member.email, member.focus].some((field) =>
        field?.toLowerCase().includes(query)
      )
    );
  }, [search, teamMembers]);

  const persistTeam = (members: TeamMember[]) => {
    localStorage.setItem(storageKey, JSON.stringify(members));
    setTeamMembers(members);
  };

  const openCreateModal = () => {
    setEditingMember(null);
    form.resetFields();
    form.setFieldsValue({ status: 'Active' });
    setIsModalOpen(true);
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    form.setFieldsValue(member);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload: TeamMember = {
        id: editingMember?.id || `${values.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
        name: values.name.trim(),
        role: values.role.trim(),
        department: values.department.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        status: values.status,
        focus: values.focus.trim(),
      };

      const nextMembers = editingMember
        ? teamMembers.map((member) => (member.id === editingMember.id ? payload : member))
        : [payload, ...teamMembers];

      persistTeam(nextMembers);
      setIsModalOpen(false);
      form.resetFields();
      message.success(editingMember ? 'Team member updated.' : 'Team member added.');
    } catch (error) {
      if ((error as { errorFields?: unknown[] })?.errorFields) {
        return;
      }

      console.error(error);
      message.error('The team member could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (member: TeamMember) => {
    Modal.confirm({
      className: 'admin-confirm-modal',
      centered: true,
      title: (
        <DialogHeading
          eyebrow="Remove Member"
          title="Delete this team record?"
          description="This removes the member from the admin workspace roster."
        />
      ),
      content: (
        <div className="dialog-note">
          <strong>{member.name}</strong>
          <span>{member.role}</span>
        </div>
      ),
      okText: 'Delete member',
      cancelText: 'Keep member',
      okType: 'danger',
      onOk: async () => {
        const nextMembers = teamMembers.filter((item) => item.id !== member.id);
        persistTeam(nextMembers);
        message.success('Team member removed.');
      },
    });
  };

  const columns = [
    {
      title: 'Member',
      key: 'member',
      render: (_: unknown, record: TeamMember) => (
        <div className="table-media-cell">
          <div className="team-avatar-badge">
            <TeamOutlined />
          </div>
          <div>
            <Text strong>{record.name}</Text>
            <div><Text type="secondary">{record.role}</Text></div>
          </div>
        </div>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_: unknown, record: TeamMember) => (
        <div>
          <div><Text>{record.email}</Text></div>
          <Text type="secondary">{record.phone}</Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value: TeamMember['status']) => {
        const color = value === 'On Site' ? 'gold' : value === 'Remote' ? 'blue' : 'green';
        return <Tag color={color}>{value}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: TeamMember) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => setSelectedMember(record)} />
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <Card
        title="Team management"
        extra={(
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadTeam}>Refresh</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>Add member</Button>
          </Space>
        )}
      >
        <div className="page-toolbar">
          <Search
            placeholder="Search by name, role, department, or email"
            allowClear
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Text type="secondary">
            Keep a structured roster of the people responsible for operations, delivery, and client response.
          </Text>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredTeam}
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      <Modal
        title={(
          <DialogHeading
            eyebrow={editingMember ? 'Update Member' : 'New Member'}
            title={editingMember ? 'Edit team member' : 'Add team member'}
            description={editingMember ? 'Update role, department, and contact details for this team member.' : 'Add a team member so ownership and responsibilities stay clear in the admin workspace.'}
          />
        )}
        open={isModalOpen}
        onOk={handleSubmit}
        confirmLoading={saving}
        onCancel={() => setIsModalOpen(false)}
        width={700}
        centered
        destroyOnHidden
        rootClassName="admin-modal-shell"
        okText={editingMember ? 'Save changes' : 'Add member'}
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical" initialValues={{ status: 'Active' }}>
          <Form.Item name="name" label="Full name" rules={[{ required: true, message: 'Enter the member name.' }]}>
            <Input placeholder="Martin Ebong" />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Enter the role.' }]}>
            <Input placeholder="Managing Director" />
          </Form.Item>
          <Form.Item name="department" label="Department" rules={[{ required: true, message: 'Enter the department.' }]}>
            <Input placeholder="Operations" />
          </Form.Item>
          <Form.Item name="email" label="Email address" rules={[{ required: true, message: 'Enter an email address.' }, { type: 'email', message: 'Enter a valid email address.' }]}>
            <Input placeholder="name@cebatconstruction.com" />
          </Form.Item>
          <Form.Item name="phone" label="Phone number" rules={[{ required: true, message: 'Enter a phone number.' }]}>
            <Input placeholder="+237699529161" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Select a status.' }]}>
            <Select
              options={['Active', 'On Site', 'Remote'].map((value) => ({
                label: value,
                value,
              }))}
            />
          </Form.Item>
          <Form.Item name="focus" label="Focus area" rules={[{ required: true, message: 'Enter a focus area.' }]}>
            <TextArea rows={4} placeholder="Describe the member's main responsibility or ownership area." />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={(
          selectedMember ? (
            <DialogHeading
              eyebrow="Team Member"
              title={selectedMember.name}
              description="Review role ownership and contact details for this team member."
            />
          ) : null
        )}
        open={Boolean(selectedMember)}
        width={520}
        onClose={() => setSelectedMember(null)}
        rootClassName="admin-drawer-shell"
      >
        {selectedMember && (
          <div className="detail-stack">
            <div className="team-profile-hero">
              <div className="team-avatar-badge team-avatar-badge-large">
                <TeamOutlined />
              </div>
              <div>
                <Text strong>{selectedMember.role}</Text>
                <p>{selectedMember.department}</p>
              </div>
            </div>
            <div>
              <Text strong>Email</Text>
              <p><a href={`mailto:${selectedMember.email}`}>{selectedMember.email}</a></p>
            </div>
            <div>
              <Text strong>Phone</Text>
              <p><a href={`tel:${selectedMember.phone}`}>{selectedMember.phone}</a></p>
            </div>
            <div>
              <Text strong>Status</Text>
              <p>{selectedMember.status}</p>
            </div>
            <div>
              <Text strong>Focus area</Text>
              <p>{selectedMember.focus}</p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Team;
