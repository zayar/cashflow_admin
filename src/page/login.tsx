import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card } from 'antd';
import { useAuth } from '../context/auth'; // Correct usage of the custom hook
import { useLocation, useNavigate } from 'react-router-dom';
import paths from '../router/paths';
import styles from '../css/login.module.css'
import LocalStorageService from '../service/local_storage';

const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { state } = useLocation();
    const [loading, setLoading] = useState(false);
    const nextTo = state?.from || paths.home;

    useEffect(() => {
        const token = LocalStorageService.getToken()
        if (token) {
            navigate(nextTo, { replace: true });
        }
        document.body.classList.add(styles.body);
        return () => {
            document.body.classList.remove(styles.body);
        };
    }, [])
    const onFinish = async (values: { username: string; password: string }) => {
        setLoading(true);
        const success = await login(values.username, values.password);
        setLoading(false);
        if (success) {
            navigate(nextTo, { replace: true });
        }
    };
    return (
            <Card title="Admin Console" style={{ width: 300 ,textAlign:'center'}}>
                <Form onFinish={onFinish}>
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Please enter your username!' }]}
                    >
                        <Input placeholder="Username" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please enter your password!' }]}
                    >
                        <Input.Password placeholder="Password" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Login
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
    );
};

export default Login;
