import apiClient from './apiClient';

// Define types for Analytics API
export interface AnalyticsVisitResponse {
  dates: string[];
  counts: number[];
}

export interface OnlineCountResponse {
  count: number;
}

/**
 * Analytics API service
 */
export const analyticsApi = {
  /**
   * Get visit statistics (admin only)
   */
  getVisits: async (days = 7): Promise<AnalyticsVisitResponse> => {
    return apiClient.get<AnalyticsVisitResponse>(`/api/admin/analytics/visits?days=${days}`);
  },

  /**
   * Get online user count (admin only)
   */
  getOnlineCount: async (): Promise<OnlineCountResponse> => {
    return apiClient.get<OnlineCountResponse>('/api/admin/analytics/online');
  }
};
