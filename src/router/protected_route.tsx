import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth';
import paths from './paths';

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated } = useAuth(); // Correct usage of useAuth
    if (!isAuthenticated) {
        const location = useLocation()
        return <Navigate to={paths.login} state={{ ...location.state, from: location.pathname }} />;
    }
    return <Outlet />;
};

export default ProtectedRoute;
