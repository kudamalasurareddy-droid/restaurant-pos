import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from './context/AuthContext';

// Components
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/orders/OrdersPage';
import MenuPage from './pages/menu/MenuPage';
import TablesPage from './pages/tables/TablesPage';
import InventoryPage from './pages/inventory/InventoryPage';
import UsersPage from './pages/users/UsersPage';
import ReportsPage from './pages/reports/ReportsPage';
import KOTPage from './pages/kot/KOTPage';
import ProfilePage from './pages/profile/ProfilePage';
import SettingsPage from './pages/settings/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import PaymentsPage from './pages/payments/PaymentsPage';

// Specialized interfaces
import POSInterface from './pages/pos/POSInterface';
import KitchenInterface from './pages/kitchen/KitchenInterface';
import CustomerApp from './pages/customer/CustomerApp';

function App() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <LoadingSpinner size={60} message="Loading Restaurant POS System..." />
      </Box>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to={user?.role === 'customer' ? '/customer' : '/dashboard'} replace /> : <LoginPage />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? <Navigate to={user?.role === 'customer' ? '/customer' : '/dashboard'} replace /> : <RegisterPage />
          } 
        />
        
        {/* Customer App - now inside Layout for sidebar; keep public route removed */}

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  {/* Default redirect based on role */}
                  <Route path="/" element={<Navigate to={user?.role === 'customer' ? '/customer' : '/dashboard'} replace />} />
                  {/* Dashboard */}
                  <Route path="/dashboard" element={<DashboardPage />} />
                  
                  {/* Orders Management */}
                  <Route 
                    path="/orders/*" 
                    element={
                      <ProtectedRoute requiredPermission={{ module: 'orders', action: 'read' }}>
                        <OrdersPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Menu Management */}
                  <Route 
                    path="/menu/*" 
                    element={
                      <ProtectedRoute requiredPermission={{ module: 'menu', action: 'read' }}>
                        <MenuPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Table Management */}
                  <Route 
                    path="/tables/*" 
                    element={
                      <ProtectedRoute requiredPermission={{ module: 'tables', action: 'read' }}>
                        <TablesPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Inventory Management */}
                  <Route 
                    path="/inventory/*" 
                    element={
                      <ProtectedRoute requiredPermission={{ module: 'inventory', action: 'read' }}>
                        <InventoryPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* User Management */}
                  <Route 
                    path="/users/*" 
                    element={
                      <ProtectedRoute requiredPermission={{ module: 'users', action: 'read' }}>
                        <UsersPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Reports */}
                  <Route 
                    path="/reports/*" 
                    element={
                      <ProtectedRoute requiredPermission={{ module: 'reports', action: 'read' }}>
                        <ReportsPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* KOT (Kitchen Order Ticket) - Kitchen Staff */}
                  <Route 
                    path="/kot/*" 
                    element={
                      <ProtectedRoute requiredPermission={{ module: 'kot', action: 'read' }}>
                        <KOTPage />
                      </ProtectedRoute>
                    } 
                  />
                  {/* Customer App (Order Online) */}
                  <Route 
                    path="/customer/*" 
                    element={
                      <ProtectedRoute requiredRoles={['customer', 'manager', 'admin']}>
                        <CustomerApp />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Payments Management */}
                  <Route 
                    path="/payments/*" 
                    element={
                      <ProtectedRoute requiredPermission={{ module: 'payments', action: 'read' }}>
                        <PaymentsPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Profile */}
                  <Route path="/profile" element={<ProfilePage />} />
                  
                  {/* Settings */}
                  <Route 
                    path="/settings/*" 
                    element={
                      <ProtectedRoute requiredRoles={['admin', 'manager']}>
                        <SettingsPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Specialized Interfaces */}
                  <Route 
                    path="/pos/*" 
                    element={
                      <ProtectedRoute requiredRoles={['cashier', 'waiter', 'manager', 'admin']}>
                        <POSInterface />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/kitchen/*" 
                    element={
                      <ProtectedRoute requiredRoles={['kitchen_staff', 'manager', 'admin']}>
                        <KitchenInterface />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* fallback inside layout if needed */}
                  
                  {/* 404 Page */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;