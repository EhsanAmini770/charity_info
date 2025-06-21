import apiClient from './apiClient';

// Define types for Partners API
export interface PartnerItem {
  _id: string;
  name: string;
  description?: string;
  website?: string;
  logo?: string;
  type: string;
  featured: boolean;
  active: boolean;
}

export interface PartnersResponse {
  partners: PartnerItem[];
}

/**
 * Partners API service
 */
export const partnersApi = {
  /**
   * Get all partners
   */
  getAll: async (params?: { active?: boolean, type?: string, featured?: boolean }): Promise<PartnersResponse> => {
    return apiClient.get<PartnersResponse>('/api/partners', { params });
  },

  /**
   * Get a partner by ID
   */
  getById: async (id: string): Promise<{ partner: PartnerItem }> => {
    return apiClient.get<{ partner: PartnerItem }>(`/api/partners/${id}`);
  },

  /**
   * Create a new partner (admin only)
   */
  create: async (partnerData: FormData): Promise<{ partner: PartnerItem, message: string }> => {
    return apiClient.post<{ partner: PartnerItem, message: string }>('/api/partners', partnerData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Update a partner (admin only)
   */
  update: async (id: string, partnerData: FormData): Promise<{ partner: PartnerItem, message: string }> => {
    return apiClient.put<{ partner: PartnerItem, message: string }>(`/api/partners/${id}`, partnerData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Delete a partner (admin only)
   */
  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/api/partners/${id}`);
  }
};
