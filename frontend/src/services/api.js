import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vb_token');
      localStorage.removeItem('vb_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  firebaseSync: (data) => api.post('/auth/firebase-sync', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

// Vendors
export const vendorsAPI = {
  getAll: (params) => api.get('/vendors', { params }),
  getById: (id) => api.get(`/vendors/${id}`),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  delete: (id) => api.delete(`/vendors/${id}`),
  updateStatus: (id, status) => api.patch(`/vendors/${id}/status`, { status }),
};

// RFQs
export const rfqsAPI = {
  getAll: (params) => api.get('/rfqs', { params }),
  getById: (id) => api.get(`/rfqs/${id}`),
  create: (data) => api.post('/rfqs', data),
  update: (id, data) => api.put(`/rfqs/${id}`, data),
  delete: (id) => api.delete(`/rfqs/${id}`),
  send: (id) => api.post(`/rfqs/${id}/send`),
  getPDF: (id) => api.get(`/rfqs/${id}/pdf`, { responseType: 'blob' }),
  sendEmail: (id, email) => api.post(`/rfqs/${id}/email`, { email }),
};

// Quotations
export const quotationsAPI = {
  getAll: (params) => api.get('/quotations', { params }),
  getById: (id) => api.get(`/quotations/${id}`),
  getByRFQ: (rfqId) => api.get(`/quotations/rfq/${rfqId}`),
  create: (data) => api.post('/quotations', data),
  update: (id, data) => api.put(`/quotations/${id}`, data),
  compare: (rfqId) => api.get(`/quotations/compare/${rfqId}`),
  select: (id) => api.post(`/quotations/${id}/select`),
};

// Approvals
export const approvalsAPI = {
  getAll: (params) => api.get('/approvals', { params }),
  getById: (id) => api.get(`/approvals/${id}`),
  approve: (id, remarks) => api.post(`/approvals/${id}/approve`, { remarks }),
  reject: (id, remarks) => api.post(`/approvals/${id}/reject`, { remarks }),
};

// Purchase Orders
export const purchaseOrdersAPI = {
  getAll: (params) => api.get('/purchase-orders', { params }),
  getById: (id) => api.get(`/purchase-orders/${id}`),
  create: (data) => api.post('/purchase-orders', data),
  update: (id, data) => api.put(`/purchase-orders/${id}`, data),
  getPDF: (id) => api.get(`/purchase-orders/${id}/pdf`, { responseType: 'blob' }),
  sendEmail: (id, email) => api.post(`/purchase-orders/${id}/email`, { email }),
};

// Invoices
export const invoicesAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  markPaid: (id) => api.patch(`/invoices/${id}/paid`),
  getPDF: (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
  sendEmail: (id, email) => api.post(`/invoices/${id}/email`, { email }),
};

// Activity
export const activityAPI = {
  getAll: (params) => api.get('/activity', { params }),
};

// Reports
export const reportsAPI = {
  getSummary: (params) => api.get('/reports/summary', { params }),
  getSpendByCategory: (params) => api.get('/reports/spend-by-category', { params }),
  getMonthlyTrend: (params) => api.get('/reports/monthly-trend', { params }),
  getTopVendors: (params) => api.get('/reports/top-vendors', { params }),
  export: (params) => api.get('/reports/export', { params, responseType: 'blob' }),
};

// Dashboard
export const dashboardAPI = {
  getKPIs: () => api.get('/reports/dashboard-kpis'),
  getRecentPOs: () => api.get('/purchase-orders'),
  getSpendingTrends: () => api.get('/reports/monthly-trend'),
};

// AI
export const aiAPI = {
  getDashboardInsight: (data) => api.post('/ai/dashboard-insight', data),
  compareQuotations: (data) => api.post('/ai/compare-quotations', data),
  generateRFQDescription: (data) => api.post('/ai/rfq-description', data),
  getReportInsight: (data) => api.post('/ai/report-insight', data),
  chat: (data) => api.post('/ai/chat', data),
};

export default api;

