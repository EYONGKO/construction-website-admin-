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
  Upload,
  message,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import { serviceApi } from '../services/api.ts';
import type { AdminService } from '../types/data.ts';
import { getServiceIconLabel, getServiceImage, inferServiceIcon, resolveImageUrl, shortenText } from '../utils/format.ts';
import DialogHeading from '../components/DialogHeading.tsx';

const { Search, TextArea } = Input;
const { Text } = Typography;

interface ServiceFormValues {
  title: string;
  description: string;
  icon: string;
}

const iconOptions = ['solar', 'power', 'paint', 'pipe', 'build'];

const convertFileToBase64 = (file: RcFile) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });

const Services: React.FC = () => {
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<AdminService | null>(null);
  const [editingService, setEditingService] = useState<AdminService | null>(null);
  const [imageFiles, setImageFiles] = useState<UploadFile[]>([]);
  const [form] = Form.useForm<ServiceFormValues>();

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await serviceApi.getAll();
      setServices(data);
    } catch (error) {
      console.error(error);
      message.error('Unable to load services from the backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const filteredServices = useMemo(() => {
    if (!search.trim()) {
      return services;
    }

    const query = search.toLowerCase();
    return services.filter((service) =>
      [service.title, service.description, service.icon].some((field) =>
        field?.toLowerCase().includes(query)
      )
    );
  }, [services, search]);

  const openCreateModal = () => {
    setEditingService(null);
    form.setFieldsValue({ icon: 'build' });
    setImageFiles([]);
    setIsModalOpen(true);
  };

  const openEditModal = (service: AdminService) => {
    setEditingService(service);
    form.setFieldsValue({
      title: service.title,
      description: service.description,
      icon: service.icon || inferServiceIcon(service.title),
    });
    setImageFiles(
      service.image
        ? [{
            uid: `${service.id}-image`,
            name: `${service.title}-image`,
            status: 'done',
            url: resolveImageUrl(service.image),
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
          ? await convertFileToBase64(imageFiles[0].originFileObj as RcFile)
          : imageFiles[0].url || imageFiles[0].thumbUrl || ''
        : '';

      const payload = {
        title: values.title.trim(),
        description: values.description.trim(),
        icon: values.icon,
        image,
      };

      if (editingService) {
        await serviceApi.update(editingService.id, payload);
        message.success('Service updated successfully.');
      } else {
        await serviceApi.create(payload);
        message.success('Service created successfully.');
      }

      setIsModalOpen(false);
      form.resetFields();
      setImageFiles([]);
      await loadServices();
    } catch (error) {
      if ((error as { errorFields?: unknown[] })?.errorFields) {
        return;
      }

      console.error(error);
      message.error('The service could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (service: AdminService) => {
    Modal.confirm({
      className: 'admin-confirm-modal',
      centered: true,
      title: (
        <DialogHeading
          eyebrow="Remove Record"
          title="Delete this service?"
          description="The service will be removed from the backend and from the public frontend service pages."
        />
      ),
      content: (
        <div className="dialog-note">
          <strong>{service.title}</strong>
          <span>{service.icon || 'No icon label'}</span>
        </div>
      ),
      okText: 'Delete service',
      cancelText: 'Keep service',
      okType: 'danger',
      onOk: async () => {
        try {
          await serviceApi.delete(service.id);
          message.success('Service deleted.');
          await loadServices();
        } catch (error) {
          console.error(error);
          message.error('The service could not be deleted.');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Service',
      key: 'service',
      render: (_: unknown, record: AdminService) => (
        <div className="service-row">
          {record.image ? (
            <img src={getServiceImage(record)} alt={record.title} className="service-thumb" />
          ) : (
            <div className="service-thumb service-thumb-placeholder">
              <span>{getServiceIconLabel(record).slice(0, 2).toUpperCase()}</span>
            </div>
          )}
          <div>
            <Text strong>{record.title}</Text>
            <div><Text type="secondary">Icon: {getServiceIconLabel(record)}</Text></div>
          </div>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (value: string) => shortenText(value, 120),
    },
    {
      title: 'Media',
      key: 'media',
      render: (_: unknown, record: AdminService) => (
        <Space wrap>
          <Tag>{record.icon || 'auto'}</Tag>
          <Tag color={record.image ? 'green' : 'default'}>{record.image ? 'Image added' : 'No image'}</Tag>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: AdminService) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => setSelectedService(record)} />
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <Card
        title="Website services"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadServices}>Refresh</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>New service</Button>
          </Space>
        }
      >
        <div className="page-toolbar">
          <Search
            placeholder="Search by title, icon, or description"
            allowClear
            onChange={(event) => setSearch(event.target.value)}
            value={search}
          />
          <Text type="secondary">
            These records are used by the public services page and service detail views.
          </Text>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredServices}
          loading={loading}
          scroll={{ x: 820 }}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      <Modal
        title={
          <DialogHeading
            eyebrow={editingService ? 'Update Service' : 'New Service'}
            title={editingService ? 'Edit service' : 'Create service'}
            description={editingService ? 'Refine the service description, icon, and image shown on the frontend.' : 'Create a service entry with strong presentation for both admin and frontend.'}
          />
        }
        open={isModalOpen}
        onOk={handleSubmit}
        confirmLoading={saving}
        onCancel={() => setIsModalOpen(false)}
        width={680}
        centered
        destroyOnHidden
        rootClassName="admin-modal-shell"
        okText={editingService ? 'Save changes' : 'Create service'}
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical" initialValues={{ icon: 'build' }}>
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Enter a service title.' }]}>
            <Input placeholder="Solar Solutions" />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Enter a service description.' }]}>
            <TextArea rows={4} placeholder="Public-facing description for the frontend service card." />
          </Form.Item>
          <Form.Item name="icon" label="Icon" rules={[{ required: true, message: 'Select an icon.' }]}>
            <Select options={iconOptions.map((value) => ({ label: value, value }))} />
          </Form.Item>
          <Form.Item
            label="Service image"
            validateStatus={imageFiles.length ? '' : 'warning'}
            help={imageFiles.length ? 'This image will be shown on the admin panel and public service pages.' : 'Add a service image when you want a real photo to show on the frontend.'}
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
        </Form>
      </Modal>

      <Drawer
        title={
          selectedService ? (
            <DialogHeading
              eyebrow="Service Preview"
              title={selectedService.title}
              description="Check the text, image, and frontend presentation details before publishing changes."
            />
          ) : null
        }
        open={Boolean(selectedService)}
        width={520}
        onClose={() => setSelectedService(null)}
        rootClassName="admin-drawer-shell"
      >
        {selectedService && (
          <div className="detail-stack">
            {getServiceImage(selectedService) ? (
              <img src={getServiceImage(selectedService)} alt={selectedService.title} className="drawer-hero-image" />
            ) : null}
            <div>
              <Text strong>Frontend icon</Text>
              <p>{selectedService.icon || 'auto'}</p>
            </div>
            <div>
              <Text strong>Service image</Text>
              <p>{selectedService.image ? 'Uploaded and visible on the frontend.' : 'No service image uploaded yet.'}</p>
            </div>
            <div>
              <Text strong>Description</Text>
              <p>{selectedService.description}</p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Services;
