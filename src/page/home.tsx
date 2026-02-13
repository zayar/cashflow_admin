import {
  ArrowRightOutlined,
  RocketOutlined,
  ShopOutlined,
  SyncOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Row, Space, Statistic, Typography } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/home.css';
import paths from '../router/paths';

const quickActions: Array<{
  key: string;
  title: string;
  description: string;
  path: string;
  cta: string;
  icon: React.ReactNode;
  primary?: boolean;
}> = [
  {
    key: 'business',
    title: 'Business Management',
    description: 'Create businesses, manage subscriptions, and control account status in one flow.',
    path: paths.bizs,
    cta: 'Open Businesses',
    icon: <ShopOutlined />,
    primary: true,
  },
  {
    key: 'integration',
    title: 'Integrations',
    description: 'Configure external sync setup and keep data pipelines in a healthy state.',
    path: paths.integration,
    cta: 'Open Integrations',
    icon: <SyncOutlined />,
  },
  {
    key: 'tools',
    title: 'Admin Tools',
    description: 'Generate operational link codes and run support workflows for businesses.',
    path: paths.tools,
    cta: 'Open Tools',
    icon: <ToolOutlined />,
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="cf-home">
      <section className="cf-home-hero cf-surface-card">
        <div>
          <span className="cf-soft-tag">
            <RocketOutlined />
            Admin Command Center
          </span>
          <Typography.Title level={2} className="cf-page-title cf-home-title">
            Welcome to Cashflow Admin Portal
          </Typography.Title>
          <Typography.Paragraph className="cf-page-subtitle cf-home-subtitle">
            Manage subscriptions, business lifecycle, and operations from a single workspace.
          </Typography.Paragraph>
          <Space wrap size={12}>
            <Button type="primary" onClick={() => navigate(paths.bizs)}>
              Manage Businesses
            </Button>
            <Button onClick={() => navigate(paths.tools)}>Open Tools</Button>
          </Space>
        </div>
        <div className="cf-home-stat-wrap">
          <Statistic title="Current focus" value="Subscription Control" />
          <Typography.Paragraph className="cf-page-subtitle" style={{ marginBottom: 0 }}>
            Use Business Management to update plan, duration, and active/expired state per tenant.
          </Typography.Paragraph>
        </div>
      </section>

      <Row gutter={[16, 16]}>
        {quickActions.map((action) => (
          <Col key={action.key} xs={24} sm={12} lg={8}>
            <Card bordered={false} className="cf-home-action-card">
              <Space direction="vertical" size={14} style={{ width: '100%' }}>
                <span className="cf-home-action-icon">{action.icon}</span>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {action.title}
                </Typography.Title>
                <Typography.Paragraph className="cf-page-subtitle" style={{ marginBottom: 0 }}>
                  {action.description}
                </Typography.Paragraph>
                <Button
                  type={action.primary ? 'primary' : 'default'}
                  icon={<ArrowRightOutlined />}
                  onClick={() => navigate(action.path)}
                >
                  {action.cta}
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Home;
