import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Typography } from 'antd';
import { LockOutlined, SafetyCertificateOutlined, ThunderboltOutlined, UserOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useAuth } from '../context/auth';
import paths from '../router/paths';
import styles from '../css/login.module.css';
import LocalStorageService from '../service/local_storage';

const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { state } = useLocation();
    const [loading, setLoading] = useState(false);
    const nextTo = state?.from || paths.home;

    useEffect(() => {
        const token = LocalStorageService.getToken();
        if (token) {
            navigate(nextTo, { replace: true });
        }
        document.body.classList.add(styles.body);
        return () => {
            document.body.classList.remove(styles.body);
        };
    }, [navigate, nextTo]);

    const onFinish = async (values: { username: string; password: string }) => {
        setLoading(true);
        const success = await login(values.username, values.password);
        setLoading(false);
        if (success) {
            navigate(nextTo, { replace: true });
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.orbA} />
            <div className={styles.orbB} />
            <div className={styles.panel}>
                <section className={styles.promoSide}>
                    <span className={styles.brandPill}>
                        <img src={logo} className={styles.brandLogo} alt="Cashflow" />
                        Cashflow Admin
                    </span>
                    <Typography.Title level={2} className={styles.title}>
                        One place to run your business operations
                    </Typography.Title>
                    <Typography.Paragraph className={styles.description}>
                        Handle subscriptions, business access, and integrations with a secure control console.
                    </Typography.Paragraph>
                    <div className={styles.featureGrid}>
                        <div className={styles.featureCard}>
                            <span className={styles.featureIcon}>
                                <SafetyCertificateOutlined />
                            </span>
                            <span>Role-restricted admin access</span>
                        </div>
                        <div className={styles.featureCard}>
                            <span className={styles.featureIcon}>
                                <ThunderboltOutlined />
                            </span>
                            <span>Fast subscription management</span>
                        </div>
                    </div>
                </section>

                <section className={styles.formSide}>
                    <Typography.Text className={styles.kicker}>Secure Sign In</Typography.Text>
                    <Typography.Title level={3} className={styles.formTitle}>
                        Welcome back
                    </Typography.Title>
                    <Typography.Paragraph className={styles.formCopy}>
                        Sign in with your platform admin credentials.
                    </Typography.Paragraph>

                    <Form layout="vertical" onFinish={onFinish}>
                        <Form.Item
                            label="Username"
                            name="username"
                            rules={[{ required: true, message: 'Please enter your username.' }]}
                        >
                            <Input placeholder="admin.username" prefix={<UserOutlined />} size="large" />
                        </Form.Item>
                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true, message: 'Please enter your password.' }]}
                        >
                            <Input.Password placeholder="••••••••" prefix={<LockOutlined />} size="large" />
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button type="primary" htmlType="submit" loading={loading} block size="large">
                                Sign in to Admin Portal
                            </Button>
                        </Form.Item>
                    </Form>
                </section>
            </div>
        </div>
    );
};

export default Login;
