import apiClient from './apiClient';

// Define types for FAQ API
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

/**
 * FAQ API service
 */
export const faqApi = {
  /**
   * Get all FAQs (public)
   */
  getAll: async (): Promise<FaqResponse> => {
    return apiClient.get<FaqResponse>('/api/faqs');
  },

  /**
   * Get all FAQs (admin)
   */
  getAllAdmin: async (): Promise<FaqResponse> => {
    return apiClient.get<FaqResponse>('/api/admin/faqs');
  },

  /**
   * Get a FAQ by ID (admin only)
   */
  getById: async (id: string): Promise<{ faq: FaqItem }> => {
    return apiClient.get<{ faq: FaqItem }>(`/api/admin/faqs/${id}`);
  },

  /**
   * Create a new FAQ (admin only)
   */
  create: async (faqData: Partial<FaqItem>): Promise<{ faq: FaqItem, message: string }> => {
    return apiClient.post<{ faq: FaqItem, message: string }>('/api/admin/faqs', faqData);
  },

  /**
   * Update a FAQ (admin only)
   */
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
      return apiClient.put<{ faq: FaqItem, message: string }>(`/api/admin/faqs/${id}`, sanitizedData);
    } catch (error) {
      console.error('FAQ update error:', error);
      throw error;
    }
  },

  /**
   * Delete a FAQ (admin only)
   */
  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/api/admin/faqs/${id}`);
  }
};
