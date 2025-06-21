
import axios from 'axios';
import API_CONFIG from '../config/api';
import { logError } from '../utils/logUtils';

// Create axios instance with config
const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  withCredentials: API_CONFIG.withCredentials,
});

// Track if we're currently fetching a CSRF token
let isFetchingCsrf = false;
// Store the CSRF token
let csrfToken: string | null = null;
// Create a promise to track pending CSRF requests
let csrfPromise: Promise<string> | null = null;

// Function to get CSRF token
const getCsrfToken = async (): Promise<string> => {
  // If we already have a token, return it
  if (csrfToken) {
    return csrfToken;
  }

  // If we're already fetching a token, wait for that request to complete
  if (isFetchingCsrf && csrfPromise) {
    return csrfPromise;
  }

  // Start a new token fetch
  isFetchingCsrf = true;
  csrfPromise = axios.get(`${API_CONFIG.baseURL}/api/csrf-token`, { withCredentials: true })
    .then(response => {
      csrfToken = response.data.csrfToken;
      return csrfToken;
    })
    .finally(() => {
      isFetchingCsrf = false;
    });

  return csrfPromise;
};

// Add request interceptor for authentication
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token for non-GET admin routes
    if (
      config.url &&
      config.url.includes('/admin/') &&
      config.method &&
      ['post', 'put', 'delete', 'patch'].includes(config.method.toLowerCase())
    ) {
      try {
        const token = await getCsrfToken();
        config.headers['CSRF-Token'] = token;
      } catch (error) {
        logError('Failed to fetch CSRF token', error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    logError('API Error', error);

    // If we get a 403 with invalid CSRF token, invalidate the token and retry the request
    if (
      error.response &&
      error.response.status === 403 &&
      error.response.data &&
      error.response.data.message &&
      error.response.data.message.includes('csrf')
    ) {
      csrfToken = null; // Invalidate token

      // If we have a config, we can retry the request
      if (error.config) {
        // Return the retry promise
        return getCsrfToken().then(token => {
          error.config.headers['CSRF-Token'] = token;
          return axios(error.config);
        });
      }
    }

    return Promise.reject(error);
  }
);

// Define types for API responses
export interface NewsItem {
  _id: string;
  title: string;
  body: string;
  slug: string;
  publishDate: string;
  expiryDate?: string;
  published: boolean;
  author?: string | { _id: string; username: string };
  images?: string[];
  attachments?: any[];
}

export interface NewsResponse {
  news: NewsItem[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

export interface AlbumItem {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  imageCount?: number;
}

export interface AlbumResponse {
  albums: AlbumItem[];
}

export interface ImageItem {
  _id: string;
  filename: string;
  caption?: string;
  albumId: string;
}

export interface UserItem {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface UsersResponse {
  users: UserItem[];
}

export interface AnalyticsVisitResponse {
  dates: string[];
  counts: number[];
}

export interface OnlineCountResponse {
  count: number;
}

export interface FaqItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FaqResponse {
  faqs: FaqItem[];
}

// Settings interfaces removed

export interface LocationItem {
  _id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  phone?: string;
  email?: string;
  isMainOffice: boolean;
  displayOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocationsResponse {
  locations: LocationItem[];
}

export interface TeamMemberItem {
  _id: string;
  name: string;
  position: string;
  bio: string;
  photo?: string;
  email?: string;
  phone?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  displayOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamResponse {
  teamMembers: TeamMemberItem[];
}


// News API services
export const newsApi = {
  getAll: async (page = 1, limit = 10): Promise<NewsResponse> => {
    const response = await api.get(`/api/news?page=${page}&limit=${limit}&includeAttachments=true`);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<NewsItem> => {
    const response = await api.get(`/api/news/${slug}?includeAttachments=true`);
    return response.data.news;
  },

  getById: async (id: string): Promise<NewsItem> => {
    const response = await api.get(`/api/admin/news/${id}`);
    return response.data.news;
  },

  create: async (newsData: any): Promise<NewsItem> => {
    const response = await api.post('/api/admin/news', newsData);
    return response.data.news;
  },

  update: async (id: string, newsData: any): Promise<NewsItem> => {
    const response = await api.put(`/api/admin/news/${id}`, newsData);
    return response.data.news;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/news/${id}`);
  },

  getAttachments: async (id: string, isAdmin: boolean = true): Promise<any> => {
    const endpoint = isAdmin ? `/api/admin/news/${id}/attachments` : `/api/news/${id}/attachments`;
    const response = await api.get(endpoint);
    return response.data;
  },

  uploadAttachment: async (id: string, formData: FormData): Promise<any> => {
    // Ensure CSRF token is included
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken && !formData.has('_csrf')) {
      formData.append('_csrf', csrfToken);
      console.log('Added CSRF token from meta tag');
    }

    try {
      console.log(`Uploading attachment to news ID: ${id}`);
      const response = await api.post(`/api/admin/news/${id}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in uploadAttachment API call:', error);
      throw error;
    }
  },

  deleteAttachment: async (newsId: string, attachmentId: string): Promise<void> => {
    try {
      console.log(`Deleting attachment: newsId=${newsId}, attachmentId=${attachmentId}`);
      await api.delete(`/api/admin/news/${newsId}/attachments/${attachmentId}`);
      console.log('Attachment deleted successfully');
    } catch (error) {
      console.error('Error in deleteAttachment API call:', error);
      throw error;
    }
  },

  getAttachmentContent: async (attachmentId: string): Promise<{ content: string, filename: string }> => {
    const response = await api.get(`/api/news/attachments/${attachmentId}/content`);
    return response.data;
  }
};

// Gallery API services
export const galleryApi = {
  getAllAlbums: async (): Promise<AlbumResponse> => {
    const response = await api.get('/api/gallery/albums');
    return response.data;
  },

  getAlbumBySlug: async (slug: string): Promise<{ album: AlbumItem, images: ImageItem[] }> => {
    try {
      const response = await api.get(`/api/gallery/albums/${slug}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching album by slug:', error);
      throw error;
    }
  },

  getAlbumById: async (id: string): Promise<{ album: AlbumItem, images: ImageItem[] }> => {
    try {
      // First try to get album by ID
      const response = await api.get(`/api/admin/gallery/albums/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching album by ID:', error);
      throw error;
    }
  },

  createAlbum: async (albumData: Partial<AlbumItem>): Promise<AlbumItem> => {
    const response = await api.post('/api/admin/gallery/albums', albumData);
    return response.data.album;
  },

  updateAlbum: async (id: string, albumData: Partial<AlbumItem>): Promise<AlbumItem> => {
    const response = await api.put(`/api/admin/gallery/albums/${id}`, albumData);
    return response.data.album;
  },

  deleteAlbum: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/gallery/albums/${id}`);
  },

  uploadImage: async (albumId: string, formData: FormData): Promise<any> => {
    // Ensure CSRF token is included
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      formData.append('_csrf', csrfToken);
    }

    const response = await api.post(`/api/admin/gallery/albums/${albumId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteImage: async (imageId: string): Promise<void> => {
    await api.delete(`/api/admin/gallery/images/${imageId}`);
  }
};

// User API services
export const userApi = {
  getAll: async (): Promise<UsersResponse> => {
    const response = await api.get('/api/admin/users');
    return response.data;
  },

  getById: async (id: string): Promise<UserItem> => {
    const response = await api.get(`/api/admin/users/${id}`);
    return response.data.user;
  },

  create: async (userData: Partial<UserItem>): Promise<UserItem> => {
    const response = await api.post('/api/admin/users', userData);
    return response.data.user;
  },

  update: async (id: string, userData: Partial<UserItem>): Promise<UserItem> => {
    const response = await api.put(`/api/admin/users/${id}`, userData);
    return response.data.user;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/users/${id}`);
  }
};

// Analytics API services
export const analyticsApi = {
  getVisits: async (days = 7): Promise<AnalyticsVisitResponse> => {
    const response = await api.get(`/api/admin/analytics/visits?days=${days}`);
    return response.data;
  },

  getOnlineCount: async (): Promise<OnlineCountResponse> => {
    const response = await api.get('/api/admin/analytics/online');
    return response.data;
  }
};

// Search API service
export const searchApi = {
  search: async (query: string): Promise<{ news: NewsItem[], albums: AlbumItem[] }> => {
    const response = await api.get(`/api/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }
};

// FAQ API services
export const faqApi = {
  getAll: async (): Promise<FaqResponse> => {
    const response = await api.get('/api/faqs');
    return response.data;
  },

  getAllAdmin: async (): Promise<FaqResponse> => {
    const response = await api.get('/api/admin/faqs');
    return response.data;
  },

  getById: async (id: string): Promise<{ faq: FaqItem }> => {
    const response = await api.get(`/api/admin/faqs/${id}`);
    return response.data;
  },

  create: async (faqData: Partial<FaqItem>): Promise<{ faq: FaqItem, message: string }> => {
    const response = await api.post('/api/admin/faqs', faqData);
    return response.data;
  },

  update: async (id: string, faqData: Partial<FaqItem>): Promise<{ faq: FaqItem, message: string }> => {
    // Check if this is a partial update (only updating isActive)
    const isPartialUpdate = Object.keys(faqData).length === 1 && faqData.isActive !== undefined;

    // Prepare the data based on update type
    let sanitizedData: Partial<FaqItem>;

    if (isPartialUpdate) {
      // For partial updates, only include the isActive field
      sanitizedData = {
        isActive: faqData.isActive === undefined ? true : Boolean(faqData.isActive)
      };
    } else {
      // For full updates, include all fields with proper formatting
      sanitizedData = {
        question: faqData.question?.trim(),
        answer: faqData.answer?.trim(),
        category: faqData.category?.trim() || 'General',
        order: typeof faqData.order === 'number' ? faqData.order : 0,
        isActive: faqData.isActive === undefined ? true : Boolean(faqData.isActive)
      };
    }

    try {
      const response = await api.put(`/api/admin/faqs/${id}`, sanitizedData);
      return response.data;
    } catch (error) {
      logError('FAQ update error', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/api/admin/faqs/${id}`);
    return response.data;
  }
};

// Settings API services removed

// Partners API
export const partnersApi = {
  getAll: async (params?: { active?: boolean, type?: string, featured?: boolean }): Promise<{ partners: any[] }> => {
    const response = await api.get('/api/partners', { params });
    return response.data;
  },

  getById: async (id: string): Promise<{ partner: any }> => {
    const response = await api.get(`/api/partners/${id}`);
    return response.data;
  },

  create: async (partnerData: FormData): Promise<{ partner: any, message: string }> => {
    const response = await api.post('/api/partners', partnerData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  update: async (id: string, partnerData: FormData): Promise<{ partner: any, message: string }> => {
    const response = await api.put(`/api/partners/${id}`, partnerData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string, partner: any }> => {
    const response = await api.delete(`/api/partners/${id}`);
    return response.data;
  }
};

// Donation Campaigns API removed - this is an information-only website

// Subscribers API
export interface SubscriberItem {
  _id: string;
  email: string;
  name?: string;
  subscribed: boolean;
  subscribedAt: string;
  unsubscribedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscribersResponse {
  subscribers: SubscriberItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const subscribersApi = {
  getAll: async (page = 1, limit = 10, status = 'all', search = ''): Promise<SubscribersResponse> => {
    const params: any = { page, limit };

    if (status === 'active') {
      params.subscribed = true;
    } else if (status === 'inactive') {
      params.subscribed = false;
    }

    if (search) {
      params.search = search;
    }

    const response = await api.get('/api/subscribers', { params });
    return response.data;
  },

  deleteSubscriber: async (id: string, csrfToken?: string): Promise<{ message: string }> => {
    const headers: any = {};
    if (csrfToken) {
      headers['CSRF-Token'] = csrfToken;
    }

    const response = await api.delete(`/api/subscribers/${id}`, { headers });
    return response.data;
  }
};

// Contact API
export interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessage extends ContactSubmission {
  _id: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ContactResponse {
  contacts: ContactMessage[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const contactApi = {
  submit: async (contactData: ContactSubmission): Promise<{ message: string }> => {
    const response = await api.post('/api/contact', contactData);
    return response.data;
  },

  getAll: async (page = 1, limit = 10, status?: string): Promise<ContactResponse> => {
    const params = { page, limit, ...(status ? { status } : {}) };
    const response = await api.get('/api/contact', { params });
    return response.data;
  },

  getById: async (id: string): Promise<{ contact: ContactMessage }> => {
    const response = await api.get(`/api/contact/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: 'new' | 'read' | 'replied' | 'archived'): Promise<{ message: string, contact: ContactMessage }> => {
    // Using PUT instead of PATCH to avoid CORS issues
    const response = await api.put(`/api/contact/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/api/contact/${id}`);
    return response.data;
  }
};

// About API
export interface AboutContent {
  _id: string;
  mission: string;
  vision: string;
  foundedYear: string;
  volunteersCount: string;
  peopleHelpedCount: string;
  communitiesCount: string;
  createdAt?: string;
  updatedAt?: string;
}

export const aboutApi = {
  getContent: async (): Promise<{ aboutContent: AboutContent }> => {
    const response = await api.get('/api/about');
    return response.data;
  },

  updateContent: async (aboutData: Partial<AboutContent>): Promise<{ message: string, aboutContent: AboutContent }> => {
    const response = await api.post('/api/about', aboutData);
    return response.data;
  }
};

// Locations API
export const locationsApi = {
  getAll: async (params?: { active?: boolean, includeInactive?: boolean }): Promise<LocationsResponse> => {
    const response = await api.get('/api/locations', { params });
    return { locations: response.data };
  },

  getById: async (id: string): Promise<{ location: LocationItem }> => {
    const response = await api.get(`/api/locations/${id}`);
    return { location: response.data };
  },

  create: async (locationData: Partial<LocationItem>): Promise<{ location: LocationItem, message: string }> => {
    // Convert boolean values to strings for the API
    const formattedData = {
      ...locationData,
      isMainOffice: locationData.isMainOffice !== undefined ? String(locationData.isMainOffice) : undefined,
      active: locationData.active !== undefined ? String(locationData.active) : undefined
    };

    const response = await api.post('/api/locations', formattedData);
    return response.data;
  },

  update: async (id: string, locationData: Partial<LocationItem>): Promise<{ location: LocationItem, message: string }> => {
    // Convert boolean values to strings for the API
    const formattedData = {
      ...locationData,
      isMainOffice: locationData.isMainOffice !== undefined ? String(locationData.isMainOffice) : undefined,
      active: locationData.active !== undefined ? String(locationData.active) : undefined
    };

    const response = await api.put(`/api/locations/${id}`, formattedData);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/api/locations/${id}`);
    return response.data;
  }
};

// Team API
export const teamApi = {
  getAll: async (params?: { active?: boolean, includeInactive?: boolean }): Promise<{ teamMembers: TeamMemberItem[] }> => {
    const response = await api.get('/api/team', { params });
    return { teamMembers: response.data };
  },

  getById: async (id: string): Promise<{ teamMember: TeamMemberItem }> => {
    const response = await api.get(`/api/team/${id}`);
    return { teamMember: response.data };
  },

  create: async (formData: FormData): Promise<{ teamMember: TeamMemberItem, message: string }> => {
    const response = await api.post('/api/team', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  update: async (id: string, formData: FormData): Promise<{ teamMember: TeamMemberItem, message: string }> => {
    const response = await api.put(`/api/team/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/api/team/${id}`);
    return response.data;
  }
};

export default api;
