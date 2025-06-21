import apiClient from './apiClient';

// Define types for User API
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

/**
 * User API service
 */
export const userApi = {
  /**
   * Get all users (admin only)
   */
  getAll: async (): Promise<UsersResponse> => {
    return apiClient.get<UsersResponse>('/api/admin/users');
  },

  /**
   * Get a user by ID (admin only)
   */
  getById: async (id: string): Promise<UserItem> => {
    const response = await apiClient.get<{ user: UserItem }>(`/api/admin/users/${id}`);
    return response.user;
  },

  /**
   * Create a new user (admin only)
   */
  create: async (userData: Partial<UserItem>): Promise<UserItem> => {
    const response = await apiClient.post<{ user: UserItem }>('/api/admin/users', userData);
    return response.user;
  },

  /**
   * Update a user (admin only)
   */
  update: async (id: string, userData: Partial<UserItem>): Promise<UserItem> => {
    const response = await apiClient.put<{ user: UserItem }>(`/api/admin/users/${id}`, userData);
    return response.user;
  },

  /**
   * Delete a user (admin only)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/users/${id}`);
  }
};
