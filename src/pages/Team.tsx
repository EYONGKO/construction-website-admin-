import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  Upload,
  message,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  TeamOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import DialogHeading from '../components/DialogHeading.tsx';
import { siteContentApi } from '../services/api.ts';
import type { SiteContent, SiteTeamMember } from '../types/data.ts';
import { resolveImageUrl } from '../utils/format.ts';

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
  image?: string;
  imagePosition?: string;
}

interface TeamFormValues {
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  status: TeamMember['status'];
  focus: string;
  image?: string;
  imagePosition?: string;
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
    image: '/images/team-hero.jpg',
    imagePosition: 'center 18%',
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
    image: '/images/team-hero.jpg',
    imagePosition: 'center 42%',
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
    image: '/images/team-hero.jpg',
    imagePosition: 'center 68%',
  },
];

const readFileAsDataUrl = (file: RcFile) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });

const Team: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [imageFiles, setImageFiles] = useState<UploadFile[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [form] = Form.useForm<TeamFormValues>();

  const readStoredTeam = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        return defaultTeamMembers;
      }

      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length ? parsed : defaultTeamMembers;
    } catch (error) {
      console.error(error);
      return defaultTeamMembers;
    }
  };

  const mergeTeamMembers = useCallback((siteTeamMembers: SiteTeamMember[] = [], storedMembers: TeamMember[]) => {
    const storedById = new Map(storedMembers.map((member) => [member.id, member]));
    const resolvedSiteMembers = siteTeamMembers.length ? siteTeamMembers : defaultTeamMembers;

    return resolvedSiteMembers.map((member, index) => {
      const fallback = defaultTeamMembers[index % defaultTeamMembers.length];
      const stored = storedById.get(member.id);

      return {
        id: member.id || stored?.id || fallback.id,
        name: member.name || stored?.name || fallback.name,
        role: member.role || stored?.role || fallback.role,
        department: stored?.department || fallback.department,
        email: stored?.email || fallback.email,
        phone: stored?.phone || fallback.phone,
        status: stored?.status || fallback.status,
        focus: member.bio || stored?.focus || fallback.focus,
        image: member.image || stored?.image || fallback.image,
        imagePosition: member.imagePosition || stored?.imagePosition || fallback.imagePosition,
      };
    });
  }, []);

  const loadTeam = useCallback(async () => {
    try {
      setLoading(true);
      const storedMembers = readStoredTeam();
      const data = await siteContentApi.get();
      setSiteContent(data);
      const mergedMembers = mergeTeamMembers(data.teamMembers || [], storedMembers);
      setTeamMembers(mergedMembers);
      localStorage.setItem(storageKey, JSON.stringify(mergedMembers));
    } catch (error) {
      console.error(error);
      const fallbackMembers = readStoredTeam();
      setTeamMembers(fallbackMembers);
      localStorage.setItem(storageKey, JSON.stringify(fallbackMembers));
      message.warning('Team page is showing the local workspace copy because backend team content could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [mergeTeamMembers]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

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

  const syncTeamToFrontend = async (members: TeamMember[]) => {
    const latestSiteContent = siteContent || await siteContentApi.get();
    const nextSiteContent: SiteContent = {
      ...latestSiteContent,
      teamMembers: members.map((member) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        bio: member.focus,
        image: member.image || '',
        imagePosition: member.imagePosition || 'center',
      })),
    };

    const saved = await siteContentApi.update(nextSiteContent);
    setSiteContent(saved);
  };

  const openCreateModal = () => {
    setEditingMember(null);
    form.resetFields();
    form.setFieldsValue({ status: 'Active', imagePosition: 'center' });
    setImageFiles([]);
    setIsModalOpen(true);
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    form.setFieldsValue(member);
    setImageFiles(
      member.image
        ? [{
            uid: `${member.id}-image`,
            name: `${member.name}-image`,
            status: 'done',
            url: resolveImageUrl(member.image),
          }]
        : []
    );
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const image = imageFiles[0]
        ? imageFiles[0].originFileObj
          ? await readFileAsDataUrl(imageFiles[0].originFileObj as RcFile)
          : String(imageFiles[0].url || imageFiles[0].thumbUrl || '')
        : editingMember?.image || '';

      const payload: TeamMember = {
        id: editingMember?.id || `${values.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
        name: values.name.trim(),
        role: values.role.trim(),
        department: values.department.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        status: values.status,
        focus: values.focus.trim(),
        image,
        imagePosition: values.imagePosition?.trim() || editingMember?.imagePosition || 'center',
      };

      const nextMembers = editingMember
        ? teamMembers.map((member) => (member.id === editingMember.id ? payload : member))
        : [payload, ...teamMembers];

      await syncTeamToFrontend(nextMembers);
      persistTeam(nextMembers);
      setIsModalOpen(false);
      form.resetFields();
      setImageFiles([]);
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
        try {
          setSaving(true);
          const nextMembers = teamMembers.filter((item) => item.id !== member.id);
          await syncTeamToFrontend(nextMembers);
          persistTeam(nextMembers);
          message.success('Team member removed.');
        } catch (error) {
          console.error(error);
          message.error('The team member could not be removed from the shared website content.');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const columns = [
    {
      title: 'Member',
      key: 'member',
      render: (_: unknown, record: TeamMember) => (
        <div className="table-media-cell">
          {record.image ? (
            <img src={resolveImageUrl(record.image)} alt={record.name} className="service-thumb" />
          ) : (
            <div className="team-avatar-badge">
              <TeamOutlined />
            </div>
          )}
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
          scroll={{ x: 860 }}
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
          <Form.Item
            label="Profile image"
            validateStatus={imageFiles.length ? '' : 'warning'}
            help={imageFiles.length ? 'This image will be shown in both the admin panel and the frontend team section.' : 'Upload a photo if you want this team member to show with a real image.'}
          >
            <Upload
              listType="picture-card"
              fileList={imageFiles}
              maxCount={1}
              accept="image/*"
              beforeUpload={() => false}
              onChange={({ fileList }) => setImageFiles(fileList)}
              onPreview={(file) => {
                const previewSource = resolveImageUrl(String(file.url || file.thumbUrl || ''));
                if (previewSource) {
                  window.open(previewSource, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              {imageFiles.length >= 1 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Add image</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item name="imagePosition" label="Image position">
            <Input placeholder="center 42%" />
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
              {selectedMember.image ? (
                <img
                  src={resolveImageUrl(selectedMember.image)}
                  alt={selectedMember.name}
                  className="service-thumb team-avatar-badge-large"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="team-avatar-badge team-avatar-badge-large">
                  <TeamOutlined />
                </div>
              )}
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
