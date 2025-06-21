// Export all API services from a single entry point
export * from './newsApi';
export * from './galleryApi';
export * from './userApi';
export * from './analyticsApi';
export * from './searchApi';
export * from './faqApi';
export * from './partnersApi';

// Export the API client for direct access if needed
export { default as apiClient } from './apiClient';
