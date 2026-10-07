# Admin Control Panel Feature Specification

This document details the architecture, dashboard metrics, and catalog management capabilities of the **React + Vite Admin Panel**.

---

## 💻 Technical Overview

- **Location**: `admin/`
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Custom CSS Modules
- **State Management**: Zustand (`adminAuthStore.js`, `authStore.js`)
- **API Interceptor**: Axios client (`adminApi.js`) with automatic JWT bearer header injection.

---

## 📊 Dashboard Modules & Pages

1. **Dashboard Overview (`DashboardPage.jsx`)**: Total Revenue KPI, Order Count, Product Inventory summary, and quick action widgets.
2. **Products Catalog Manager (`ProductsPage.jsx`, `AddProduct.jsx`, `EditProduct.jsx`)**: Product CRUD operations, 4-image URL previewer, and technical features editor.
3. **Poster & Banner Manager (`banners/`, `PosterManager.jsx`)**: Active promotional banner manager with drag-and-drop sort order.
4. **Order Fulfillment Tracker (`OrdersPage.jsx`, `OrderDetails.jsx`)**: Filter orders by status (`Pending`, `Processing`, `Shipped`), update tracking details, and view payment status.
5. **User & Seller Management (`UsersPage.jsx`, `SellersPage.jsx`)**: View registered accounts, modify user roles (`customer` -> `seller` / `admin`), approve seller verification requests.
