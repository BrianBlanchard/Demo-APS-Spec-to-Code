import type { RequestContext, AuditLogEntry } from '../../src/types/request-context.types';

describe('RequestContext Type', () => {
  it('should create a valid request context', () => {
    const context: RequestContext = {
      traceId: '550e8400-e29b-41d4-a716-446655440000',
      timestamp: '2024-01-15T10:30:00.000Z',
    };

    expect(context.traceId).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(context.timestamp).toBe('2024-01-15T10:30:00.000Z');
  });

  it('should support various UUID formats for traceId', () => {
    const uuids = [
      '550e8400-e29b-41d4-a716-446655440000',
      '123e4567-e89b-12d3-a456-426614174000',
      'ffffffff-ffff-ffff-ffff-ffffffffffff',
    ];

    uuids.forEach((uuid) => {
      const context: RequestContext = {
        traceId: uuid,
        timestamp: new Date().toISOString(),
      };

      expect(context.traceId).toBe(uuid);
    });
  });

  it('should support ISO timestamp format', () => {
    const now = new Date();
    const context: RequestContext = {
      traceId: 'trace-123',
      timestamp: now.toISOString(),
    };

    expect(context.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should allow different timestamp formats', () => {
    const timestamps = [
      '2024-01-15T10:30:00.000Z',
      '2024-12-31T23:59:59.999Z',
      '2024-01-01T00:00:00.000Z',
    ];

    timestamps.forEach((timestamp) => {
      const context: RequestContext = {
        traceId: 'trace-123',
        timestamp,
      };

      expect(context.timestamp).toBe(timestamp);
    });
  });
});

describe('AuditLogEntry Type', () => {
  it('should create a valid audit log entry with success status', () => {
    const auditLog: AuditLogEntry = {
      traceId: '550e8400-e29b-41d4-a716-446655440000',
      timestamp: '2024-01-15T10:30:00.000Z',
      operation: 'categorize_transaction',
      status: 'success',
    };

    expect(auditLog.traceId).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(auditLog.timestamp).toBe('2024-01-15T10:30:00.000Z');
    expect(auditLog.operation).toBe('categorize_transaction');
    expect(auditLog.status).toBe('success');
    expect(auditLog.details).toBeUndefined();
    expect(auditLog.error).toBeUndefined();
  });

  it('should support failure status with error', () => {
    const auditLog: AuditLogEntry = {
      traceId: 'trace-123',
      timestamp: '2024-01-15T10:30:00.000Z',
      operation: 'categorize_transaction',
      status: 'failure',
      error: 'Database connection failed',
    };

    expect(auditLog.status).toBe('failure');
    expect(auditLog.error).toBe('Database connection failed');
  });

  it('should support retry status', () => {
    const auditLog: AuditLogEntry = {
      traceId: 'trace-123',
      timestamp: '2024-01-15T10:30:00.000Z',
      operation: 'categorize_transaction',
      status: 'retry',
    };

    expect(auditLog.status).toBe('retry');
  });

  it('should support optional details field', () => {
    const auditLog: AuditLogEntry = {
      traceId: 'trace-123',
      timestamp: '2024-01-15T10:30:00.000Z',
      operation: 'categorize_transaction',
      status: 'success',
      details: {
        merchantCategoryCode: '5411',
        categoryName: 'Grocery Stores',
        processingTime: 45,
      },
    };

    expect(auditLog.details).toBeDefined();
    expect(auditLog.details?.merchantCategoryCode).toBe('5411');
    expect(auditLog.details?.categoryName).toBe('Grocery Stores');
    expect(auditLog.details?.processingTime).toBe(45);
  });

  it('should support various operation types', () => {
    const operations = [
      'categorize_transaction',
      'unknown_mcc',
      'database_query',
      'validation_error',
    ];

    operations.forEach((operation) => {
      const auditLog: AuditLogEntry = {
        traceId: 'trace-123',
        timestamp: new Date().toISOString(),
        operation,
        status: 'success',
      };

      expect(auditLog.operation).toBe(operation);
    });
  });

  it('should support all status types', () => {
    const statuses: Array<'success' | 'failure' | 'retry'> = ['success', 'failure', 'retry'];

    statuses.forEach((status) => {
      const auditLog: AuditLogEntry = {
        traceId: 'trace-123',
        timestamp: new Date().toISOString(),
        operation: 'test_operation',
        status,
      };

      expect(auditLog.status).toBe(status);
    });
  });

  it('should handle complex details object', () => {
    const auditLog: AuditLogEntry = {
      traceId: 'trace-123',
      timestamp: '2024-01-15T10:30:00.000Z',
      operation: 'categorize_transaction',
      status: 'success',
      details: {
        request: {
          mcc: '5411',
          amount: 125.5,
        },
        response: {
          category: 'Grocery Stores',
          rewards: 1.5,
        },
        metadata: {
          processingTime: 45,
          cacheHit: false,
        },
      },
    };

    expect(auditLog.details).toBeDefined();
    expect(typeof auditLog.details).toBe('object');
  });

  it('should support error with details', () => {
    const auditLog: AuditLogEntry = {
      traceId: 'trace-123',
      timestamp: '2024-01-15T10:30:00.000Z',
      operation: 'categorize_transaction',
      status: 'failure',
      details: {
        attemptNumber: 3,
        lastError: 'Connection timeout',
      },
      error: 'Max retries exceeded',
    };

    expect(auditLog.status).toBe('failure');
    expect(auditLog.error).toBe('Max retries exceeded');
    expect(auditLog.details?.attemptNumber).toBe(3);
  });

  it('should handle empty details object', () => {
    const auditLog: AuditLogEntry = {
      traceId: 'trace-123',
      timestamp: '2024-01-15T10:30:00.000Z',
      operation: 'test',
      status: 'success',
      details: {},
    };

    expect(auditLog.details).toBeDefined();
    expect(Object.keys(auditLog.details!)).toHaveLength(0);
  });
});
