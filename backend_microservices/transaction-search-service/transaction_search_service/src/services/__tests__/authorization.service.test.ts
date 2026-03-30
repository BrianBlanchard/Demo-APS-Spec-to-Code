import { AuthorizationService } from '../authorization.service';
import { AppError } from '../../middleware/error.middleware';
import { requestContextStorage } from '../../utils/context.storage';
import { RequestContext } from '../../types';

describe('AuthorizationService - Business/Service Layer', () => {
  let authorizationService: AuthorizationService;

  beforeEach(() => {
    authorizationService = new AuthorizationService();
  });

  describe('validateAccountAccess', () => {
    it('should not throw when accountId is undefined', () => {
      expect(() => {
        authorizationService.validateAccountAccess(undefined);
      }).not.toThrow();
    });

    it('should throw 401 when accountId provided but no userId in context', () => {
      expect(() => {
        authorizationService.validateAccountAccess('12345678901');
      }).toThrow(AppError);

      try {
        authorizationService.validateAccountAccess('12345678901');
      } catch (error) {
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(401);
          expect(error.errorCode).toBe('UNAUTHORIZED');
          expect(error.message).toBe('Authentication required');
        }
      }
    });

    it('should not throw when accountId and userId both present', () => {
      const context: RequestContext = {
        traceId: 'auth-trace',
        userId: 'user123',
        timestamp: '2024-01-15T14:30:00Z',
      };

      requestContextStorage.run(context, () => {
        expect(() => {
          authorizationService.validateAccountAccess('12345678901');
        }).not.toThrow();
      });
    });
  });

  describe('validateCardAccess', () => {
    it('should not throw when cardNumber is undefined', () => {
      expect(() => {
        authorizationService.validateCardAccess(undefined);
      }).not.toThrow();
    });

    it('should throw 401 when cardNumber provided but no userId in context', () => {
      expect(() => {
        authorizationService.validateCardAccess('1234567890123456');
      }).toThrow(AppError);

      try {
        authorizationService.validateCardAccess('1234567890123456');
      } catch (error) {
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(401);
          expect(error.errorCode).toBe('UNAUTHORIZED');
        }
      }
    });

    it('should not throw when cardNumber and userId both present', () => {
      const context: RequestContext = {
        traceId: 'card-auth-trace',
        userId: 'user456',
        timestamp: '2024-01-15T14:30:00Z',
      };

      requestContextStorage.run(context, () => {
        expect(() => {
          authorizationService.validateCardAccess('1234567890123456');
        }).not.toThrow();
      });
    });
  });

  describe('validateAccountAccess and validateCardAccess - edge cases', () => {
    it('should handle empty string accountId', () => {
      const context: RequestContext = {
        traceId: 'empty-account',
        userId: 'user789',
        timestamp: '2024-01-15T14:30:00Z',
      };

      requestContextStorage.run(context, () => {
        expect(() => {
          authorizationService.validateAccountAccess('');
        }).not.toThrow();
      });
    });

    it('should handle empty string cardNumber', () => {
      const context: RequestContext = {
        traceId: 'empty-card',
        userId: 'user999',
        timestamp: '2024-01-15T14:30:00Z',
      };

      requestContextStorage.run(context, () => {
        expect(() => {
          authorizationService.validateCardAccess('');
        }).not.toThrow();
      });
    });
  });
});
