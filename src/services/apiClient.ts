import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import API_CONFIG from '../config/api';

// Track if we're currently fetching a CSRF token
let isFetchingCsrf = false;
// Store the CSRF token
let csrfToken: string | null = null;
// Create a promise to track pending CSRF requests
let csrfPromise: Promise<string> | null = null;

/**
 * Base API client with common functionality
 */
class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      withCredentials: API_CONFIG.withCredentials,
    });

    this.setupInterceptors();
  }

  /**
   * Get CSRF token for secure requests
   */
  private async getCsrfToken(): Promise<string> {
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
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Add request interceptor for authentication
    this.instance.interceptors.request.use(
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
            const token = await this.getCsrfToken();
            config.headers['CSRF-Token'] = token;
          } catch (error) {
            console.error('Failed to fetch CSRF token:', error);
          }
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
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
            return this.getCsrfToken().then(token => {
              error.config.headers['CSRF-Token'] = token;
              return axios(error.config);
            });
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Make a GET request
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.get(url, config);
    return response.data;
  }

  /**
   * Make a POST request
   */
  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.post(url, data, config);
    return response.data;
  }

  /**
   * Make a PUT request
   */
  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.put(url, data, config);
    return response.data;
  }

  /**
   * Make a DELETE request
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.delete(url, config);
    return response.data;
  }

  /**
   * Get the underlying axios instance
   */
  public getAxiosInstance(): AxiosInstance {
    return this.instance;
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;
