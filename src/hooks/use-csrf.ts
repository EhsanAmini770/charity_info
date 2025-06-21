
import { useState, useEffect } from 'react';
import axios from 'axios';
import API_CONFIG from '../config/api';

export const useCsrf = () => {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_CONFIG.baseURL}/api/csrf-token`, { 
          withCredentials: true 
        });
        setCsrfToken(response.data.csrfToken);
      } catch (err) {
        setError(err as Error);
        console.error('Failed to fetch CSRF token:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCsrfToken();
  }, []);
  
  return { csrfToken, isLoading, error };
};
