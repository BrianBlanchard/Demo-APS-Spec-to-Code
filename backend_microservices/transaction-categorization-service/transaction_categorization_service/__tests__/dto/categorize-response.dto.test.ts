import type {
  CategorizeResponse,
  ErrorResponse,
  HealthResponse,
} from '../../src/dto/categorize-response.dto';

describe('CategorizeResponse DTO', () => {
  it('should have all required fields for a valid response', () => {
    const response: CategorizeResponse = {
      transactionType: '01',
      transactionTypeName: 'Purchase',
      transactionCategory: '5411',
      categoryName: 'Grocery Stores',
      categoryGroup: 'retail',
      interestRate: 18.99,
      rewardsEligible: true,
      rewardsRate: 1.5,
    };

    expect(response.transactionType).toBe('01');
    expect(response.transactionTypeName).toBe('Purchase');
    expect(response.transactionCategory).toBe('5411');
    expect(response.categoryName).toBe('Grocery Stores');
    expect(response.categoryGroup).toBe('retail');
    expect(response.interestRate).toBe(18.99);
    expect(response.rewardsEligible).toBe(true);
    expect(response.rewardsRate).toBe(1.5);
  });

  it('should support response with no rewards', () => {
    const response: CategorizeResponse = {
      transactionType: '02',
      transactionTypeName: 'Cash Advance',
      transactionCategory: '6011',
      categoryName: 'Cash Advance',
      categoryGroup: 'cash',
      interestRate: 24.99,
      rewardsEligible: false,
      rewardsRate: 0.0,
    };

    expect(response.rewardsEligible).toBe(false);
    expect(response.rewardsRate).toBe(0.0);
  });

  it('should support default category response', () => {
    const response: CategorizeResponse = {
      transactionType: '01',
      transactionTypeName: 'Purchase',
      transactionCategory: '9999',
      categoryName: 'Other',
      categoryGroup: 'other',
      interestRate: 19.99,
      rewardsEligible: false,
      rewardsRate: 0.0,
    };

    expect(response.transactionCategory).toBe('9999');
    expect(response.categoryName).toBe('Other');
  });
});

describe('ErrorResponse DTO', () => {
  it('should have all required fields for error response', () => {
    const errorResponse: ErrorResponse = {
      errorCode: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      timestamp: '2024-01-15T10:30:00.000Z',
      traceId: '550e8400-e29b-41d4-a716-446655440000',
    };

    expect(errorResponse.errorCode).toBe('VALIDATION_ERROR');
    expect(errorResponse.message).toBe('Request validation failed');
    expect(errorResponse.timestamp).toBe('2024-01-15T10:30:00.000Z');
    expect(errorResponse.traceId).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('should support different error codes', () => {
    const errorCodes = [
      'VALIDATION_ERROR',
      'CATEGORY_NOT_FOUND',
      'DATABASE_ERROR',
      'INTERNAL_SERVER_ERROR',
    ];

    errorCodes.forEach((code) => {
      const errorResponse: ErrorResponse = {
        errorCode: code,
        message: 'Error message',
        timestamp: new Date().toISOString(),
        traceId: 'trace-123',
      };

      expect(errorResponse.errorCode).toBe(code);
    });
  });

  it('should handle ISO timestamp format', () => {
    const now = new Date();
    const errorResponse: ErrorResponse = {
      errorCode: 'TEST_ERROR',
      message: 'Test error',
      timestamp: now.toISOString(),
      traceId: 'trace-123',
    };

    expect(errorResponse.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});

describe('HealthResponse DTO', () => {
  it('should have required fields for healthy status', () => {
    const healthResponse: HealthResponse = {
      status: 'UP',
      timestamp: '2024-01-15T10:30:00.000Z',
      uptime: 3600,
    };

    expect(healthResponse.status).toBe('UP');
    expect(healthResponse.timestamp).toBe('2024-01-15T10:30:00.000Z');
    expect(healthResponse.uptime).toBe(3600);
  });

  it('should support unhealthy status', () => {
    const healthResponse: HealthResponse = {
      status: 'DOWN',
      timestamp: '2024-01-15T10:30:00.000Z',
      uptime: 3600,
    };

    expect(healthResponse.status).toBe('DOWN');
  });

  it('should support optional database status when UP', () => {
    const healthResponse: HealthResponse = {
      status: 'UP',
      timestamp: '2024-01-15T10:30:00.000Z',
      uptime: 3600,
      database: 'UP',
    };

    expect(healthResponse.database).toBe('UP');
  });

  it('should support optional database status when DOWN', () => {
    const healthResponse: HealthResponse = {
      status: 'DOWN',
      timestamp: '2024-01-15T10:30:00.000Z',
      uptime: 3600,
      database: 'DOWN',
    };

    expect(healthResponse.database).toBe('DOWN');
  });

  it('should work without optional database field', () => {
    const healthResponse: HealthResponse = {
      status: 'UP',
      timestamp: '2024-01-15T10:30:00.000Z',
      uptime: 3600,
    };

    expect(healthResponse.database).toBeUndefined();
  });

  it('should handle various uptime values', () => {
    const uptimes = [0, 1, 60, 3600, 86400, 604800];

    uptimes.forEach((uptime) => {
      const healthResponse: HealthResponse = {
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptime,
      };

      expect(healthResponse.uptime).toBe(uptime);
    });
  });
});
