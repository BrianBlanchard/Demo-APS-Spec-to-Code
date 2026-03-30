import {
  CustomerStatus,
  VerificationStatus,
  CreateCustomerRequest,
  CreateCustomerResponse,
  Customer,
} from '../../src/types/customer.types';

describe('Customer Types', () => {
  describe('CustomerStatus Enum', () => {
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

  describe('VerificationStatus Enum', () => {
    it('should have PENDING status', () => {
      expect(VerificationStatus.PENDING).toBe('pending');
    });

    it('should have VERIFIED status', () => {
      expect(VerificationStatus.VERIFIED).toBe('verified');
    });

    it('should have MANUAL_REVIEW_REQUIRED status', () => {
      expect(VerificationStatus.MANUAL_REVIEW_REQUIRED).toBe('manual_review_required');
    });

    it('should have exactly 3 values', () => {
      const values = Object.values(VerificationStatus);
      expect(values).toHaveLength(3);
    });
  });

  describe('CreateCustomerRequest Interface', () => {
    it('should accept valid request with all required fields', () => {
      const request: CreateCustomerRequest = {
        firstName: 'John',
        lastName: 'Anderson',
        dateOfBirth: '1985-06-15',
        ssn: '123-45-6789',
        governmentId: 'DL12345678',
        addressLine1: '123 Main Street',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        phone1: '312-555-0123',
        isPrimaryCardholder: true,
        ficoScore: 720,
      };

      expect(request).toBeDefined();
      expect(request.firstName).toBe('John');
      expect(request.isPrimaryCardholder).toBe(true);
    });

    it('should accept request with optional fields', () => {
      const request: CreateCustomerRequest = {
        firstName: 'John',
        middleName: 'Michael',
        lastName: 'Anderson',
        dateOfBirth: '1985-06-15',
        ssn: '123-45-6789',
        governmentId: 'DL12345678',
        addressLine1: '123 Main Street',
        addressLine2: 'Apt 4B',
        addressLine3: 'Building C',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        phone1: '312-555-0123',
        phone2: '312-555-0456',
        eftAccountId: 'EFT987654321',
        isPrimaryCardholder: true,
        ficoScore: 720,
      };

      expect(request.middleName).toBe('Michael');
      expect(request.addressLine2).toBe('Apt 4B');
      expect(request.phone2).toBe('312-555-0456');
    });
  });

  describe('CreateCustomerResponse Interface', () => {
    it('should accept valid response', () => {
      const response: CreateCustomerResponse = {
        customerId: '123456789',
        status: CustomerStatus.ACTIVE,
        createdAt: '2024-01-15T10:30:00Z',
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 5000,
      };

      expect(response).toBeDefined();
      expect(response.customerId).toBe('123456789');
      expect(response.status).toBe(CustomerStatus.ACTIVE);
      expect(response.verificationStatus).toBe(VerificationStatus.PENDING);
    });

    it('should accept different status combinations', () => {
      const response: CreateCustomerResponse = {
        customerId: '987654321',
        status: CustomerStatus.SUSPENDED,
        createdAt: '2024-01-15T10:30:00Z',
        verificationStatus: VerificationStatus.MANUAL_REVIEW_REQUIRED,
        creditLimit: 1000,
      };

      expect(response.status).toBe(CustomerStatus.SUSPENDED);
      expect(response.verificationStatus).toBe(VerificationStatus.MANUAL_REVIEW_REQUIRED);
    });
  });

  describe('Customer Interface', () => {
    it('should accept complete customer entity', () => {
      const customer: Customer = {
        customerId: '123456789',
        firstName: 'John',
        middleName: 'Michael',
        lastName: 'Anderson',
        dateOfBirth: new Date('1985-06-15'),
        ssn: 'encrypted-ssn',
        governmentId: 'encrypted-id',
        addressLine1: '123 Main Street',
        addressLine2: 'Apt 4B',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        phone1: '312-555-0123',
        phone2: '312-555-0456',
        eftAccountId: 'EFT987654321',
        isPrimaryCardholder: true,
        ficoScore: 720,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 5000,
        createdAt: new Date(),
        createdBy: 'USER123',
        updatedAt: new Date(),
        updatedBy: 'USER123',
      };

      expect(customer).toBeDefined();
      expect(customer.dateOfBirth).toBeInstanceOf(Date);
      expect(customer.createdAt).toBeInstanceOf(Date);
    });

    it('should accept customer without optional fields', () => {
      const customer: Customer = {
        customerId: '123456789',
        firstName: 'John',
        lastName: 'Anderson',
        dateOfBirth: new Date('1985-06-15'),
        ssn: 'encrypted-ssn',
        governmentId: 'encrypted-id',
        addressLine1: '123 Main Street',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        phone1: '312-555-0123',
        isPrimaryCardholder: true,
        ficoScore: 720,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 5000,
        createdAt: new Date(),
        createdBy: 'USER123',
        updatedAt: new Date(),
        updatedBy: 'USER123',
      };

      expect(customer.middleName).toBeUndefined();
      expect(customer.addressLine2).toBeUndefined();
      expect(customer.phone2).toBeUndefined();
    });
  });
});
