import axios from 'axios';
import type {
  AdminProject,
  AdminService,
  ContactMessage,
  QuoteRequest,
  SiteContent,
} from '../types/data.ts';

const settingsStorageKey = 'construct-admin-settings';

const getApiBaseUrl = () => {
  const envBaseUrl = process.env.REACT_APP_API_BASE_URL;
  if (envBaseUrl) {
    console.log('Using environment variable API URL:', envBaseUrl);
    return envBaseUrl;
  }

  try {
    const stored = window.localStorage.getItem(settingsStorageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.apiBaseUrl) {
        console.log('Using localStorage API URL:', parsed.apiBaseUrl);
        return parsed.apiBaseUrl;
      }
    }
  } catch (error) {
    console.error('Unable to read admin settings for API base URL.', error);
  }

  const fallbackUrl = 'https://construction-website-backend-m3aw.onrender.com/api';
  console.log('Using fallback API URL:', fallbackUrl);
  return fallbackUrl;
};

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const fullUrl = getApiBaseUrl() + (config.url || '');
  console.log('Making API request:', fullUrl);
  return {
    ...config,
    baseURL: getApiBaseUrl(),
  };
});

api.interceptors.response.use(
  (response) => {
    console.log('API response success:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.log('API response error:', error.config?.url, error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export const projectApi = {
  getAll: async (): Promise<AdminProject[]> => {
    const response = await api.get('/projects');
    return Array.isArray(response.data) ? response.data : [];
  },
  create: async (project: Omit<AdminProject, 'id'>): Promise<AdminProject> => {
    const response = await api.post('/projects', project);
    return response.data;
  },
  update: async (id: string, project: Omit<AdminProject, 'id'>): Promise<AdminProject> => {
    const response = await api.put(`/projects/${id}`, project);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

export const serviceApi = {
  getAll: async (): Promise<AdminService[]> => {
    const response = await api.get('/services');
    return Array.isArray(response.data) ? response.data : [];
  },
  create: async (service: Omit<AdminService, 'id'>): Promise<AdminService> => {
    const response = await api.post('/services', service);
    return response.data;
  },
  update: async (id: string, service: Omit<AdminService, 'id'>): Promise<AdminService> => {
    const response = await api.put(`/services/${id}`, service);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/services/${id}`);
  },
};

export const contactApi = {
  getAll: async (): Promise<ContactMessage[]> => {
    const response = await api.get('/contact');
    return Array.isArray(response.data) ? response.data : [];
  },
};

export const quoteApi = {
  getAll: async (): Promise<QuoteRequest[]> => {
    const response = await api.get('/quotes');
    return Array.isArray(response.data) ? response.data : [];
  },
};

export const siteContentApi = {
  get: async (): Promise<SiteContent> => {
    const response = await api.get('/site-content');
    return response.data;
  },
  update: async (content: SiteContent): Promise<SiteContent> => {
    const response = await api.put('/site-content', content);
    return response.data;
  },
};

export default api;
