import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../types/error.types';

jest.mock('../../config', () => ({
  config: {
    rateLimit: {
      windowMs: 60000,
      maxRequests: 5,
    },
  },
}));

// Import once before tests
import { rateLimiterMiddleware } from '../rate-limiter.middleware';

describe('rate-limiter.middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockRequest = {
      headers: {},
    };

    mockResponse = {};

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('without x-user-id header', () => {
    it('should call next without rate limiting', () => {
      rateLimiterMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow unlimited requests without userId', () => {
      for (let i = 0; i < 100; i++) {
        rateLimiterMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }

      expect(mockNext).toHaveBeenCalledTimes(100);
    });
  });

  describe('with x-user-id header', () => {
    beforeEach(() => {
      mockRequest.headers = {
        'x-user-id': `test-user-${Date.now()}-${Math.random()}`,
      };
    });

    it('should allow first request', () => {
      rateLimiterMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow requests within rate limit', () => {
      for (let i = 0; i < 5; i++) {
        rateLimiterMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }

      expect(mockNext).toHaveBeenCalledTimes(5);
    });

    it('should throw AppError when rate limit exceeded', () => {
      // Make 5 allowed requests
      for (let i = 0; i < 5; i++) {
        rateLimiterMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }

      // 6th request should throw
      expect(() => {
        rateLimiterMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }).toThrowError('Rate limit exceeded');
    });

    it('should throw error with correct properties when rate limit exceeded', () => {
      for (let i = 0; i < 5; i++) {
        rateLimiterMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }

      try {
        rateLimiterMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
        fail('Should have thrown AppError');
      } catch (error) {
        expect(error instanceof AppError).toBe(true);
        expect((error as AppError).message).toBe('Rate limit exceeded');
        expect((error as AppError).errorCode).toBe('RATE_LIMIT_EXCEEDED');
        expect((error as AppError).statusCode).toBe(429);
      }
    });

    it('should reset rate limit after window expires', () => {
      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        rateLimiterMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }

      // Advance time beyond window
      jest.advanceTimersByTime(60001);

      // Next request should be allowed
      rateLimiterMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledTimes(6);
    });

    it('should track rate limits separately for different users', () => {
      const user1Request = { headers: { 'x-user-id': `user-1-${Date.now()}` } } as Partial<Request> as Request;
      const user2Request = { headers: { 'x-user-id': `user-2-${Date.now()}` } } as Partial<Request> as Request;

      // User 1 makes 5 requests
      for (let i = 0; i < 5; i++) {
        rateLimiterMiddleware(user1Request, mockResponse as Response, mockNext);
      }

      // User 2 should still be able to make requests
      rateLimiterMiddleware(user2Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(6);

      // User 1 should be rate limited
      expect(() => {
        rateLimiterMiddleware(user1Request, mockResponse as Response, mockNext);
      }).toThrowError('Rate limit exceeded');

      // User 2 should still be allowed
      rateLimiterMiddleware(user2Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(7);
    });

    it('should increment count for each request', () => {
      for (let i = 1; i <= 5; i++) {
        rateLimiterMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
        expect(mockNext).toHaveBeenCalledTimes(i);
      }
    });

    it('should maintain rate limit across multiple calls within window', () => {
      // Make 3 requests
      for (let i = 0; i < 3; i++) {
        rateLimiterMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }

      // Advance time but stay within window
      jest.advanceTimersByTime(30000);

      // Make 2 more requests (total 5)
      for (let i = 0; i < 2; i++) {
        rateLimiterMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }

      expect(mockNext).toHaveBeenCalledTimes(5);

      // Next request should fail
      expect(() => {
        rateLimiterMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }).toThrowError('Rate limit exceeded');
    });
  });

  describe('cleanup mechanism', () => {
    it('should clean up expired entries periodically', () => {
      const user1Request = { headers: { 'x-user-id': `cleanup-user-1-${Date.now()}` } } as Partial<Request> as Request;
      const user2Request = { headers: { 'x-user-id': `cleanup-user-2-${Date.now()}` } } as Partial<Request> as Request;

      // Make requests for both users
      rateLimiterMiddleware(user1Request, mockResponse as Response, mockNext);
      rateLimiterMiddleware(user2Request, mockResponse as Response, mockNext);

      // Advance time to expire entries
      jest.advanceTimersByTime(60001);

      // Trigger cleanup interval (60000ms)
      jest.advanceTimersByTime(60000);

      // Both users should be able to make requests again
      rateLimiterMiddleware(user1Request, mockResponse as Response, mockNext);
      rateLimiterMiddleware(user2Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(4);
    });

    it('should not clean up non-expired entries', () => {
      mockRequest.headers = { 'x-user-id': `non-expired-${Date.now()}` };

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        rateLimiterMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }

      // Trigger cleanup but don't expire the entry
      jest.advanceTimersByTime(60000);

      // User should still be rate limited
      expect(() => {
        rateLimiterMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }).toThrowError('Rate limit exceeded');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string userId', () => {
      mockRequest.headers = { 'x-user-id': '' };

      rateLimiterMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle undefined x-user-id', () => {
      mockRequest.headers = { 'x-user-id': undefined };

      rateLimiterMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle very long userId strings', () => {
      const longUserId = 'a'.repeat(1000) + Date.now();
      mockRequest.headers = { 'x-user-id': longUserId };

      for (let i = 0; i < 5; i++) {
        rateLimiterMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }

      expect(() => {
        rateLimiterMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }).toThrowError('Rate limit exceeded');
    });

    it('should handle special characters in userId', () => {
      mockRequest.headers = { 'x-user-id': `user!@#$%^&*()-${Date.now()}` };

      rateLimiterMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle numeric userId', () => {
      mockRequest.headers = { 'x-user-id': `12345-${Date.now()}` };

      for (let i = 0; i < 5; i++) {
        rateLimiterMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }

      expect(() => {
        rateLimiterMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }).toThrowError('Rate limit exceeded');
    });
  });

  describe('concurrent requests', () => {
    it('should handle rapid concurrent requests from same user', () => {
      mockRequest.headers = { 'x-user-id': `user-concurrent-${Date.now()}` };

      Array(5).fill(null).map(() => {
        rateLimiterMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      });

      expect(mockNext).toHaveBeenCalledTimes(5);

      expect(() => {
        rateLimiterMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }).toThrowError('Rate limit exceeded');
    });

    it('should handle requests from multiple users concurrently', () => {
      const timestamp = Date.now();
      const users = ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'];

      users.forEach((userId) => {
        const req = { headers: { 'x-user-id': `${userId}-${timestamp}` } } as Partial<Request> as Request;
        rateLimiterMiddleware(req, mockResponse as Response, mockNext);
      });

      expect(mockNext).toHaveBeenCalledTimes(5);
    });
  });

  describe('reset behavior', () => {
    it('should reset count when window expires', () => {
      mockRequest.headers = { 'x-user-id': `user-reset-${Date.now()}` };

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        rateLimiterMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }

      // Should be rate limited
      expect(() => {
        rateLimiterMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }).toThrowError('Rate limit exceeded');

      // Advance time past window
      jest.advanceTimersByTime(60001);

      // Should allow requests again
      rateLimiterMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledTimes(6);
    });

    it('should create new entry with updated resetTime after expiry', () => {
      mockRequest.headers = { 'x-user-id': `user-new-entry-${Date.now()}` };

      const now = Date.now();
      jest.setSystemTime(now);

      // Make request
      rateLimiterMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Advance time past window
      jest.setSystemTime(now + 60001);

      // Make another request (should create new entry)
      rateLimiterMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledTimes(2);
    });
  });

  describe('configuration', () => {
    it('should use configured windowMs from config', () => {
      mockRequest.headers = { 'x-user-id': `user-config-test-${Date.now()}` };

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        rateLimiterMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }

      // Advance time by exactly windowMs
      jest.advanceTimersByTime(60000);

      // Should still be rate limited (not > resetTime)
      expect(() => {
        rateLimiterMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }).toThrowError('Rate limit exceeded');

      // Advance one more millisecond
      jest.advanceTimersByTime(1);

      // Now should be allowed
      rateLimiterMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledTimes(6);
    });

    it('should use configured maxRequests from config', () => {
      mockRequest.headers = { 'x-user-id': `user-max-test-${Date.now()}` };

      // Config has maxRequests: 5
      for (let i = 0; i < 5; i++) {
        rateLimiterMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }

      expect(mockNext).toHaveBeenCalledTimes(5);

      // 6th should fail
      expect(() => {
        rateLimiterMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }).toThrowError('Rate limit exceeded');
    });
  });
});
