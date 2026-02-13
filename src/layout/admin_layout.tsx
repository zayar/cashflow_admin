import { HomeOutlined, LogoutOutlined, ShopOutlined, SyncOutlined, ToolOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Layout, Menu } from 'antd';
import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/confirmation';
import { useAuth } from '../context/auth';
import '../css/admin-layout.css';
import paths from '../router/paths';

const { Header, Content, Footer } = Layout;
const menus: Array<{ name: string; path: string; icon: React.ReactNode }> = [
    {
        name: "Home",
        path: paths.home,
        icon: <HomeOutlined />,
    },
    {
        name: "Business",
        path: paths.bizs,
        icon: <ShopOutlined />,
    },
    {
        name: "Integration",
        path: paths.integration,
        icon: <SyncOutlined />,
    },
    {
        name: "Tool",
        path: paths.tools,
        icon: <ToolOutlined />,
    },
];

const items = menus.map((m, _) => ({
    key: m.path,
    label: m.name,
    icon: m.icon,
}));

const resolveMenuKey = (pathname: string): string => {
    const matched = menus.find(({ path }) => pathname === path || pathname.startsWith(`${path}/`));
    return matched?.path ?? paths.home;
};

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { logout } = useAuth();
    const selectedKey = resolveMenuKey(pathname);
    const logo = "/cashflow_logo.png";

    return (
        <Layout className="cf-admin-layout">
            <Header className="cf-admin-header">
                <button type="button" className="cf-admin-brand" onClick={() => navigate(paths.home)}>
                    <span className="cf-admin-brand-mark">
                        <img src={logo} className="cf-admin-logo" alt="Cashflow" />
                    </span>
                    <span className="cf-admin-brand-copy">
                        <span className="cf-admin-brand-title">Cashflow Control Room</span>
                        <span className="cf-admin-brand-subtitle">Operations console</span>
                    </span>
                </button>
                <div className="cf-admin-nav-wrap">
                    <Menu
                        mode="horizontal"
                        selectedKeys={[selectedKey]}
                        items={items}
                        className="cf-admin-menu"
                        onClick={({ key }) => {
                            navigate(key);
                        }}
                    />
                </div>
                <div className="cf-admin-actions">
                    <span className="cf-admin-user-pill">
                        <UserOutlined />
                        Platform Admin
                    </span>
                    <ConfirmationModal
                        title="Confirm Logout"
                        content="Are you sure you want to log out?"
                        okText="Logout"
                        cancelText="Cancel"
                        onConfirm={logout}
                        onCancel={() => { }}
                        position="topRight"
                        trigger={
                            <Button className="cf-admin-logout" type="text" icon={<LogoutOutlined />}>
                                Logout
                            </Button>
                        }
                    />
                </div>
            </Header>
            <Content className="cf-admin-content">
                <div className="cf-admin-content-inner">
                    <Outlet />
                </div>
            </Content>
            <Footer className="cf-admin-footer">
                Cashflow Admin Portal ©{new Date().getFullYear()}
            </Footer>
        </Layout>
    );
};

export default AdminLayout;
