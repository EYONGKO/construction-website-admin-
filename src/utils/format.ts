import type { AdminProject, AdminService, ContactMessage, QuoteRequest } from '../types/data.ts';

const settingsStorageKey = 'construct-admin-settings';
const fallbackApiBaseUrl = 'https://construction-website-backend-m3aw.onrender.com/api';
const fallbackWebsiteUrl = 'https://construction-frontend.onrender.com';

const getWebsiteBaseUrl = () => {
  if (typeof window === 'undefined') {
    return fallbackWebsiteUrl;
  }

  try {
    const stored = window.localStorage.getItem(settingsStorageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.websiteUrl) {
        return parsed.websiteUrl;
      }

      if (parsed?.apiBaseUrl) {
        return String(parsed.apiBaseUrl).replace(/\/api\/?$/, '');
      }
    }
  } catch {
    return fallbackWebsiteUrl;
  }

  return fallbackApiBaseUrl.replace(/\/api\/?$/, '');
};

export const resolveImageUrl = (value?: string | null) => {
  if (!value) {
    return '';
  }

  if (/^(data:|blob:|https?:\/\/)/i.test(value)) {
    return value;
  }

  const websiteBaseUrl = getWebsiteBaseUrl();

  try {
    return new URL(value, websiteBaseUrl.endsWith('/') ? websiteBaseUrl : `${websiteBaseUrl}/`).toString();
  } catch {
    return value;
  }
};

export const formatDate = (value?: string | null) => {
  if (!value) {
    return 'Not set';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatDateTime = (value?: string | null) => {
  if (!value) {
    return 'Recently';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export const shortenText = (value: string, maxLength = 120) => {
  if (!value) {
    return '';
  }

  return value.length > maxLength ? `${value.slice(0, maxLength).trim()}...` : value;
};

export const getProjectImage = (project: AdminProject) => {
  return resolveImageUrl(project.images?.find(Boolean)) || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80';
};

export const getServiceIconLabel = (service: AdminService) => {
  return service.icon || inferServiceIcon(service.title);
};

export const getServiceImage = (service: AdminService) => {
  return resolveImageUrl(service.image);
};

export const inferServiceIcon = (title = '') => {
  if (/solar/i.test(title)) return 'solar';
  if (/electrical|cabling|wiring|lighting/i.test(title)) return 'power';
  if (/paint/i.test(title)) return 'paint';
  if (/plumb/i.test(title)) return 'pipe';
  return 'build';
};

export const getMessagePreview = (message: ContactMessage | QuoteRequest) => {
  const body = 'message' in message ? message.message : message.description;
  return shortenText(body, 100);
};

export const getProjectTypeLabel = (value = '') => {
  if (!value) {
    return 'General enquiry';
  }

  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};
