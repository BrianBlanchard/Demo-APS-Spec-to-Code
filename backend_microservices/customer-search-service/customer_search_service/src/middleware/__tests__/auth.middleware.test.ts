import { Request, Response, NextFunction } from 'express';
import { authMiddleware, requireRole } from '../auth.middleware';
import { UnauthorizedError, ForbiddenError } from '../../types/error.types';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  describe('authMiddleware', () => {
    it('should pass authentication with valid Bearer token', () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
        'x-user-role': 'associate',
      };

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should throw UnauthorizedError when authorization header is missing', () => {
      expect(() => {
        authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError when authorization header does not start with Bearer', () => {
      mockRequest.headers = {
        authorization: 'Basic username:password',
      };

      expect(() => {
        authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(UnauthorizedError);
      expect(() => {
        authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow('Missing or invalid authorization header');
    });

    it('should throw UnauthorizedError when user role header is missing', () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      expect(() => {
        authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(UnauthorizedError);
      expect(() => {
        authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow('User role not found');
    });

    it('should pass with different user roles', () => {
      const roles = ['associate', 'manager', 'admin'];

      roles.forEach((role) => {
        mockRequest.headers = {
          authorization: 'Bearer valid-token',
          'x-user-role': role,
        };

        authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });
    });

    it('should handle authorization header with extra spaces', () => {
      mockRequest.headers = {
        authorization: 'Bearer  token-with-spaces',
        'x-user-role': 'associate',
      };

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should allow access for user with correct role', () => {
      mockRequest.headers = {
        'x-user-role': 'associate',
      };

      const middleware = requireRole('associate', 'manager');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow access for user with one of multiple allowed roles', () => {
      mockRequest.headers = {
        'x-user-role': 'manager',
      };

      const middleware = requireRole('associate', 'manager', 'admin');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should throw ForbiddenError when user role is not allowed', () => {
      mockRequest.headers = {
        'x-user-role': 'guest',
      };

      const middleware = requireRole('associate', 'manager');

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(ForbiddenError);
      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow('Insufficient permissions');
    });

    it('should throw ForbiddenError when user role header is missing', () => {
      mockRequest.headers = {};

      const middleware = requireRole('associate');

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(ForbiddenError);
    });

    it('should be case-sensitive for role matching', () => {
      mockRequest.headers = {
        'x-user-role': 'ASSOCIATE',
      };

      const middleware = requireRole('associate');

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(ForbiddenError);
    });

    it('should allow single role requirement', () => {
      mockRequest.headers = {
        'x-user-role': 'admin',
      };

      const middleware = requireRole('admin');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should not call next when access is denied', () => {
      mockRequest.headers = {
        'x-user-role': 'guest',
      };

      const middleware = requireRole('admin');

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(ForbiddenError);

      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
