import { HomeOutlined, LogoutOutlined, ShopOutlined, SyncOutlined, ToolOutlined } from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd';
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import ConfirmationModal from '../components/confirmation';
import { useAuth } from '../context/auth';
import paths from '../router/paths';

const { Header, Content, Footer } = Layout;
const menus: Array<{
    name: string,
    path: string,
    icon: any,
}> = [
        {
            name: "Home",
            path: paths.home,
            icon: <HomeOutlined size={45} />
        },
        {
            name: "Business",
            path: paths.bizs,
            icon: <ShopOutlined size={45} />
        },
        {
            name: "Integration",
            path: paths.integration,
            icon: <SyncOutlined size={45} />
        },
        {
            name: "Tool",
            path: paths.tools,
            icon: <ToolOutlined size={45} />
        },
    ]

const items = menus.map((m, _) => ({
    key: m.path,
    label: m.name,
    icon: m.icon

}));

const App: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const {
        token: {  borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout style={{ height: '100vh' }} >
            <Header style={styles.header} >
                <div style={styles.imgDiv} >
                    <img src={logo} style={styles.logo} />
                </div>
                <Menu
                    mode="horizontal"
                    defaultSelectedKeys={['1']}
                    items={items}
                    style={{ flex: 1, minWidth: 0 }}
                    onClick={({ key }) => {
                        navigate(key);
                    }}
                />
                <ConfirmationModal
                    title="Confirm Logout"
                    content="Are you sure you want to log out?"
                    okText="Logout"
                    cancelText="Cancel"
                    onConfirm={logout}
                    onCancel={() => { }}
                    position='topRight'
                    trigger={
                        <Button type="link" icon={<LogoutOutlined />}>
                            Logout
                        </Button>
                    } // Custom trigger button with icon
                />
            </Header>
            <Content style={{ padding: '0 20px' ,overflow:'scroll'}}>
                <div style={{
                    background: "#fffff",
                    minHeight: 280,
                    overflow:"scroll",
                    padding: 40,
                    marginTop: 20,
                    borderRadius: borderRadiusLG,
                }}
                >
                    <Outlet />
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
                Cashflow ©{new Date().getFullYear()} Created by Piti
            </Footer>
        </Layout>
    );
};

const styles: Record<string, React.CSSProperties> = {
    header: {
        display: 'flex',
        alignItems: 'center',
        background: "white",
        justifyContent: "space-between"
    },
    imgDiv: {
        width: 280, placeContent: 'center"', alignItems: 'center', display: 'flex'
    },
    logo: {
        width: 70, height: 70, padding: 10
    }
}

export default App;