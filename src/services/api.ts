import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  SearchRequest,
  SearchResponse,
  AccommodationRequest,
  AccommodationResponse,
  ApiError,
  ErrorState,
} from '../types';

/**
 * API Client for Vortex 2026 Accommodation System
 */
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - add authentication token
    this.client.interceptors.request.use(
      (config) => {
        const token = import.meta.env.VITE_API_SECRET_KEY;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - centralized error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError = this.handleError(error);
        return Promise.reject(apiError);
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as any;

      let errorState: ErrorState;

      switch (status) {
        case 400:
          // Validation error - show field-specific messages
          errorState = {
            type: 'validation',
            message: data.error || 'Validation failed',
            details: data.details || [],
          };
          break;

        case 401:
          // Authentication error
          errorState = {
            type: 'auth',
            message: 'Authentication failed. Please check your credentials.',
          };
          break;

        case 409:
          // Duplicate entry - special handling
          errorState = {
            type: 'duplicate',
            message: data.message || 'A duplicate entry was found',
            existingEntry: data.existingEntry,
          };
          break;

        case 429:
          // Rate limit exceeded
          errorState = {
            type: 'rate_limit',
            message: 'Too many requests. Please wait a moment and try again.',
          };
          break;

        case 503:
          // Service unavailable
          errorState = {
            type: 'service_unavailable',
            message: 'The system is temporarily unavailable. Please try again in a moment.',
          };
          break;

        default:
          errorState = {
            type: 'unknown',
            message: data.message || 'An unexpected error occurred. Please try again.',
          };
      }

      const apiError = new Error(errorState.message) as ApiError;
      apiError.type = errorState.type;
      apiError.details = errorState.details;
      apiError.existingEntry = errorState.existingEntry;
      return apiError;
    } else if (error.request) {
      // Request made but no response (network error)
      const apiError = new Error('Network error. Please check your connection and try again.') as ApiError;
      apiError.type = 'network';
      return apiError;
    } else {
      // Error setting up request
      const apiError = new Error('An error occurred. Please try again.') as ApiError;
      apiError.type = 'client';
      return apiError;
    }
  }

  /**
   * Search for participant by email
   */
  async searchParticipant(email: string): Promise<SearchResponse> {
    const request: SearchRequest = { email };
    const response = await this.client.post<SearchResponse>('/api/search', request);
    return response.data;
  }

  /**
   * Add new accommodation entry
   */
  async addAccommodation(data: AccommodationRequest): Promise<AccommodationResponse> {
    const response = await this.client.post<AccommodationResponse>('/api/accommodation', data);
    return response.data;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string }> {
    const response = await this.client.get('/api/health');
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export functions for easier usage
export const searchParticipant = (email: string) => apiClient.searchParticipant(email);
export const addAccommodation = (data: AccommodationRequest) => apiClient.addAccommodation(data);
export const healthCheck = () => apiClient.healthCheck();
