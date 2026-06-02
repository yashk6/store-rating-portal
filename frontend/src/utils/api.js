const BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong.');
  }
  return data;
};

export const api = {
  // Auth API
  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  register: async (name, email, address, password) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, address, password }),
    });
    return handleResponse(res);
  },

  changePassword: async (currentPassword, newPassword) => {
    const res = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse(res);
  },

  // Admin API
  getDashboardStats: async () => {
    const res = await fetch(`${BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  addUser: async (userData) => {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  addStore: async (storeData) => {
    const res = await fetch(`${BASE_URL}/admin/stores`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(storeData),
    });
    return handleResponse(res);
  },

  getUsers: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${BASE_URL}/admin/users?${query}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getUserDetails: async (id) => {
    const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getAdminStores: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${BASE_URL}/admin/stores?${query}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Normal User API
  getStoresList: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${BASE_URL}/stores?${query}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  submitRating: async (storeId, rating) => {
    const res = await fetch(`${BASE_URL}/stores/${storeId}/rate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ rating }),
    });
    return handleResponse(res);
  },

  // Store Owner API
  getOwnerDashboard: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${BASE_URL}/owner/dashboard?${query}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
