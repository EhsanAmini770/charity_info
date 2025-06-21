import apiClient from './apiClient';

// Define types for News API
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

/**
 * News API service
 */
export const newsApi = {
  /**
   * Get all news items with pagination
   */
  getAll: async (page = 1, limit = 10): Promise<NewsResponse> => {
    return apiClient.get<NewsResponse>(`/api/news?page=${page}&limit=${limit}&includeAttachments=true`);
  },

  /**
   * Get a news item by slug
   */
  getBySlug: async (slug: string): Promise<NewsItem> => {
    const response = await apiClient.get<{ news: NewsItem }>(`/api/news/${slug}?includeAttachments=true`);
    return response.news;
  },

  /**
   * Get a news item by ID (admin only)
   */
  getById: async (id: string): Promise<NewsItem> => {
    const response = await apiClient.get<{ news: NewsItem }>(`/api/admin/news/${id}`);
    return response.news;
  },

  /**
   * Create a new news item (admin only)
   */
  create: async (newsData: Partial<NewsItem>): Promise<NewsItem> => {
    const response = await apiClient.post<{ news: NewsItem }>('/api/admin/news', newsData);
    return response.news;
  },

  /**
   * Update a news item (admin only)
   */
  update: async (id: string, newsData: Partial<NewsItem>): Promise<NewsItem> => {
    const response = await apiClient.put<{ news: NewsItem }>(`/api/admin/news/${id}`, newsData);
    return response.news;
  },

  /**
   * Delete a news item (admin only)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/news/${id}`);
  },

  /**
   * Get attachments for a news item
   */
  getAttachments: async (id: string, isAdmin: boolean = true): Promise<any> => {
    const endpoint = isAdmin ? `/api/admin/news/${id}/attachments` : `/api/news/${id}/attachments`;
    return apiClient.get(endpoint);
  },

  /**
   * Upload an attachment to a news item (admin only)
   */
  uploadAttachment: async (id: string, formData: FormData): Promise<any> => {
    // Ensure CSRF token is included
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken && !formData.has('_csrf')) {
      formData.append('_csrf', csrfToken);
    }

    try {
      return apiClient.post(`/api/admin/news/${id}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Error in uploadAttachment API call:', error);
      throw error;
    }
  },

  /**
   * Delete an attachment from a news item (admin only)
   */
  deleteAttachment: async (newsId: string, attachmentId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/admin/news/${newsId}/attachments/${attachmentId}`);
    } catch (error) {
      console.error('Error in deleteAttachment API call:', error);
      throw error;
    }
  },

  /**
   * Get attachment content
   */
  getAttachmentContent: async (attachmentId: string): Promise<{ content: string, filename: string }> => {
    return apiClient.get(`/api/news/attachments/${attachmentId}/content`);
  }
};
