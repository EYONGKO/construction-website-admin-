import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, Col, Form, Input, Row, Space, Typography, Upload, message } from 'antd';
import { ReloadOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import { siteContentApi } from '../services/api.ts';
import type { SiteContent } from '../types/data.ts';
import { resolveImageUrl } from '../utils/format.ts';

const { TextArea } = Input;
const { Text } = Typography;

const imageFields = [
  'homeHeroImage',
  'servicesHeroImage',
  'productsHeroImage',
  'aboutHeroImage',
  'contactHeroImage',
  'quoteHeroImage',
] as const;

const defaultSiteContent: SiteContent = {
  companyName: 'CEBAT Construction',
  companyTagline: 'Construction and Technical Services',
  address: 'Yaounde, Cameroon',
  phone: '+237 6 99 52 91 61',
  email: 'info@cebatconstruction.com',
  businessHours: 'Mon - Sat: 7:30 AM - 7:00 PM',
  footerDescription: 'Your trusted partner for construction, electrical solutions, and technical services in Yaounde, Cameroon. We bring quality and structure to every project.',
  facebookUrl: 'https://www.facebook.com/',
  whatsappUrl: 'https://wa.me/237699529161',
  linkedinUrl: 'https://www.linkedin.com/',
  homeHeroTitle: 'Brightening Yaounde with Quality and Style',
  homeHeroText: 'Your trusted partner for construction, electrical solutions, and technical services in Cameroon. From solar installations to building construction, we bring expertise to every project.',
  homeHeroImage: '/images/home-hero.jpg',
  servicesIntroTitle: 'Technical and construction services built for quality delivery.',
  servicesIntroText: 'We provide dependable execution across solar, electrical, painting, plumbing, POP installation, and building services for clients across Cameroon.',
  servicesHeroImage: '/images/services-hero.jpg',
  productsIntroTitle: 'Browse our products catalog and featured technical supplies.',
  productsIntroText: 'Explore quality construction and electrical supplies presented in a cleaner, product-focused layout.',
  productsHeroImage: '/images/products-hero.jpg',
  aboutBannerTitle: 'Meet the team behind our construction and technical delivery.',
  aboutBannerText: 'We help clients deliver construction and technical projects with a practical approach, strong supervision, and a professional finish.',
  aboutHeroImage: '/images/team-hero.jpg',
  contactBannerTitle: 'Talk to our team about your next construction or technical project.',
  contactBannerText: 'Reach out for consultations, quotations, product enquiries, and project planning support.',
  contactHeroImage: '/images/contact-hero.jpg',
  quoteBannerTitle: 'Get your quote for construction, technical, and finishing projects.',
  quoteBannerText: 'Send us your project details and our team will review the scope, advise on the right service, and respond with a quote.',
  quoteHeroImage: '/images/quote-hero.jpg',
  ctaTitle: 'Ready to Start Your Project?',
  ctaText: 'Contact us today for a free consultation and quote. Our team is ready to help you with all your construction and electrical needs.',
  teamMembers: [
    {
      id: 'martin-ebong',
      name: 'Martin Ebong',
      role: 'Managing Director',
      bio: 'Leads project strategy, client coordination, and execution standards across CEBAT Construction delivery teams.',
      image: '/images/team-hero.jpg',
      imagePosition: 'center 18%',
    },
    {
      id: 'grace-nkeng',
      name: 'Grace Nkeng',
      role: 'Operations and Site Supervisor',
      bio: 'Coordinates site activities, workforce planning, and day-to-day delivery to keep projects organized and on schedule.',
      image: '/images/team-hero.jpg',
      imagePosition: 'center 42%',
    },
    {
      id: 'daniel-fon',
      name: 'Daniel Fon',
      role: 'Technical Services Lead',
      bio: 'Oversees solar, electrical, plumbing, and finishing installations with a strong focus on safety and quality workmanship.',
      image: '/images/team-hero.jpg',
      imagePosition: 'center 68%',
    },
  ],
};

const readFileAsDataUrl = (file: RcFile) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });

const buildUploadList = (value?: string, name = 'image'): UploadFile[] =>
  value
    ? [{
        uid: name,
        name,
        status: 'done',
        url: resolveImageUrl(value),
      }]
    : [];

const Content: React.FC = () => {
  const [form] = Form.useForm<SiteContent>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroUploads, setHeroUploads] = useState<Record<string, UploadFile[]>>({});
  const [teamUploads, setTeamUploads] = useState<Record<string, UploadFile[]>>({});

  const syncUploadState = useCallback((content: SiteContent) => {
    const heroState: Record<string, UploadFile[]> = {};
    imageFields.forEach((field) => {
      heroState[field] = buildUploadList(content[field], field);
    });

    const teamState: Record<string, UploadFile[]> = {};
    content.teamMembers.forEach((member, index) => {
      teamState[`team-${index}`] = buildUploadList(member.image, `${member.id || 'team'}-image`);
    });

    setHeroUploads(heroState);
    setTeamUploads(teamState);
  }, []);

  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      const data = await siteContentApi.get();
      const merged = { ...defaultSiteContent, ...data };
      form.setFieldsValue(merged);
      syncUploadState(merged);
    } catch (error) {
      console.error(error);
      form.setFieldsValue(defaultSiteContent);
      syncUploadState(defaultSiteContent);
      message.warning('The website content service could not be loaded. Showing default values.');
    } finally {
      setLoading(false);
    }
  }, [form, syncUploadState]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleImageChange = async (
    fieldPath: string | (string | number)[],
    key: string,
    fileList: UploadFile[]
  ) => {
    const nextFile = fileList[0];
    let nextValue = '';

    if (nextFile?.originFileObj) {
      nextValue = await readFileAsDataUrl(nextFile.originFileObj as RcFile);
    } else if (nextFile?.url || nextFile?.thumbUrl) {
      nextValue = String(nextFile.url || nextFile.thumbUrl || '');
    }

    form.setFieldValue(fieldPath, nextValue);

    if (Array.isArray(fieldPath)) {
      setTeamUploads((current) => ({
        ...current,
        [key]: buildUploadList(nextValue, key),
      }));
      return;
    }

    setHeroUploads((current) => ({
      ...current,
      [key]: buildUploadList(nextValue, key),
    }));
  };

  const renderImageUpload = (
    key: string,
    fieldPath: string | (string | number)[],
    uploads: Record<string, UploadFile[]>
  ) => (
    <Upload
      listType="picture-card"
      fileList={uploads[key] || []}
      maxCount={1}
      accept="image/*"
      beforeUpload={() => false}
      onChange={async ({ fileList }) => {
        await handleImageChange(fieldPath, key, fileList);
      }}
      onPreview={(file) => {
        const source = resolveImageUrl(String(file.url || file.thumbUrl || ''));
        if (source) {
          window.open(source, '_blank', 'noopener,noreferrer');
        }
      }}
    >
      {(uploads[key] || []).length >= 1 ? null : (
        <div>
          <UploadOutlined />
          <div style={{ marginTop: 8 }}>Upload image</div>
        </div>
      )}
    </Upload>
  );

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await siteContentApi.update(values);
      message.success('Website content updated successfully.');
    } catch (error) {
      if ((error as { errorFields?: unknown[] })?.errorFields) {
        return;
      }

      console.error(error);
      message.error('The website content could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <Card
        title="Website content management"
        extra={(
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadContent} loading={loading}>Refresh</Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>Save content</Button>
          </Space>
        )}
      >
        <Text type="secondary">
          Update the main public-facing content here. Image-based sections now use upload fields instead of URL inputs.
        </Text>

        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Row gutter={[20, 0]}>
            <Col xs={24} xl={12}>
              <Card size="small" title="Company details">
                <Form.Item name="companyName" label="Company name" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name="companyTagline" label="Tagline" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name="address" label="Address" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name="phone" label="Phone" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}><Input /></Form.Item>
                <Form.Item name="businessHours" label="Business hours" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name="footerDescription" label="Footer description" rules={[{ required: true }]}><TextArea rows={4} /></Form.Item>
              </Card>
            </Col>
            <Col xs={24} xl={12}>
              <Card size="small" title="Social links">
                <Form.Item name="facebookUrl" label="Facebook URL"><Input /></Form.Item>
                <Form.Item name="whatsappUrl" label="WhatsApp URL" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name="linkedinUrl" label="LinkedIn URL"><Input /></Form.Item>
              </Card>
            </Col>
          </Row>

          <Row gutter={[20, 0]} style={{ marginTop: 20 }}>
            <Col xs={24} xl={12}>
              <Card size="small" title="Home page">
                <Form.Item name="homeHeroTitle" label="Hero title" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name="homeHeroText" label="Hero text" rules={[{ required: true }]}><TextArea rows={4} /></Form.Item>
                <Form.Item label="Home hero image">{renderImageUpload('homeHeroImage', 'homeHeroImage', heroUploads)}</Form.Item>
                <Form.Item name="ctaTitle" label="CTA title" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name="ctaText" label="CTA text" rules={[{ required: true }]}><TextArea rows={4} /></Form.Item>
              </Card>
            </Col>
            <Col xs={24} xl={12}>
              <Card size="small" title="Page intros">
                <Form.Item name="servicesIntroTitle" label="Services page title" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name="servicesIntroText" label="Services page text" rules={[{ required: true }]}><TextArea rows={3} /></Form.Item>
                <Form.Item label="Services hero image">{renderImageUpload('servicesHeroImage', 'servicesHeroImage', heroUploads)}</Form.Item>
                <Form.Item name="productsIntroTitle" label="Products page title" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name="productsIntroText" label="Products page text" rules={[{ required: true }]}><TextArea rows={3} /></Form.Item>
                <Form.Item label="Products hero image">{renderImageUpload('productsHeroImage', 'productsHeroImage', heroUploads)}</Form.Item>
                <Form.Item name="aboutBannerTitle" label="About page title" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name="aboutBannerText" label="About page text" rules={[{ required: true }]}><TextArea rows={3} /></Form.Item>
                <Form.Item label="About hero image">{renderImageUpload('aboutHeroImage', 'aboutHeroImage', heroUploads)}</Form.Item>
                <Form.Item name="contactBannerTitle" label="Contact page title" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name="contactBannerText" label="Contact page text" rules={[{ required: true }]}><TextArea rows={3} /></Form.Item>
                <Form.Item label="Contact hero image">{renderImageUpload('contactHeroImage', 'contactHeroImage', heroUploads)}</Form.Item>
                <Form.Item name="quoteBannerTitle" label="Quote page title" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name="quoteBannerText" label="Quote page text" rules={[{ required: true }]}><TextArea rows={3} /></Form.Item>
                <Form.Item label="Quote hero image">{renderImageUpload('quoteHeroImage', 'quoteHeroImage', heroUploads)}</Form.Item>
              </Card>
            </Col>
          </Row>

          <Card size="small" title="Team members" style={{ marginTop: 20 }}>
            <Form.List name="teamMembers">
              {(fields) => (
                <Row gutter={[20, 20]}>
                  {fields.map((field) => (
                    <Col xs={24} xl={8} key={field.key}>
                      <Card size="small" title={`Member ${field.name + 1}`}>
                        <Form.Item name={[field.name, 'id']} label="ID" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name={[field.name, 'name']} label="Name" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name={[field.name, 'role']} label="Role" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name={[field.name, 'bio']} label="Bio" rules={[{ required: true }]}><TextArea rows={4} /></Form.Item>
                        <Form.Item label="Team member image" rules={[{ required: true }]}>
                          {renderImageUpload(`team-${field.name}`, ['teamMembers', field.name, 'image'], teamUploads)}
                        </Form.Item>
                        <Form.Item name={[field.name, 'imagePosition']} label="Image position"><Input placeholder="center 42%" /></Form.Item>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Form.List>
          </Card>
        </Form>
      </Card>
    </div>
  );
};

export default Content;
