import {
  CustomerStatus,
  UserRole,
  AccountDTO,
  CustomerDTO,
  UpdateCustomerRequestDTO,
  UpdateCustomerResponseDTO,
  ErrorResponseDTO,
  HealthCheckResponseDTO,
  UserContext,
} from '../../../types/dtos';

describe('DTOs and Enums', () => {
  describe('CustomerStatus enum', () => {
    it('should have ACTIVE status', () => {
      expect(CustomerStatus.ACTIVE).toBe('active');
    });

    it('should have INACTIVE status', () => {
      expect(CustomerStatus.INACTIVE).toBe('inactive');
    });

    it('should have SUSPENDED status', () => {
      expect(CustomerStatus.SUSPENDED).toBe('suspended');
    });

    it('should have exactly 3 values', () => {
      const values = Object.values(CustomerStatus);
      expect(values).toHaveLength(3);
    });
  });

  describe('UserRole enum', () => {
    it('should have ADMIN role', () => {
      expect(UserRole.ADMIN).toBe('ADMIN');
    });

    it('should have CSR role', () => {
      expect(UserRole.CSR).toBe('CSR');
    });

    it('should have CUSTOMER role', () => {
      expect(UserRole.CUSTOMER).toBe('CUSTOMER');
    });

    it('should have exactly 3 roles', () => {
      const values = Object.values(UserRole);
      expect(values).toHaveLength(3);
    });
  });

  describe('AccountDTO', () => {
    it('should create valid account DTO', () => {
      const account: AccountDTO = {
        accountId: '12345678901',
        status: 'active',
        balance: 1000.50,
      };

      expect(account.accountId).toBe('12345678901');
      expect(account.status).toBe('active');
      expect(account.balance).toBe(1000.50);
    });

    it('should handle zero balance', () => {
      const account: AccountDTO = {
        accountId: '12345678901',
        status: 'active',
        balance: 0,
      };

      expect(account.balance).toBe(0);
    });

    it('should handle negative balance', () => {
      const account: AccountDTO = {
        accountId: '12345678901',
        status: 'overdrawn',
        balance: -50.25,
      };

      expect(account.balance).toBe(-50.25);
    });
  });

  describe('CustomerDTO', () => {
    it('should create valid customer DTO with required fields', () => {
      const customer: CustomerDTO = {
        customerId: '123456789',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1985-06-15',
        ssn: '***-**-6789',
        governmentId: '***45678',
        addressLine1: '123 Main St',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        phone1: '312-555-0123',
        eftAccountId: 'EFT123456',
        isPrimaryCardholder: true,
        status: CustomerStatus.ACTIVE,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T14:22:00Z',
      };

      expect(customer.customerId).toBe('123456789');
      expect(customer.firstName).toBe('John');
      expect(customer.status).toBe(CustomerStatus.ACTIVE);
    });

    it('should create customer DTO with optional fields', () => {
      const customer: CustomerDTO = {
        customerId: '123456789',
        firstName: 'John',
        middleName: 'Michael',
        lastName: 'Doe',
        dateOfBirth: '1985-06-15',
        ssn: '123-45-6789',
        governmentId: 'DL12345678',
        addressLine1: '123 Main St',
        addressLine2: 'Apt 4B',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        phone1: '312-555-0123',
        phone2: '312-555-0456',
        eftAccountId: 'EFT123456',
        isPrimaryCardholder: true,
        ficoScore: 720,
        status: CustomerStatus.ACTIVE,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T14:22:00Z',
        accounts: [
          {
            accountId: '12345678901',
            status: 'active',
            balance: 2450.75,
          },
        ],
      };

      expect(customer.middleName).toBe('Michael');
      expect(customer.addressLine2).toBe('Apt 4B');
      expect(customer.phone2).toBe('312-555-0456');
      expect(customer.ficoScore).toBe(720);
      expect(customer.accounts).toHaveLength(1);
    });

    it('should allow undefined optional fields', () => {
      const customer: CustomerDTO = {
        customerId: '123456789',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1985-06-15',
        ssn: '***-**-6789',
        governmentId: '***45678',
        addressLine1: '123 Main St',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        phone1: '312-555-0123',
        eftAccountId: 'EFT123456',
        isPrimaryCardholder: true,
        status: CustomerStatus.ACTIVE,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T14:22:00Z',
      };

      expect(customer.middleName).toBeUndefined();
      expect(customer.addressLine2).toBeUndefined();
      expect(customer.phone2).toBeUndefined();
      expect(customer.ficoScore).toBeUndefined();
      expect(customer.accounts).toBeUndefined();
    });
  });

  describe('UpdateCustomerRequestDTO', () => {
    it('should create empty update request', () => {
      const update: UpdateCustomerRequestDTO = {};
      expect(Object.keys(update)).toHaveLength(0);
    });

    it('should create update request with all fields', () => {
      const update: UpdateCustomerRequestDTO = {
        addressLine1: '456 Oak Ave',
        addressLine2: 'Suite 200',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60602',
        phone1: '312-555-9999',
        phone2: '312-555-8888',
      };

      expect(update.addressLine1).toBe('456 Oak Ave');
      expect(update.state).toBe('IL');
      expect(update.zipCode).toBe('60602');
    });

    it('should create update request with partial fields', () => {
      const update: UpdateCustomerRequestDTO = {
        phone1: '312-555-9999',
      };

      expect(update.phone1).toBe('312-555-9999');
      expect(update.addressLine1).toBeUndefined();
    });
  });

  describe('UpdateCustomerResponseDTO', () => {
    it('should create valid update response', () => {
      const response: UpdateCustomerResponseDTO = {
        customerId: '123456789',
        updatedFields: ['addressLine1', 'zipCode', 'phone1'],
        updatedAt: '2024-01-21T09:15:00Z',
        updatedBy: 'CSR00123',
      };

      expect(response.customerId).toBe('123456789');
      expect(response.updatedFields).toHaveLength(3);
      expect(response.updatedFields).toContain('addressLine1');
      expect(response.updatedBy).toBe('CSR00123');
    });

    it('should handle empty updated fields array', () => {
      const response: UpdateCustomerResponseDTO = {
        customerId: '123456789',
        updatedFields: [],
        updatedAt: '2024-01-21T09:15:00Z',
        updatedBy: 'CSR00123',
      };

      expect(response.updatedFields).toHaveLength(0);
    });
  });

  describe('ErrorResponseDTO', () => {
    it('should create error response with required fields', () => {
      const error: ErrorResponseDTO = {
        errorCode: 'VALIDATION_ERROR',
        message: 'Invalid input',
        timestamp: '2024-01-21T10:30:00Z',
      };

      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
      expect(error.timestamp).toBe('2024-01-21T10:30:00Z');
    });

    it('should create error response with optional fields', () => {
      const error: ErrorResponseDTO = {
        errorCode: 'VALIDATION_ERROR',
        message: 'Invalid input',
        timestamp: '2024-01-21T10:30:00Z',
        traceId: 'trace-123',
        details: {
          field1: 'Error message 1',
          field2: 'Error message 2',
        },
      };

      expect(error.traceId).toBe('trace-123');
      expect(error.details).toBeDefined();
      expect(error.details?.field1).toBe('Error message 1');
    });

    it('should allow undefined optional fields', () => {
      const error: ErrorResponseDTO = {
        errorCode: 'INTERNAL_SERVER_ERROR',
        message: 'Unexpected error',
        timestamp: '2024-01-21T10:30:00Z',
      };

      expect(error.traceId).toBeUndefined();
      expect(error.details).toBeUndefined();
    });
  });

  describe('HealthCheckResponseDTO', () => {
    it('should create health check response', () => {
      const health: HealthCheckResponseDTO = {
        status: 'UP',
        timestamp: '2024-01-21T10:30:00Z',
        service: 'customer-profile-service',
        version: '1.0.0',
        dependencies: {
          database: 'UP',
          redis: 'UP',
        },
      };

      expect(health.status).toBe('UP');
      expect(health.service).toBe('customer-profile-service');
      expect(health.dependencies.database).toBe('UP');
      expect(health.dependencies.redis).toBe('UP');
    });

    it('should create health check with DOWN status', () => {
      const health: HealthCheckResponseDTO = {
        status: 'DOWN',
        timestamp: '2024-01-21T10:30:00Z',
        service: 'customer-profile-service',
        version: '1.0.0',
        dependencies: {
          database: 'DOWN',
          redis: 'UP',
        },
      };

      expect(health.status).toBe('DOWN');
      expect(health.dependencies.database).toBe('DOWN');
    });
  });

  describe('UserContext', () => {
    it('should create user context for ADMIN', () => {
      const context: UserContext = {
        userId: 'ADMIN001',
        role: UserRole.ADMIN,
        ipAddress: '192.168.1.1',
        traceId: 'trace-123',
      };

      expect(context.userId).toBe('ADMIN001');
      expect(context.role).toBe(UserRole.ADMIN);
      expect(context.customerId).toBeUndefined();
    });

    it('should create user context for CUSTOMER with customerId', () => {
      const context: UserContext = {
        userId: '123456789',
        role: UserRole.CUSTOMER,
        customerId: '123456789',
        ipAddress: '192.168.1.1',
        traceId: 'trace-123',
      };

      expect(context.userId).toBe('123456789');
      expect(context.role).toBe(UserRole.CUSTOMER);
      expect(context.customerId).toBe('123456789');
    });

    it('should create user context for CSR', () => {
      const context: UserContext = {
        userId: 'CSR00123',
        role: UserRole.CSR,
        ipAddress: '10.0.0.5',
        traceId: 'trace-456',
      };

      expect(context.userId).toBe('CSR00123');
      expect(context.role).toBe(UserRole.CSR);
      expect(context.ipAddress).toBe('10.0.0.5');
    });
  });
});
