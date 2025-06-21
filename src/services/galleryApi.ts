import apiClient from './apiClient';

// Define types for Gallery API
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

/**
 * Gallery API service
 */
export const galleryApi = {
  /**
   * Get all albums
   */
  getAllAlbums: async (): Promise<AlbumResponse> => {
    return apiClient.get<AlbumResponse>('/api/gallery/albums');
  },

  /**
   * Get an album by slug
   */
  getAlbumBySlug: async (slug: string): Promise<{ album: AlbumItem, images: ImageItem[] }> => {
    try {
      return apiClient.get<{ album: AlbumItem, images: ImageItem[] }>(`/api/gallery/albums/${slug}`);
    } catch (error) {
      console.error('Error fetching album by slug:', error);
      throw error;
    }
  },

  /**
   * Get an album by ID (admin only)
   */
  getAlbumById: async (id: string): Promise<{ album: AlbumItem, images: ImageItem[] }> => {
    try {
      return apiClient.get<{ album: AlbumItem, images: ImageItem[] }>(`/api/admin/gallery/albums/${id}`);
    } catch (error) {
      console.error('Error fetching album by ID:', error);
      throw error;
    }
  },

  /**
   * Create a new album (admin only)
   */
  createAlbum: async (albumData: Partial<AlbumItem>): Promise<AlbumItem> => {
    const response = await apiClient.post<{ album: AlbumItem }>('/api/admin/gallery/albums', albumData);
    return response.album;
  },

  /**
   * Update an album (admin only)
   */
  updateAlbum: async (id: string, albumData: Partial<AlbumItem>): Promise<AlbumItem> => {
    const response = await apiClient.put<{ album: AlbumItem }>(`/api/admin/gallery/albums/${id}`, albumData);
    return response.album;
  },

  /**
   * Delete an album (admin only)
   */
  deleteAlbum: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/gallery/albums/${id}`);
  },

  /**
   * Upload an image to an album (admin only)
   */
  uploadImage: async (albumId: string, formData: FormData): Promise<any> => {
    // Ensure CSRF token is included
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      formData.append('_csrf', csrfToken);
    }

    return apiClient.post(`/api/admin/gallery/albums/${albumId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Delete an image (admin only)
   */
  deleteImage: async (imageId: string): Promise<void> => {
    await apiClient.delete(`/api/admin/gallery/images/${imageId}`);
  }
};
