import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { apiClient, searchParticipant, addAccommodation } from './api';
import type { SearchResponse, AccommodationResponse } from '../types';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('API Client', () => {
  let mockCreate: any;
  let mockPost: any;
  let mockGet: any;
  let requestInterceptor: any;
  let responseInterceptor: any;

  beforeEach(() => {
    mockPost = vi.fn();
    mockGet = vi.fn();

    const interceptors = {
      request: {
        use: vi.fn((onFulfilled, onRejected) => {
          requestInterceptor = { onFulfilled, onRejected };
        }),
      },
      response: {
        use: vi.fn((onFulfilled, onRejected) => {
          responseInterceptor = { onFulfilled, onRejected };
        }),
      },
    };

    mockCreate = vi.fn(() => ({
      post: mockPost,
      get: mockGet,
      interceptors,
    }));

    mockedAxios.create = mockCreate;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should create axios instance with correct config', () => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.any(String),
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should set up request and response interceptors', () => {
      expect(requestInterceptor).toBeDefined();
      expect(responseInterceptor).toBeDefined();
    });
  });

  describe('Request Interceptor', () => {
    it('should add authorization token to requests', () => {
      const config = {
        headers: {},
      };

      // Set mock environment variable
      import.meta.env.VITE_API_SECRET_KEY = 'test-token';

      const result = requestInterceptor.onFulfilled(config);

      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('should handle requests without token', () => {
      const config = {
        headers: {},
      };

      // Clear environment variable
      import.meta.env.VITE_API_SECRET_KEY = undefined;

      const result = requestInterceptor.onFulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('Response Interceptor - Error Handling', () => {
    it('should handle 400 validation errors', () => {
      const error = {
        response: {
          status: 400,
          data: {
            error: 'Validation failed',
            details: [
              { field: 'email', message: 'Invalid email format' },
            ],
          },
        },
      };

      try {
        responseInterceptor.onRejected(error);
      } catch (apiError: any) {
        expect(apiError.type).toBe('validation');
        expect(apiError.message).toBe('Validation failed');
        expect(apiError.details).toHaveLength(1);
        expect(apiError.details[0].field).toBe('email');
      }
    });

    it('should handle 401 authentication errors', () => {
      const error = {
        response: {
          status: 401,
          data: {},
        },
      };

      try {
        responseInterceptor.onRejected(error);
      } catch (apiError: any) {
        expect(apiError.type).toBe('auth');
        expect(apiError.message).toContain('Authentication failed');
      }
    });

    it('should handle 409 duplicate errors', () => {
      const error = {
        response: {
          status: 409,
          data: {
            message: 'Duplicate entry found',
            existingEntry: {
              name: 'John Doe',
              email: 'john@example.com',
            },
          },
        },
      };

      try {
        responseInterceptor.onRejected(error);
      } catch (apiError: any) {
        expect(apiError.type).toBe('duplicate');
        expect(apiError.message).toBe('Duplicate entry found');
        expect(apiError.existingEntry).toBeDefined();
        expect(apiError.existingEntry.name).toBe('John Doe');
      }
    });

    it('should handle 429 rate limit errors', () => {
      const error = {
        response: {
          status: 429,
          data: {},
        },
      };

      try {
        responseInterceptor.onRejected(error);
      } catch (apiError: any) {
        expect(apiError.type).toBe('rate_limit');
        expect(apiError.message).toContain('Too many requests');
      }
    });

    it('should handle 503 service unavailable errors', () => {
      const error = {
        response: {
          status: 503,
          data: {},
        },
      };

      try {
        responseInterceptor.onRejected(error);
      } catch (apiError: any) {
        expect(apiError.type).toBe('service_unavailable');
        expect(apiError.message).toContain('temporarily unavailable');
      }
    });

    it('should handle network errors', () => {
      const error = {
        request: {},
      };

      try {
        responseInterceptor.onRejected(error);
      } catch (apiError: any) {
        expect(apiError.type).toBe('network');
        expect(apiError.message).toContain('Network error');
      }
    });

    it('should handle client errors', () => {
      const error = {
        message: 'Request setup failed',
      };

      try {
        responseInterceptor.onRejected(error);
      } catch (apiError: any) {
        expect(apiError.type).toBe('client');
        expect(apiError.message).toContain('error occurred');
      }
    });
  });

  describe('searchParticipant', () => {
    it('should make POST request to /api/search', async () => {
      const mockResponse: SearchResponse = {
        found: true,
        participant: {
          name: 'John Doe',
          email: 'john@example.com',
          college: 'NIT Trichy',
          events: ['Event A'],
          workshops: ['Workshop X'],
          accommodation: null,
        },
      };

      mockPost.mockResolvedValue({ data: mockResponse });

      const result = await searchParticipant('john@example.com');

      expect(mockPost).toHaveBeenCalledWith('/api/search', {
        email: 'john@example.com',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('addAccommodation', () => {
    it('should make POST request to /api/accommodation', async () => {
      const accommodationData = {
        name: 'John Doe',
        email: 'john@example.com',
        college: 'NIT Trichy',
        fromDate: '2026-03-06',
        toDate: '2026-03-08',
        accommodationType: 'Boys' as const,
        notes: 'Test notes',
      };

      const mockResponse: AccommodationResponse = {
        success: true,
        message: 'Accommodation created successfully',
      };

      mockPost.mockResolvedValue({ data: mockResponse });

      const result = await addAccommodation(accommodationData);

      expect(mockPost).toHaveBeenCalledWith('/api/accommodation', accommodationData);
      expect(result).toEqual(mockResponse);
    });

    it('should include force flag when provided', async () => {
      const accommodationData = {
        name: 'John Doe',
        email: 'john@example.com',
        college: 'NIT Trichy',
        fromDate: '2026-03-06',
        toDate: '2026-03-08',
        accommodationType: 'Boys' as const,
        force: true,
      };

      const mockResponse: AccommodationResponse = {
        success: true,
        message: 'Accommodation created successfully',
      };

      mockPost.mockResolvedValue({ data: mockResponse });

      await addAccommodation(accommodationData);

      expect(mockPost).toHaveBeenCalledWith('/api/accommodation', accommodationData);
    });
  });
});
