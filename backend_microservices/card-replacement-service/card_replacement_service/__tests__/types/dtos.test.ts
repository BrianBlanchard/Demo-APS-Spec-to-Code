import {
  DeliveryAddress,
  CardReplacementRequest,
  CardReplacementResponse,
  ErrorResponse,
  HealthResponse,
} from '../../src/types/dtos';
import { ReplacementReason, CardStatus, ShippingMethod } from '../../src/types/enums';

describe('DTOs', () => {
  describe('DeliveryAddress', () => {
    it('should accept valid delivery address with all fields', () => {
      const address: DeliveryAddress = {
        line1: '456 Oak Avenue',
        line2: 'Suite 200',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60602',
      };

      expect(address.line1).toBe('456 Oak Avenue');
      expect(address.line2).toBe('Suite 200');
      expect(address.city).toBe('Chicago');
      expect(address.state).toBe('IL');
      expect(address.zipCode).toBe('60602');
    });

    it('should accept valid delivery address without optional line2', () => {
      const address: DeliveryAddress = {
        line1: '456 Oak Avenue',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60602',
      };

      expect(address.line1).toBe('456 Oak Avenue');
      expect(address.line2).toBeUndefined();
      expect(address.city).toBe('Chicago');
    });
  });

  describe('CardReplacementRequest', () => {
    it('should accept valid request with all fields', () => {
      const request: CardReplacementRequest = {
        replacementReason: ReplacementReason.LOST_OR_STOLEN,
        deliveryAddress: {
          line1: '456 Oak Avenue',
          line2: 'Suite 200',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60602',
        },
        expeditedShipping: true,
        notifyCustomer: true,
      };

      expect(request.replacementReason).toBe('lost_or_stolen');
      expect(request.expeditedShipping).toBe(true);
      expect(request.notifyCustomer).toBe(true);
      expect(request.deliveryAddress.city).toBe('Chicago');
    });

    it('should accept request without optional expeditedShipping', () => {
      const request: CardReplacementRequest = {
        replacementReason: ReplacementReason.DAMAGED,
        deliveryAddress: {
          line1: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
        },
        notifyCustomer: false,
      };

      expect(request.expeditedShipping).toBeUndefined();
    });

    it('should support all replacement reason types', () => {
      const reasons = [
        ReplacementReason.LOST_OR_STOLEN,
        ReplacementReason.DAMAGED,
        ReplacementReason.EXPIRING_SOON,
        ReplacementReason.FRAUD_PREVENTION,
      ];

      reasons.forEach((reason) => {
        const request: CardReplacementRequest = {
          replacementReason: reason,
          deliveryAddress: {
            line1: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
          },
          notifyCustomer: true,
        };

        expect(request.replacementReason).toBe(reason);
      });
    });
  });

  describe('CardReplacementResponse', () => {
    it('should accept valid response with all fields', () => {
      const response: CardReplacementResponse = {
        originalCardNumber: '************1234',
        originalCardStatus: CardStatus.INACTIVE,
        replacementCardNumber: '************5678',
        replacementCardStatus: CardStatus.ACTIVE,
        accountId: '12345678901',
        customerId: '123456789',
        embossedName: 'JOHN M ANDERSON',
        expirationDate: '01/27',
        issuedDate: '2024-01-15',
        estimatedDelivery: '2024-01-17',
        shippingMethod: ShippingMethod.EXPEDITED,
        activationRequired: true,
      };

      expect(response.originalCardNumber).toBe('************1234');
      expect(response.replacementCardNumber).toBe('************5678');
      expect(response.accountId).toBe('12345678901');
      expect(response.activationRequired).toBe(true);
    });

    it('should support standard shipping method', () => {
      const response: CardReplacementResponse = {
        originalCardNumber: '************1234',
        originalCardStatus: CardStatus.INACTIVE,
        replacementCardNumber: '************5678',
        replacementCardStatus: CardStatus.ACTIVE,
        accountId: '12345678901',
        customerId: '123456789',
        embossedName: 'JOHN M ANDERSON',
        expirationDate: '01/27',
        issuedDate: '2024-01-15',
        estimatedDelivery: '2024-01-22',
        shippingMethod: ShippingMethod.STANDARD,
        activationRequired: true,
      };

      expect(response.shippingMethod).toBe('standard');
    });
  });

  describe('ErrorResponse', () => {
    it('should accept valid error response', () => {
      const error: ErrorResponse = {
        errorCode: 'VALIDATION_ERROR',
        message: 'Invalid input',
        timestamp: '2024-01-15T10:30:00.000Z',
        traceId: '550e8400-e29b-41d4-a716-446655440000',
      };

      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
      expect(error.timestamp).toBe('2024-01-15T10:30:00.000Z');
      expect(error.traceId).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should have all required fields', () => {
      const error: ErrorResponse = {
        errorCode: 'NOT_FOUND',
        message: 'Resource not found',
        timestamp: new Date().toISOString(),
        traceId: 'test-trace-id',
      };

      expect(error).toHaveProperty('errorCode');
      expect(error).toHaveProperty('message');
      expect(error).toHaveProperty('timestamp');
      expect(error).toHaveProperty('traceId');
    });
  });

  describe('HealthResponse', () => {
    it('should accept healthy status with database info', () => {
      const health: HealthResponse = {
        status: 'healthy',
        timestamp: '2024-01-15T10:30:00.000Z',
        version: '1.0.0',
        uptime: 3600,
        database: {
          connected: true,
        },
      };

      expect(health.status).toBe('healthy');
      expect(health.uptime).toBe(3600);
      expect(health.database?.connected).toBe(true);
    });

    it('should accept unhealthy status', () => {
      const health: HealthResponse = {
        status: 'unhealthy',
        timestamp: '2024-01-15T10:30:00.000Z',
        version: '1.0.0',
        uptime: 3600,
        database: {
          connected: false,
        },
      };

      expect(health.status).toBe('unhealthy');
      expect(health.database?.connected).toBe(false);
    });

    it('should accept response without database info', () => {
      const health: HealthResponse = {
        status: 'healthy',
        timestamp: '2024-01-15T10:30:00.000Z',
        version: '1.0.0',
        uptime: 3600,
      };

      expect(health.database).toBeUndefined();
    });
  });
});
