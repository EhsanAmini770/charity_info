import apiClient from './apiClient';
import { NewsItem } from './newsApi';
import { AlbumItem } from './galleryApi';

/**
 * Search API service
 */
export const searchApi = {
  /**
   * Search for content
   */
  search: async (query: string): Promise<{ news: NewsItem[], albums: AlbumItem[] }> => {
    return apiClient.get<{ news: NewsItem[], albums: AlbumItem[] }>(`/api/search?q=${encodeURIComponent(query)}`);
  }
};
