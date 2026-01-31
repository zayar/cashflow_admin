// src/layouts/BlogLayout.tsx
import { Layout, Menu } from 'antd';
import { Outlet } from 'react-router-dom';

const { Header, Content, Footer } = Layout;

const BlogLayout = () => {
  return (
    <Layout>
      <Header>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
          <Menu.Item key="1">Home</Menu.Item>
          <Menu.Item key="2">Posts</Menu.Item>
          <Menu.Item key="3">About</Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
          <Outlet /> {/* This is where your blog page components will be rendered */}
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Blog ©2024 Created by Admin</Footer>
    </Layout>
  );
};

export default BlogLayout;
