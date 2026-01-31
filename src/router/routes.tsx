import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../page/home';
import Login from '../page/login';
import BusinessPage from '../page/business';
import ProtectedRoute from './protected_route';
import paths from './paths';
import AdminLayout from '../layout/admin_layout';
import ToolPage from '../page/tool';

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path={paths.login} element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path={paths.home} element={<AdminLayout />}>
          <Route index element={<Home />} />
          <Route path={paths.bizs} element={<BusinessPage />} />
          <Route path={paths.tools} element={<ToolPage />} />
        </Route>
      </Route>
    </Routes>
  </Router>
);

export default AppRoutes;
