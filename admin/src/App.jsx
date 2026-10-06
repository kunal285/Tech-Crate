import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Users from './pages/users/Users';
import UserDetails from './pages/users/UserDetails';
import Sellers from './pages/sellers/Sellers';
import SellerDetails from './pages/sellers/SellerDetails';
import SellerApprovals from './pages/sellers/SellerApprovals';
import ProductsPage from './pages/ProductsPage';
import AddProduct from './pages/products/AddProduct';
import EditProduct from './pages/products/EditProduct';
import ProductApproval from './pages/products/ProductApproval';
import Categories from './pages/categories/Categories';
import Projects from './pages/projects/Projects';
import AddProject from './pages/projects/AddProject';
import ProjectDetails from './pages/projects/ProjectDetails';
import ProjectKits from './pages/project-kits/ProjectKits';
import AddProjectKit from './pages/project-kits/AddProjectKit';
import OrdersPage from './pages/OrdersPage';
import OrderDetails from './pages/orders/OrderDetails';
import Payments from './pages/payments/Payments';
import Reviews from './pages/reviews/Reviews';
import Coupons from './pages/coupons/Coupons';
import Banners from './pages/banners/Banners';
import Notifications from './pages/notifications/Notifications';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<Login />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />

          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<UserDetails />} />

          <Route path="/sellers" element={<Sellers />} />
          <Route path="/sellers/:id" element={<SellerDetails />} />
          <Route path="/sellers/approvals" element={<SellerApprovals />} />

          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/create" element={<AddProduct />} />
          <Route path="/products/:id/edit" element={<EditProduct />} />
          <Route path="/products/approvals" element={<ProductApproval />} />

          <Route path="/categories" element={<Categories />} />

          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/create" element={<AddProject />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />

          <Route path="/project-kits" element={<ProjectKits />} />
          <Route path="/project-kits/create" element={<AddProjectKit />} />

          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetails />} />

          <Route path="/payments" element={<Payments />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/banners" element={<Banners />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
