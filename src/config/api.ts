
// API configuration
const API_CONFIG = {
  baseURL: process.env.NODE_ENV === 'production'
    ? '/api' // In production, use relative path
    : 'http://localhost:5000', // In development, use explicit URL
  timeout: 15000, // Increased timeout for slower connections
  withCredentials: true,
  headers: {
    'Cache-Control': 'max-age=300', // Cache responses for 5 minutes
    'Content-Type': 'application/json',
  },
};

export default API_CONFIG;
