import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    if (error.response?.status === 403) {
      toast.error('Access denied. You do not have permission to perform this action.');
      return Promise.reject(error);
    }
    
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
      return Promise.reject(error);
    }
    
    // Don't show toast for client errors in forms (let components handle them)
    if (error.response?.status < 500 && error.response?.status >= 400) {
      console.warn('API Error:', message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  verifyToken: () => api.get('/auth/verify'),
  getRoles: () => api.get('/auth/roles'),
};

// Users API
export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getWaiters: () => api.get('/users/roles/waiters'),
  getUserStats: (params) => api.get('/users/analytics/stats', { params }),
  getUserActivity: (params) => api.get('/users/analytics/activity', { params }),
  resetPassword: (id, passwordData) => api.post(`/users/${id}/reset-password`, passwordData),
  toggleUserStatus: (id) => api.patch(`/users/${id}/toggle-status`),
};

// Menu API
export const menuAPI = {
  // Categories
  getCategories: () => api.get('/menu/categories'),
  createCategory: (categoryData) => api.post('/menu/categories', categoryData),
  updateCategory: (id, categoryData) => api.put(`/menu/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/menu/categories/${id}`),
  
  // Menu Items
  getMenuItems: (params) => api.get('/menu/items', { params }),
  getMenuItem: (id) => api.get(`/menu/items/${id}`),
  createMenuItem: (itemData) => api.post('/menu/items', itemData),
  updateMenuItem: (id, itemData) => api.put(`/menu/items/${id}`, itemData),
  deleteMenuItem: (id) => api.delete(`/menu/items/${id}`),
  updateAvailability: (id, availabilityData) => api.patch(`/menu/items/${id}/availability`, availabilityData),
  getPublicMenu: () => api.get('/menu/public'),
};

// Tables API
export const tablesAPI = {
  getTables: (params) => api.get('/tables', { params }),
  getTable: (id) => api.get(`/tables/${id}`),
  createTable: (tableData) => api.post('/tables', tableData),
  updateTable: (id, tableData) => api.put(`/tables/${id}`, tableData),
  deleteTable: (id) => api.delete(`/tables/${id}`),
  updateTableStatus: (id, statusData) => api.patch(`/tables/${id}/status`, statusData),
  assignWaiter: (id, waiterData) => api.patch(`/tables/${id}/assign-waiter`, waiterData),
  addReservation: (id, reservationData) => api.post(`/tables/${id}/reservations`, reservationData),
  updateReservation: (tableId, reservationId, reservationData) => 
    api.patch(`/tables/${tableId}/reservations/${reservationId}`, reservationData),
  getTableLayout: () => api.get('/tables/layout/floor-plan'),
  getTableStats: () => api.get('/tables/analytics/stats'),
};

// Orders API
export const ordersAPI = {
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (orderData) => api.post('/orders', orderData),
  updateOrderStatus: (id, statusData) => api.patch(`/orders/${id}/status`, statusData),
  updateItemStatus: (orderId, itemIndex, statusData) => 
    api.patch(`/orders/${orderId}/items/${itemIndex}/status`, statusData),
  addPayment: (id, paymentData) => api.post(`/orders/${id}/payments`, paymentData),
  createStripeCheckout: (id) => api.post(`/orders/${id}/payments/stripe/checkout`),
  cancelOrder: (id, reason) => api.delete(`/orders/${id}`, { data: { reason } }),
  getOrderStats: (params) => api.get('/orders/analytics/stats', { params }),
  getMyOrders: () => api.get('/orders', { params: { page: 1, limit: 50 } }),
};

// KOT API
export const kotAPI = {
  getKOTQueue: () => api.get('/kot/queue'),
  printKOT: (orderId, data) => api.post(`/kot/${orderId}/print`, data),
  updateItemStatus: (orderId, itemIndex, statusData) => 
    api.patch(`/kot/${orderId}/items/${itemIndex}/status`, statusData),
  completeOrder: (orderId) => api.patch(`/kot/${orderId}/complete`),
  getKOTHistory: (params) => api.get('/kot/history', { params }),
  getKOTStats: (params) => api.get('/kot/analytics/stats', { params }),
};

// Inventory API
export const inventoryAPI = {
  // Items
  getInventoryItems: (params) => api.get('/inventory/items', { params }),
  createInventoryItem: (itemData) => api.post('/inventory/items', itemData),
  updateInventoryItem: (id, itemData) => api.put(`/inventory/items/${id}`, itemData),
  deleteInventoryItem: (id) => api.delete(`/inventory/items/${id}`),
  updateStock: (id, stockData) => api.patch(`/inventory/items/${id}/stock`, stockData),
  getLowStockItems: () => api.get('/inventory/low-stock'),
  
  // Stock Movements
  getStockMovements: (params) => api.get('/inventory/movements', { params }),
  
  // Purchase Orders
  getPurchaseOrders: (params) => api.get('/inventory/purchase-orders', { params }),
  createPurchaseOrder: (orderData) => api.post('/inventory/purchase-orders', orderData),
  
  // Statistics
  getInventoryStats: () => api.get('/inventory/analytics/stats'),
};

// Reports API
export const reportsAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getSalesReport: (params) => api.get('/reports/sales', { params }),
  getMenuPerformance: (params) => api.get('/reports/menu-performance', { params }),
  getStaffPerformance: (params) => api.get('/reports/staff-performance', { params }),
  getTableUtilization: (params) => api.get('/reports/table-utilization', { params }),
  getCustomerAnalysis: (params) => api.get('/reports/customer-analysis', { params }),
  exportReport: (reportData) => api.post('/reports/export', reportData),
};

// File upload helper
export const uploadFile = async (file, path = '') => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post(`/upload${path}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Settings API
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateSettings: (settingsType, settings) => api.put(`/settings/${settingsType}`, settings),
  createBackup: () => api.post('/settings/backup'),
  testEmail: (emailData) => api.post('/settings/test-email', emailData),
  getSystemStatus: () => api.get('/settings/system-status'),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;