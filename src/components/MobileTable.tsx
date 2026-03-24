import React from 'react';
import { Card, Tag, Button, Space } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { AdminProject } from '../types/data.ts';
import { formatDate, shortenText } from '../utils/format.ts';

interface MobileTableProps {
  data: AdminProject[];
  onView?: (record: AdminProject) => void;
  onEdit?: (record: AdminProject) => void;
  onDelete?: (record: AdminProject) => void;
}

const MobileProjectTable: React.FC<MobileTableProps> = ({
  data,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="mobile-table-view">
      {data.map((project) => (
        <Card key={project.id} className="mobile-table-card">
          <div className="mobile-table-card-title">
            {project.title}
          </div>
          <div className="mobile-table-card-content">
            <div className="mobile-table-card-item">
              <span className="mobile-table-card-label">Location:</span>
              <span className="mobile-table-card-value">{project.location}</span>
            </div>
            <div className="mobile-table-card-item">
              <span className="mobile-table-card-label">Category:</span>
              <span className="mobile-table-card-value">
                {project.category && (
                  <Tag color="blue" style={{ fontSize: '11px' }}>
                    {project.category}
                  </Tag>
                )}
              </span>
            </div>
            <div className="mobile-table-card-item">
              <span className="mobile-table-card-label">Description:</span>
              <span className="mobile-table-card-value">
                {shortenText(project.description, 60)}
              </span>
            </div>
            {project.completedDate && (
              <div className="mobile-table-card-item">
                <span className="mobile-table-card-label">Completed:</span>
                <span className="mobile-table-card-value">
                  {formatDate(project.completedDate)}
                </span>
              </div>
            )}
            <div className="mobile-table-card-item">
              <span className="mobile-table-card-label">Actions:</span>
              <Space size="small">
                {onView && (
                  <Button
                    type="text"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => onView(project)}
                  />
                )}
                {onEdit && (
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => onEdit(project)}
                  />
                )}
                {onDelete && (
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onDelete(project)}
                  />
                )}
              </Space>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MobileProjectTable;
