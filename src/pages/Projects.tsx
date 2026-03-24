import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  Modal,
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
  UploadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { projectApi } from '../services/api.ts';
import type { AdminProject } from '../types/data.ts';
import { formatDate, getProjectImage, resolveImageUrl, shortenText } from '../utils/format.ts';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import DialogHeading from '../components/DialogHeading.tsx';
import MobileProjectTable from '../components/MobileTable.tsx';
import { productCatalog } from '../data/productCatalog.ts';

const { Search, TextArea } = Input;
const { Text } = Typography;

interface ProjectFormValues {
  title: string;
  location: string;
  description: string;
  longDescription?: string;
  category?: string;
  serviceId?: string;
  serviceTitle?: string;
  completedDate?: string;
}

const readFileAsDataUrl = (file: RcFile) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<AdminProject | null>(null);
  const [editingProject, setEditingProject] = useState<AdminProject | null>(null);
  const [form] = Form.useForm<ProjectFormValues>();
  const [imageFiles, setImageFiles] = useState<UploadFile[]>([]);

  const syncMissingCatalogProjects = useCallback(async (currentProjects: AdminProject[]) => {
    const existingTitles = new Set(currentProjects.map((project) => project.title.toLowerCase()));
    const missingProducts = productCatalog.filter(
      (product) => !existingTitles.has(product.title.toLowerCase())
    );

    if (!missingProducts.length) {
      return false;
    }

    await Promise.all(missingProducts.map((product) => projectApi.create(product)));
    return true;
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectApi.getAll();
      const synced = await syncMissingCatalogProjects(data);
      const finalData = synced ? await projectApi.getAll() : data;
      setProjects(finalData);
    } catch (error) {
      console.error(error);
      message.error('Unable to load projects from the backend.');
    } finally {
      setLoading(false);
    }
  }, [syncMissingCatalogProjects]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filteredProjects = useMemo(() => {
    if (!search.trim()) {
      return projects;
    }

    const query = search.toLowerCase();
    return projects.filter((project) =>
      [project.title, project.location, project.description].some((field) =>
        field?.toLowerCase().includes(query)
      )
    );
  }, [projects, search]);

  const openCreateModal = () => {
    setEditingProject(null);
    form.resetFields();
    setImageFiles([]);
    setIsModalOpen(true);
  };

  const openEditModal = (project: AdminProject) => {
    setEditingProject(project);
    form.setFieldsValue({
      title: project.title,
      location: project.location,
      description: project.description,
      longDescription: project.longDescription || '',
      category: project.category || '',
      serviceId: project.serviceId || '',
      serviceTitle: project.serviceTitle || '',
      completedDate: project.completedDate || '',
    });
    setImageFiles(
      project.images.map((image, index) => ({
        uid: `${project.id}-${index}`,
        name: `project-image-${index + 1}`,
        status: 'done',
        url: resolveImageUrl(image),
      }))
    );
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!imageFiles.length) {
        message.error('Add at least one project image.');
        return;
      }

      setSaving(true);

      const images = await Promise.all(
        imageFiles.map(async (file) => {
          if (file.originFileObj) {
            return readFileAsDataUrl(file.originFileObj as RcFile);
          }

          return file.url || file.thumbUrl || '';
        })
      );

      const payload = {
        title: values.title.trim(),
        location: values.location.trim(),
        description: values.description.trim(),
        longDescription: values.longDescription?.trim() || values.description.trim(),
        category: values.category?.trim() || '',
        serviceId: values.serviceId?.trim() || '',
        serviceTitle: values.serviceTitle?.trim() || '',
        images: images.filter(Boolean),
        completedDate: values.completedDate?.trim() || null,
      };

      if (editingProject) {
        await projectApi.update(editingProject.id, payload);
        message.success('Project updated successfully.');
      } else {
        await projectApi.create(payload);
        message.success('Project created successfully.');
      }

      setIsModalOpen(false);
      form.resetFields();
      setImageFiles([]);
      await loadProjects();
    } catch (error) {
      if ((error as { errorFields?: unknown[] })?.errorFields) {
        return;
      }

      console.error(error);
      message.error('The project could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const handleCatalogSync = async () => {
    try {
      setSaving(true);
      const synced = await syncMissingCatalogProjects(projects);

      if (!synced) {
        message.success('All catalog products are already present in the backend.');
        return;
      }

      message.success('Missing catalog products were added to the backend.');
      await loadProjects();
    } catch (error) {
      console.error(error);
      message.error('The catalog could not be synced to the backend.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (project: AdminProject) => {
    Modal.confirm({
      className: 'admin-confirm-modal',
      centered: true,
      okText: 'Delete project',
      cancelText: 'Keep project',
      title: (
        <DialogHeading
          eyebrow="Remove Record"
          title="Delete this project?"
          description="This will remove the project from the admin panel and the public frontend catalog."
        />
      ),
      content: (
        <div className="dialog-note">
          <strong>{project.title}</strong>
          <span>{project.location}</span>
        </div>
      ),
      okType: 'danger',
      onOk: async () => {
        try {
          await projectApi.delete(project.id);
          message.success('Project deleted.');
          await loadProjects();
        } catch (error) {
          console.error(error);
          message.error('The project could not be deleted.');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Project',
      key: 'project',
      render: (_: unknown, record: AdminProject) => (
        <div className="table-media-cell">
          <img src={getProjectImage(record)} alt={record.title} className="table-thumb" />
          <div>
            <Text strong>{record.title}</Text>
            <div><Text type="secondary">{record.location}</Text></div>
          </div>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (value: string) => shortenText(value, 100),
    },
    {
      title: 'Category',
      key: 'category',
      render: (_: unknown, record: AdminProject) => (
        <Space wrap>
          <Tag>{record.category || 'No category'}</Tag>
          <Tag color="blue">{record.serviceTitle || 'No service'}</Tag>
        </Space>
      ),
    },
    {
      title: 'Assets',
      key: 'assets',
      render: (_: unknown, record: AdminProject) => <Tag>{record.images.length} image(s)</Tag>,
    },
    {
      title: 'Completed date',
      dataIndex: 'completedDate',
      key: 'completedDate',
      render: (value: string) => formatDate(value),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: AdminProject) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => setSelectedProject(record)} />
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <Card
        title="Projects and products"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadProjects}>Refresh</Button>
            <Button onClick={handleCatalogSync} loading={saving}>Sync catalog</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>New project</Button>
          </Space>
        }
      >
        <div className="page-toolbar">
          <Search
            placeholder="Search by title, location, or description"
            allowClear
            onChange={(event) => setSearch(event.target.value)}
            value={search}
          />
          <Text type="secondary">
            Changes here update the records used by the frontend projects catalog.
          </Text>
        </div>

        <div className="desktop-table-view">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredProjects}
            loading={loading}
            scroll={{ x: 980 }}
            pagination={{ pageSize: 8 }}
          />
        </div>

        <MobileProjectTable
          data={filteredProjects}
          onView={setSelectedProject}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      </Card>

      <Modal
        title={
          <DialogHeading
            eyebrow={editingProject ? 'Update Project' : 'New Project'}
            title={editingProject ? 'Edit project' : 'Create project'}
            description={editingProject ? 'Update the project content, images, and published information.' : 'Add a polished project record that will appear in the public catalog.'}
          />
        }
        open={isModalOpen}
        onOk={handleSubmit}
        confirmLoading={saving}
        onCancel={() => setIsModalOpen(false)}
        width={760}
        centered
        destroyOnHidden
        rootClassName="admin-modal-shell"
        okText={editingProject ? 'Save changes' : 'Create project'}
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Enter a project title.' }]}>
            <Input placeholder="Solar Panels" />
          </Form.Item>
          <Form.Item name="location" label="Location" rules={[{ required: true, message: 'Enter the project location.' }]}>
            <Input placeholder="Yaounde, Cameroon" />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Enter a public description.' }]}>
            <TextArea rows={4} placeholder="Short public-facing description for the website." />
          </Form.Item>
          <Form.Item name="longDescription" label="Detailed description">
            <TextArea rows={4} placeholder="Longer product or project description for the detail page." />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Input placeholder="Solar Solutions" />
          </Form.Item>
          <Form.Item name="serviceTitle" label="Linked service name">
            <Input placeholder="Solar Solutions" />
          </Form.Item>
          <Form.Item name="serviceId" label="Linked service ID">
            <Input placeholder="solar-solutions" />
          </Form.Item>
          <Form.Item
            label="Project images"
            required
            validateStatus={imageFiles.length ? '' : 'error'}
            help={imageFiles.length ? 'Uploaded images will be shown on the admin panel and frontend project pages.' : 'Add at least one image.'}
          >
            <Upload
              listType="picture-card"
              fileList={imageFiles}
              multiple
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
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Add image</div>
              </div>
            </Upload>
          </Form.Item>
          <Form.Item name="completedDate" label="Completed date">
            <Input type="date" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={
          selectedProject ? (
            <DialogHeading
              eyebrow="Project Preview"
              title={selectedProject.title}
              description="Review how this project content and imagery are presented across the admin workspace."
            />
          ) : null
        }
        open={Boolean(selectedProject)}
        width={560}
        onClose={() => setSelectedProject(null)}
        rootClassName="admin-drawer-shell"
      >
        {selectedProject && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <img src={getProjectImage(selectedProject)} alt={selectedProject.title} className="drawer-hero-image" />
            <div className="detail-stack">
              <div>
                <Text strong>Location</Text>
                <p>{selectedProject.location}</p>
              </div>
              <div>
                <Text strong>Description</Text>
                <p>{selectedProject.description}</p>
              </div>
              <div>
                <Text strong>Long description</Text>
                <p>{selectedProject.longDescription || selectedProject.description}</p>
              </div>
              <div>
                <Text strong>Category</Text>
                <p>{selectedProject.category || 'Not set'}</p>
              </div>
              <div>
                <Text strong>Linked service</Text>
                <p>{selectedProject.serviceTitle || selectedProject.serviceId || 'Not set'}</p>
              </div>
              <div>
                <Text strong>Completed date</Text>
                <p>{formatDate(selectedProject.completedDate)}</p>
              </div>
              <div>
                <Text strong>Project images</Text>
                <div className="project-image-grid">
                  {selectedProject.images.map((image) => (
                    <img key={image} src={resolveImageUrl(image)} alt={selectedProject.title} className="project-image-grid-item" />
                  ))}
                </div>
              </div>
            </div>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default Projects;
