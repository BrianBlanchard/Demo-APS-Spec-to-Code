import { CustomerService } from '../../src/services/customer.service';
import { ICustomerRepository } from '../../src/repositories/customer.repository';
import { IAuditService, AuditLogEntry } from '../../src/services/audit.service';
import {
  CreateCustomerRequest,
  Customer,
  CustomerStatus,
  VerificationStatus,
} from '../../src/types/customer.types';
import { ConflictError, UnprocessableEntityError } from '../../src/types/error.types';

// Mock dependencies
jest.mock('../../src/utils/validation.util', () => {
  const actual = jest.requireActual('../../src/utils/validation.util');
  return {
    ...actual,
    generateCustomerId: jest.fn(() => '123456789'),
  };
});

jest.mock('../../src/utils/encryption.util', () => ({
  encrypt: jest.fn((text: string) => `encrypted_${text}`),
}));

jest.mock('../../src/config/logger.config', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('CustomerService', () => {
  let customerService: CustomerService;
  let mockCustomerRepository: jest.Mocked<ICustomerRepository>;
  let mockAuditService: jest.Mocked<IAuditService>;
  let auditLogs: AuditLogEntry[];

  const validRequest: CreateCustomerRequest = {
    firstName: 'John',
    middleName: 'Michael',
    lastName: 'Doe',
    dateOfBirth: '1990-01-15',
    ssn: '123-45-6789',
    governmentId: 'DL12345678',
    addressLine1: '123 Main St',
    addressLine2: 'Apt 4B',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    country: 'USA',
    phone1: '312-555-1234',
    phone2: '312-555-5678',
    eftAccountId: 'EFT123456',
    isPrimaryCardholder: true,
    ficoScore: 750,
  };

  const userId = 'user-123';

  beforeEach(() => {
    // Reset audit logs
    auditLogs = [];

    // Create mock repository
    mockCustomerRepository = {
      create: jest.fn(),
      findBySSN: jest.fn(),
      findByGovernmentId: jest.fn(),
      findById: jest.fn(),
    };

    // Create mock audit service
    mockAuditService = {
      log: jest.fn((entry: AuditLogEntry) => {
        auditLogs.push(entry);
      }),
    };

    customerService = new CustomerService(mockCustomerRepository, mockAuditService);
  });

  describe('createCustomer - Success Cases', () => {
    it('should create a customer with all required fields', async () => {
      const savedCustomer: Customer = {
        customerId: '123456789',
        firstName: validRequest.firstName,
        middleName: validRequest.middleName,
        lastName: validRequest.lastName,
        dateOfBirth: new Date(validRequest.dateOfBirth),
        ssn: `encrypted_${validRequest.ssn}`,
        governmentId: `encrypted_${validRequest.governmentId}`,
        addressLine1: validRequest.addressLine1,
        addressLine2: validRequest.addressLine2,
        city: validRequest.city,
        state: validRequest.state,
        zipCode: validRequest.zipCode,
        country: validRequest.country,
        phone1: validRequest.phone1,
        phone2: validRequest.phone2,
        eftAccountId: validRequest.eftAccountId,
        isPrimaryCardholder: validRequest.isPrimaryCardholder,
        ficoScore: validRequest.ficoScore,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 10000,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockResolvedValue(null);
      mockCustomerRepository.create.mockResolvedValue(savedCustomer);

      const result = await customerService.createCustomer(validRequest, userId);

      expect(result).toEqual({
        customerId: '123456789',
        status: CustomerStatus.ACTIVE,
        createdAt: savedCustomer.createdAt.toISOString(),
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 10000,
      });

      expect(mockCustomerRepository.findBySSN).toHaveBeenCalledWith(`encrypted_${validRequest.ssn}`);
      expect(mockCustomerRepository.findByGovernmentId).toHaveBeenCalledWith(
        `encrypted_${validRequest.governmentId}`
      );
      expect(mockCustomerRepository.create).toHaveBeenCalled();

      // Verify audit log for success
      expect(auditLogs).toHaveLength(1);
      expect(auditLogs[0]).toMatchObject({
        action: 'CREATE_CUSTOMER',
        userId,
        customerId: '123456789',
        status: 'success',
        details: {
          ficoScore: 750,
          creditLimit: 10000,
          verificationStatus: VerificationStatus.PENDING,
        },
      });
    });

    it('should create a customer without optional fields', async () => {
      const minimalRequest: CreateCustomerRequest = {
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: '1985-06-20',
        ssn: '234-56-7890',
        governmentId: 'DL98765432',
        addressLine1: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA',
        phone1: '213-555-9999',
        isPrimaryCardholder: false,
        ficoScore: 680,
      };

      const savedCustomer: Customer = {
        customerId: '123456789',
        firstName: minimalRequest.firstName,
        lastName: minimalRequest.lastName,
        dateOfBirth: new Date(minimalRequest.dateOfBirth),
        ssn: `encrypted_${minimalRequest.ssn}`,
        governmentId: `encrypted_${minimalRequest.governmentId}`,
        addressLine1: minimalRequest.addressLine1,
        city: minimalRequest.city,
        state: minimalRequest.state,
        zipCode: minimalRequest.zipCode,
        country: minimalRequest.country,
        phone1: minimalRequest.phone1,
        isPrimaryCardholder: minimalRequest.isPrimaryCardholder,
        ficoScore: minimalRequest.ficoScore,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 5000,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockResolvedValue(null);
      mockCustomerRepository.create.mockResolvedValue(savedCustomer);

      const result = await customerService.createCustomer(minimalRequest, userId);

      expect(result.customerId).toBe('123456789');
      expect(result.creditLimit).toBe(5000);
    });

    it('should calculate correct credit limit for FICO >= 800', async () => {
      const highFicoRequest = { ...validRequest, ficoScore: 820 };

      const savedCustomer: Customer = {
        customerId: '123456789',
        firstName: highFicoRequest.firstName,
        lastName: highFicoRequest.lastName,
        dateOfBirth: new Date(highFicoRequest.dateOfBirth),
        ssn: `encrypted_${highFicoRequest.ssn}`,
        governmentId: `encrypted_${highFicoRequest.governmentId}`,
        addressLine1: highFicoRequest.addressLine1,
        city: highFicoRequest.city,
        state: highFicoRequest.state,
        zipCode: highFicoRequest.zipCode,
        country: highFicoRequest.country,
        phone1: highFicoRequest.phone1,
        isPrimaryCardholder: highFicoRequest.isPrimaryCardholder,
        ficoScore: highFicoRequest.ficoScore,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 15000,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockResolvedValue(null);
      mockCustomerRepository.create.mockResolvedValue(savedCustomer);

      const result = await customerService.createCustomer(highFicoRequest, userId);

      expect(result.creditLimit).toBe(15000);
    });

    it('should calculate correct credit limit for FICO 740-799', async () => {
      const goodFicoRequest = { ...validRequest, ficoScore: 750 };

      const savedCustomer: Customer = {
        customerId: '123456789',
        firstName: goodFicoRequest.firstName,
        lastName: goodFicoRequest.lastName,
        dateOfBirth: new Date(goodFicoRequest.dateOfBirth),
        ssn: `encrypted_${goodFicoRequest.ssn}`,
        governmentId: `encrypted_${goodFicoRequest.governmentId}`,
        addressLine1: goodFicoRequest.addressLine1,
        city: goodFicoRequest.city,
        state: goodFicoRequest.state,
        zipCode: goodFicoRequest.zipCode,
        country: goodFicoRequest.country,
        phone1: goodFicoRequest.phone1,
        isPrimaryCardholder: goodFicoRequest.isPrimaryCardholder,
        ficoScore: goodFicoRequest.ficoScore,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 10000,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockResolvedValue(null);
      mockCustomerRepository.create.mockResolvedValue(savedCustomer);

      const result = await customerService.createCustomer(goodFicoRequest, userId);

      expect(result.creditLimit).toBe(10000);
    });

    it('should calculate correct credit limit for FICO 670-739', async () => {
      const fairFicoRequest = { ...validRequest, ficoScore: 700 };

      const savedCustomer: Customer = {
        customerId: '123456789',
        firstName: fairFicoRequest.firstName,
        lastName: fairFicoRequest.lastName,
        dateOfBirth: new Date(fairFicoRequest.dateOfBirth),
        ssn: `encrypted_${fairFicoRequest.ssn}`,
        governmentId: `encrypted_${fairFicoRequest.governmentId}`,
        addressLine1: fairFicoRequest.addressLine1,
        city: fairFicoRequest.city,
        state: fairFicoRequest.state,
        zipCode: fairFicoRequest.zipCode,
        country: fairFicoRequest.country,
        phone1: fairFicoRequest.phone1,
        isPrimaryCardholder: fairFicoRequest.isPrimaryCardholder,
        ficoScore: fairFicoRequest.ficoScore,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 5000,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockResolvedValue(null);
      mockCustomerRepository.create.mockResolvedValue(savedCustomer);

      const result = await customerService.createCustomer(fairFicoRequest, userId);

      expect(result.creditLimit).toBe(5000);
    });

    it('should calculate correct credit limit for FICO 580-669', async () => {
      const poorFicoRequest = { ...validRequest, ficoScore: 600 };

      const savedCustomer: Customer = {
        customerId: '123456789',
        firstName: poorFicoRequest.firstName,
        lastName: poorFicoRequest.lastName,
        dateOfBirth: new Date(poorFicoRequest.dateOfBirth),
        ssn: `encrypted_${poorFicoRequest.ssn}`,
        governmentId: `encrypted_${poorFicoRequest.governmentId}`,
        addressLine1: poorFicoRequest.addressLine1,
        city: poorFicoRequest.city,
        state: poorFicoRequest.state,
        zipCode: poorFicoRequest.zipCode,
        country: poorFicoRequest.country,
        phone1: poorFicoRequest.phone1,
        isPrimaryCardholder: poorFicoRequest.isPrimaryCardholder,
        ficoScore: poorFicoRequest.ficoScore,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 2000,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockResolvedValue(null);
      mockCustomerRepository.create.mockResolvedValue(savedCustomer);

      const result = await customerService.createCustomer(poorFicoRequest, userId);

      expect(result.creditLimit).toBe(2000);
    });

    it('should calculate correct credit limit for FICO < 580', async () => {
      const veryPoorFicoRequest = { ...validRequest, ficoScore: 500 };

      const savedCustomer: Customer = {
        customerId: '123456789',
        firstName: veryPoorFicoRequest.firstName,
        lastName: veryPoorFicoRequest.lastName,
        dateOfBirth: new Date(veryPoorFicoRequest.dateOfBirth),
        ssn: `encrypted_${veryPoorFicoRequest.ssn}`,
        governmentId: `encrypted_${veryPoorFicoRequest.governmentId}`,
        addressLine1: veryPoorFicoRequest.addressLine1,
        city: veryPoorFicoRequest.city,
        state: veryPoorFicoRequest.state,
        zipCode: veryPoorFicoRequest.zipCode,
        country: veryPoorFicoRequest.country,
        phone1: veryPoorFicoRequest.phone1,
        isPrimaryCardholder: veryPoorFicoRequest.isPrimaryCardholder,
        ficoScore: veryPoorFicoRequest.ficoScore,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 1000,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockResolvedValue(null);
      mockCustomerRepository.create.mockResolvedValue(savedCustomer);

      const result = await customerService.createCustomer(veryPoorFicoRequest, userId);

      expect(result.creditLimit).toBe(1000);
    });
  });

  describe('createCustomer - Name Validation', () => {
    it('should reject firstName with numbers', async () => {
      const invalidRequest = { ...validRequest, firstName: 'John123' };

      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        UnprocessableEntityError
      );
      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        'firstName must contain only alphabetic characters and spaces'
      );
    });

    it('should reject firstName with special characters', async () => {
      const invalidRequest = { ...validRequest, firstName: 'John@Doe' };

      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        UnprocessableEntityError
      );
    });

    it('should reject lastName with numbers', async () => {
      const invalidRequest = { ...validRequest, lastName: 'Smith123' };

      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        UnprocessableEntityError
      );
      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        'lastName must contain only alphabetic characters and spaces'
      );
    });

    it('should reject lastName with special characters', async () => {
      const invalidRequest = { ...validRequest, lastName: 'Smith#' };

      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        UnprocessableEntityError
      );
    });

    it('should reject middleName with numbers', async () => {
      const invalidRequest = { ...validRequest, middleName: 'Michael123' };

      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        UnprocessableEntityError
      );
      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        'middleName must contain only alphabetic characters and spaces'
      );
    });

    it('should accept names with spaces', async () => {
      const requestWithSpaces = { ...validRequest, firstName: 'Mary Ann', lastName: 'Van Buren' };

      const savedCustomer: Customer = {
        customerId: '123456789',
        firstName: requestWithSpaces.firstName,
        lastName: requestWithSpaces.lastName,
        dateOfBirth: new Date(requestWithSpaces.dateOfBirth),
        ssn: `encrypted_${requestWithSpaces.ssn}`,
        governmentId: `encrypted_${requestWithSpaces.governmentId}`,
        addressLine1: requestWithSpaces.addressLine1,
        city: requestWithSpaces.city,
        state: requestWithSpaces.state,
        zipCode: requestWithSpaces.zipCode,
        country: requestWithSpaces.country,
        phone1: requestWithSpaces.phone1,
        isPrimaryCardholder: requestWithSpaces.isPrimaryCardholder,
        ficoScore: requestWithSpaces.ficoScore,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 10000,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockResolvedValue(null);
      mockCustomerRepository.create.mockResolvedValue(savedCustomer);

      const result = await customerService.createCustomer(requestWithSpaces, userId);

      expect(result.customerId).toBe('123456789');
    });
  });

  describe('createCustomer - SSN Validation', () => {
    it('should reject SSN with less than 9 digits', async () => {
      const invalidRequest = { ...validRequest, ssn: '123-45-678' };

      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        UnprocessableEntityError
      );
      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        'SSN must be 9 digits'
      );
    });

    it('should reject SSN with more than 9 digits', async () => {
      const invalidRequest = { ...validRequest, ssn: '123-45-67890' };

      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        UnprocessableEntityError
      );
    });

    it('should reject SSN starting with 000', async () => {
      const invalidRequest = { ...validRequest, ssn: '000-45-6789' };

      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        UnprocessableEntityError
      );
      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        'SSN first part cannot be 000, 666, or 900-999'
      );
    });

    it('should reject SSN starting with 666', async () => {
      const invalidRequest = { ...validRequest, ssn: '666-45-6789' };

      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        UnprocessableEntityError
      );
    });

    it('should reject SSN starting with 900-999', async () => {
      const invalidRequest = { ...validRequest, ssn: '900-45-6789' };

      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        UnprocessableEntityError
      );

      const invalidRequest2 = { ...validRequest, ssn: '999-45-6789' };
      await expect(customerService.createCustomer(invalidRequest2, userId)).rejects.toThrow(
        UnprocessableEntityError
      );
    });

    it('should accept SSN without dashes', async () => {
      const requestWithoutDashes = { ...validRequest, ssn: '123456789' };

      const savedCustomer: Customer = {
        customerId: '123456789',
        firstName: requestWithoutDashes.firstName,
        lastName: requestWithoutDashes.lastName,
        dateOfBirth: new Date(requestWithoutDashes.dateOfBirth),
        ssn: `encrypted_${requestWithoutDashes.ssn}`,
        governmentId: `encrypted_${requestWithoutDashes.governmentId}`,
        addressLine1: requestWithoutDashes.addressLine1,
        city: requestWithoutDashes.city,
        state: requestWithoutDashes.state,
        zipCode: requestWithoutDashes.zipCode,
        country: requestWithoutDashes.country,
        phone1: requestWithoutDashes.phone1,
        isPrimaryCardholder: requestWithoutDashes.isPrimaryCardholder,
        ficoScore: requestWithoutDashes.ficoScore,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 10000,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockResolvedValue(null);
      mockCustomerRepository.create.mockResolvedValue(savedCustomer);

      const result = await customerService.createCustomer(requestWithoutDashes, userId);

      expect(result.customerId).toBe('123456789');
    });
  });

  describe('createCustomer - Phone Validation', () => {
    it('should reject phone1 with invalid area code (starts with 0)', async () => {
      const invalidRequest = { ...validRequest, phone1: '012-555-1234' };

      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        UnprocessableEntityError
      );
      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        'Invalid phone area code'
      );
    });

    it('should reject phone1 with invalid area code (starts with 1)', async () => {
      const invalidRequest = { ...validRequest, phone1: '112-555-1234' };

      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        UnprocessableEntityError
      );
    });

    it('should reject phone2 with invalid area code', async () => {
      const invalidRequest = { ...validRequest, phone2: '012-555-5678' };

      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        UnprocessableEntityError
      );
    });

    it('should accept valid area codes (200-999)', async () => {
      const validPhoneRequest = { ...validRequest, phone1: '312-555-1234', phone2: '773-555-5678' };

      const savedCustomer: Customer = {
        customerId: '123456789',
        firstName: validPhoneRequest.firstName,
        lastName: validPhoneRequest.lastName,
        dateOfBirth: new Date(validPhoneRequest.dateOfBirth),
        ssn: `encrypted_${validPhoneRequest.ssn}`,
        governmentId: `encrypted_${validPhoneRequest.governmentId}`,
        addressLine1: validPhoneRequest.addressLine1,
        city: validPhoneRequest.city,
        state: validPhoneRequest.state,
        zipCode: validPhoneRequest.zipCode,
        country: validPhoneRequest.country,
        phone1: validPhoneRequest.phone1,
        phone2: validPhoneRequest.phone2,
        isPrimaryCardholder: validPhoneRequest.isPrimaryCardholder,
        ficoScore: validPhoneRequest.ficoScore,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 10000,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockResolvedValue(null);
      mockCustomerRepository.create.mockResolvedValue(savedCustomer);

      const result = await customerService.createCustomer(validPhoneRequest, userId);

      expect(result.customerId).toBe('123456789');
    });
  });

  describe('createCustomer - State/ZIP Code Validation', () => {
    it('should reject IL state with non-IL ZIP code', async () => {
      const invalidRequest = { ...validRequest, state: 'IL', zipCode: '90001' };

      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        UnprocessableEntityError
      );
      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        'State code must match ZIP code region'
      );
    });

    it('should reject CA state with non-CA ZIP code', async () => {
      const invalidRequest = { ...validRequest, state: 'CA', zipCode: '60601' };

      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        UnprocessableEntityError
      );
    });

    it('should reject NY state with non-NY ZIP code', async () => {
      const invalidRequest = { ...validRequest, state: 'NY', zipCode: '90001' };

      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        UnprocessableEntityError
      );
    });

    it('should reject TX state with non-TX ZIP code', async () => {
      const invalidRequest = { ...validRequest, state: 'TX', zipCode: '60601' };

      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        UnprocessableEntityError
      );
    });

    it('should accept IL state with valid IL ZIP codes', async () => {
      const validZipCodes = ['60601', '61000', '62999'];

      for (const zipCode of validZipCodes) {
        const validZipRequest = { ...validRequest, state: 'IL', zipCode };

        const savedCustomer: Customer = {
          customerId: '123456789',
          firstName: validZipRequest.firstName,
          lastName: validZipRequest.lastName,
          dateOfBirth: new Date(validZipRequest.dateOfBirth),
          ssn: `encrypted_${validZipRequest.ssn}`,
          governmentId: `encrypted_${validZipRequest.governmentId}`,
          addressLine1: validZipRequest.addressLine1,
          city: validZipRequest.city,
          state: validZipRequest.state,
          zipCode: validZipRequest.zipCode,
          country: validZipRequest.country,
          phone1: validZipRequest.phone1,
          isPrimaryCardholder: validZipRequest.isPrimaryCardholder,
          ficoScore: validZipRequest.ficoScore,
          status: CustomerStatus.ACTIVE,
          verificationStatus: VerificationStatus.PENDING,
          creditLimit: 10000,
          createdAt: new Date(),
          createdBy: userId,
          updatedAt: new Date(),
          updatedBy: userId,
        };

        mockCustomerRepository.findBySSN.mockResolvedValue(null);
        mockCustomerRepository.findByGovernmentId.mockResolvedValue(null);
        mockCustomerRepository.create.mockResolvedValue(savedCustomer);

        const result = await customerService.createCustomer(validZipRequest, userId);
        expect(result.customerId).toBe('123456789');
      }
    });

    it('should accept CA state with valid CA ZIP codes', async () => {
      const validZipCodes = ['90001', '91000', '92000', '93000', '94000', '95000', '96000'];

      for (const zipCode of validZipCodes) {
        const validZipRequest = { ...validRequest, state: 'CA', zipCode };

        const savedCustomer: Customer = {
          customerId: '123456789',
          firstName: validZipRequest.firstName,
          lastName: validZipRequest.lastName,
          dateOfBirth: new Date(validZipRequest.dateOfBirth),
          ssn: `encrypted_${validZipRequest.ssn}`,
          governmentId: `encrypted_${validZipRequest.governmentId}`,
          addressLine1: validZipRequest.addressLine1,
          city: validZipRequest.city,
          state: validZipRequest.state,
          zipCode: validZipRequest.zipCode,
          country: validZipRequest.country,
          phone1: validZipRequest.phone1,
          isPrimaryCardholder: validZipRequest.isPrimaryCardholder,
          ficoScore: validZipRequest.ficoScore,
          status: CustomerStatus.ACTIVE,
          verificationStatus: VerificationStatus.PENDING,
          creditLimit: 10000,
          createdAt: new Date(),
          createdBy: userId,
          updatedAt: new Date(),
          updatedBy: userId,
        };

        mockCustomerRepository.findBySSN.mockResolvedValue(null);
        mockCustomerRepository.findByGovernmentId.mockResolvedValue(null);
        mockCustomerRepository.create.mockResolvedValue(savedCustomer);

        const result = await customerService.createCustomer(validZipRequest, userId);
        expect(result.customerId).toBe('123456789');
      }
    });

    it('should allow unmapped states with any ZIP code', async () => {
      const unmappedStateRequest = { ...validRequest, state: 'FL', zipCode: '33101' };

      const savedCustomer: Customer = {
        customerId: '123456789',
        firstName: unmappedStateRequest.firstName,
        lastName: unmappedStateRequest.lastName,
        dateOfBirth: new Date(unmappedStateRequest.dateOfBirth),
        ssn: `encrypted_${unmappedStateRequest.ssn}`,
        governmentId: `encrypted_${unmappedStateRequest.governmentId}`,
        addressLine1: unmappedStateRequest.addressLine1,
        city: unmappedStateRequest.city,
        state: unmappedStateRequest.state,
        zipCode: unmappedStateRequest.zipCode,
        country: unmappedStateRequest.country,
        phone1: unmappedStateRequest.phone1,
        isPrimaryCardholder: unmappedStateRequest.isPrimaryCardholder,
        ficoScore: unmappedStateRequest.ficoScore,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 10000,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockResolvedValue(null);
      mockCustomerRepository.create.mockResolvedValue(savedCustomer);

      const result = await customerService.createCustomer(unmappedStateRequest, userId);

      expect(result.customerId).toBe('123456789');
    });
  });

  describe('createCustomer - FICO Score Validation', () => {
    it('should reject FICO score below 300', async () => {
      const invalidRequest = { ...validRequest, ficoScore: 299 };

      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        UnprocessableEntityError
      );
      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        'FICO score must be between 300 and 850'
      );
    });

    it('should reject FICO score above 850', async () => {
      const invalidRequest = { ...validRequest, ficoScore: 851 };

      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        UnprocessableEntityError
      );
    });

    it('should accept FICO score at minimum (300)', async () => {
      const minFicoRequest = { ...validRequest, ficoScore: 300 };

      const savedCustomer: Customer = {
        customerId: '123456789',
        firstName: minFicoRequest.firstName,
        lastName: minFicoRequest.lastName,
        dateOfBirth: new Date(minFicoRequest.dateOfBirth),
        ssn: `encrypted_${minFicoRequest.ssn}`,
        governmentId: `encrypted_${minFicoRequest.governmentId}`,
        addressLine1: minFicoRequest.addressLine1,
        city: minFicoRequest.city,
        state: minFicoRequest.state,
        zipCode: minFicoRequest.zipCode,
        country: minFicoRequest.country,
        phone1: minFicoRequest.phone1,
        isPrimaryCardholder: minFicoRequest.isPrimaryCardholder,
        ficoScore: minFicoRequest.ficoScore,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 1000,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockResolvedValue(null);
      mockCustomerRepository.create.mockResolvedValue(savedCustomer);

      const result = await customerService.createCustomer(minFicoRequest, userId);

      expect(result.customerId).toBe('123456789');
      expect(result.creditLimit).toBe(1000);
    });

    it('should accept FICO score at maximum (850)', async () => {
      const maxFicoRequest = { ...validRequest, ficoScore: 850 };

      const savedCustomer: Customer = {
        customerId: '123456789',
        firstName: maxFicoRequest.firstName,
        lastName: maxFicoRequest.lastName,
        dateOfBirth: new Date(maxFicoRequest.dateOfBirth),
        ssn: `encrypted_${maxFicoRequest.ssn}`,
        governmentId: `encrypted_${maxFicoRequest.governmentId}`,
        addressLine1: maxFicoRequest.addressLine1,
        city: maxFicoRequest.city,
        state: maxFicoRequest.state,
        zipCode: maxFicoRequest.zipCode,
        country: maxFicoRequest.country,
        phone1: maxFicoRequest.phone1,
        isPrimaryCardholder: maxFicoRequest.isPrimaryCardholder,
        ficoScore: maxFicoRequest.ficoScore,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 15000,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockResolvedValue(null);
      mockCustomerRepository.create.mockResolvedValue(savedCustomer);

      const result = await customerService.createCustomer(maxFicoRequest, userId);

      expect(result.customerId).toBe('123456789');
      expect(result.creditLimit).toBe(15000);
    });
  });

  describe('createCustomer - Age Validation', () => {
    it('should reject customer under 18 years old', async () => {
      const today = new Date();
      const under18Date = new Date(
        today.getFullYear() - 17,
        today.getMonth(),
        today.getDate()
      ).toISOString();

      const invalidRequest = { ...validRequest, dateOfBirth: under18Date };

      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        UnprocessableEntityError
      );
      await expect(customerService.createCustomer(invalidRequest, userId)).rejects.toThrow(
        'Customer must be at least 18 years old'
      );
    });

    it('should accept customer exactly 18 years old', async () => {
      const today = new Date();
      const exactly18Date = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      ).toISOString();

      const validAgeRequest = { ...validRequest, dateOfBirth: exactly18Date };

      const savedCustomer: Customer = {
        customerId: '123456789',
        firstName: validAgeRequest.firstName,
        lastName: validAgeRequest.lastName,
        dateOfBirth: new Date(validAgeRequest.dateOfBirth),
        ssn: `encrypted_${validAgeRequest.ssn}`,
        governmentId: `encrypted_${validAgeRequest.governmentId}`,
        addressLine1: validAgeRequest.addressLine1,
        city: validAgeRequest.city,
        state: validAgeRequest.state,
        zipCode: validAgeRequest.zipCode,
        country: validAgeRequest.country,
        phone1: validAgeRequest.phone1,
        isPrimaryCardholder: validAgeRequest.isPrimaryCardholder,
        ficoScore: validAgeRequest.ficoScore,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 10000,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockResolvedValue(null);
      mockCustomerRepository.create.mockResolvedValue(savedCustomer);

      const result = await customerService.createCustomer(validAgeRequest, userId);

      expect(result.customerId).toBe('123456789');
    });

    it('should accept customer over 18 years old', async () => {
      const over18Request = { ...validRequest, dateOfBirth: '1990-01-15' };

      const savedCustomer: Customer = {
        customerId: '123456789',
        firstName: over18Request.firstName,
        lastName: over18Request.lastName,
        dateOfBirth: new Date(over18Request.dateOfBirth),
        ssn: `encrypted_${over18Request.ssn}`,
        governmentId: `encrypted_${over18Request.governmentId}`,
        addressLine1: over18Request.addressLine1,
        city: over18Request.city,
        state: over18Request.state,
        zipCode: over18Request.zipCode,
        country: over18Request.country,
        phone1: over18Request.phone1,
        isPrimaryCardholder: over18Request.isPrimaryCardholder,
        ficoScore: over18Request.ficoScore,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 10000,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockResolvedValue(null);
      mockCustomerRepository.create.mockResolvedValue(savedCustomer);

      const result = await customerService.createCustomer(over18Request, userId);

      expect(result.customerId).toBe('123456789');
    });
  });

  describe('createCustomer - Duplicate Detection', () => {
    it('should reject duplicate SSN and log audit entry', async () => {
      const existingCustomer: Customer = {
        customerId: '987654321',
        firstName: 'Jane',
        lastName: 'Doe',
        dateOfBirth: new Date('1985-05-20'),
        ssn: `encrypted_${validRequest.ssn}`,
        governmentId: 'encrypted_DL99999999',
        addressLine1: '456 Oak Ave',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        phone1: '312-555-9999',
        isPrimaryCardholder: true,
        ficoScore: 700,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.VERIFIED,
        creditLimit: 5000,
        createdAt: new Date(),
        createdBy: 'user-456',
        updatedAt: new Date(),
        updatedBy: 'user-456',
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(existingCustomer);

      try {
        await customerService.createCustomer(validRequest, userId);
        fail('Should have thrown ConflictError');
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictError);
        expect(error).toHaveProperty('message', 'Customer with this SSN already exists');
      }

      // Verify audit log for failure
      expect(auditLogs).toHaveLength(1);
      expect(auditLogs[0]).toMatchObject({
        action: 'CREATE_CUSTOMER',
        userId,
        status: 'failure',
        details: {
          reason: 'Duplicate SSN',
          customerId: '987654321',
        },
      });
    });

    it('should reject duplicate Government ID and log audit entry', async () => {
      const existingCustomer: Customer = {
        customerId: '987654321',
        firstName: 'Jane',
        lastName: 'Doe',
        dateOfBirth: new Date('1985-05-20'),
        ssn: 'encrypted_234567890',
        governmentId: `encrypted_${validRequest.governmentId}`,
        addressLine1: '456 Oak Ave',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        phone1: '312-555-9999',
        isPrimaryCardholder: true,
        ficoScore: 700,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.VERIFIED,
        creditLimit: 5000,
        createdAt: new Date(),
        createdBy: 'user-456',
        updatedAt: new Date(),
        updatedBy: 'user-456',
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockResolvedValue(existingCustomer);

      try {
        await customerService.createCustomer(validRequest, userId);
        fail('Should have thrown ConflictError');
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictError);
        expect(error).toHaveProperty('message', 'Customer with this Government ID already exists');
      }

      // Verify audit log for failure
      expect(auditLogs).toHaveLength(1);
      expect(auditLogs[0]).toMatchObject({
        action: 'CREATE_CUSTOMER',
        userId,
        status: 'failure',
        details: {
          reason: 'Duplicate Government ID',
          customerId: '987654321',
        },
      });
    });

    it('should include existing customer ID in ConflictError for SSN', async () => {
      const existingCustomer: Customer = {
        customerId: '987654321',
        firstName: 'Jane',
        lastName: 'Doe',
        dateOfBirth: new Date('1985-05-20'),
        ssn: `encrypted_${validRequest.ssn}`,
        governmentId: 'encrypted_DL99999999',
        addressLine1: '456 Oak Ave',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        phone1: '312-555-9999',
        isPrimaryCardholder: true,
        ficoScore: 700,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.VERIFIED,
        creditLimit: 5000,
        createdAt: new Date(),
        createdBy: 'user-456',
        updatedAt: new Date(),
        updatedBy: 'user-456',
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(existingCustomer);

      try {
        await customerService.createCustomer(validRequest, userId);
        fail('Should have thrown ConflictError');
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictError);
        if (error instanceof ConflictError) {
          expect(error.details).toEqual({ existingCustomerId: '987654321' });
        }
      }
    });

    it('should include existing customer ID in ConflictError for Government ID', async () => {
      const existingCustomer: Customer = {
        customerId: '987654321',
        firstName: 'Jane',
        lastName: 'Doe',
        dateOfBirth: new Date('1985-05-20'),
        ssn: 'encrypted_234567890',
        governmentId: `encrypted_${validRequest.governmentId}`,
        addressLine1: '456 Oak Ave',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        phone1: '312-555-9999',
        isPrimaryCardholder: true,
        ficoScore: 700,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.VERIFIED,
        creditLimit: 5000,
        createdAt: new Date(),
        createdBy: 'user-456',
        updatedAt: new Date(),
        updatedBy: 'user-456',
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockResolvedValue(existingCustomer);

      try {
        await customerService.createCustomer(validRequest, userId);
        fail('Should have thrown ConflictError');
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictError);
        if (error instanceof ConflictError) {
          expect(error.details).toEqual({ existingCustomerId: '987654321' });
        }
      }
    });
  });

  describe('createCustomer - Data Encryption', () => {
    it('should encrypt SSN before storing', async () => {
      const savedCustomer: Customer = {
        customerId: '123456789',
        firstName: validRequest.firstName,
        lastName: validRequest.lastName,
        dateOfBirth: new Date(validRequest.dateOfBirth),
        ssn: `encrypted_${validRequest.ssn}`,
        governmentId: `encrypted_${validRequest.governmentId}`,
        addressLine1: validRequest.addressLine1,
        city: validRequest.city,
        state: validRequest.state,
        zipCode: validRequest.zipCode,
        country: validRequest.country,
        phone1: validRequest.phone1,
        isPrimaryCardholder: validRequest.isPrimaryCardholder,
        ficoScore: validRequest.ficoScore,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 10000,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockResolvedValue(null);
      mockCustomerRepository.create.mockResolvedValue(savedCustomer);

      await customerService.createCustomer(validRequest, userId);

      const createCall = mockCustomerRepository.create.mock.calls[0][0];
      expect(createCall.ssn).toBe(`encrypted_${validRequest.ssn}`);
    });

    it('should encrypt Government ID before storing', async () => {
      const savedCustomer: Customer = {
        customerId: '123456789',
        firstName: validRequest.firstName,
        lastName: validRequest.lastName,
        dateOfBirth: new Date(validRequest.dateOfBirth),
        ssn: `encrypted_${validRequest.ssn}`,
        governmentId: `encrypted_${validRequest.governmentId}`,
        addressLine1: validRequest.addressLine1,
        city: validRequest.city,
        state: validRequest.state,
        zipCode: validRequest.zipCode,
        country: validRequest.country,
        phone1: validRequest.phone1,
        isPrimaryCardholder: validRequest.isPrimaryCardholder,
        ficoScore: validRequest.ficoScore,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 10000,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockResolvedValue(null);
      mockCustomerRepository.create.mockResolvedValue(savedCustomer);

      await customerService.createCustomer(validRequest, userId);

      const createCall = mockCustomerRepository.create.mock.calls[0][0];
      expect(createCall.governmentId).toBe(`encrypted_${validRequest.governmentId}`);
    });

    it('should use encrypted SSN when checking for duplicates', async () => {
      const savedCustomer: Customer = {
        customerId: '123456789',
        firstName: validRequest.firstName,
        lastName: validRequest.lastName,
        dateOfBirth: new Date(validRequest.dateOfBirth),
        ssn: `encrypted_${validRequest.ssn}`,
        governmentId: `encrypted_${validRequest.governmentId}`,
        addressLine1: validRequest.addressLine1,
        city: validRequest.city,
        state: validRequest.state,
        zipCode: validRequest.zipCode,
        country: validRequest.country,
        phone1: validRequest.phone1,
        isPrimaryCardholder: validRequest.isPrimaryCardholder,
        ficoScore: validRequest.ficoScore,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 10000,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockResolvedValue(null);
      mockCustomerRepository.create.mockResolvedValue(savedCustomer);

      await customerService.createCustomer(validRequest, userId);

      expect(mockCustomerRepository.findBySSN).toHaveBeenCalledWith(`encrypted_${validRequest.ssn}`);
    });

    it('should use encrypted Government ID when checking for duplicates', async () => {
      const savedCustomer: Customer = {
        customerId: '123456789',
        firstName: validRequest.firstName,
        lastName: validRequest.lastName,
        dateOfBirth: new Date(validRequest.dateOfBirth),
        ssn: `encrypted_${validRequest.ssn}`,
        governmentId: `encrypted_${validRequest.governmentId}`,
        addressLine1: validRequest.addressLine1,
        city: validRequest.city,
        state: validRequest.state,
        zipCode: validRequest.zipCode,
        country: validRequest.country,
        phone1: validRequest.phone1,
        isPrimaryCardholder: validRequest.isPrimaryCardholder,
        ficoScore: validRequest.ficoScore,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 10000,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockResolvedValue(null);
      mockCustomerRepository.create.mockResolvedValue(savedCustomer);

      await customerService.createCustomer(validRequest, userId);

      expect(mockCustomerRepository.findByGovernmentId).toHaveBeenCalledWith(
        `encrypted_${validRequest.governmentId}`
      );
    });
  });

  describe('createCustomer - Status and Verification', () => {
    it('should set status to ACTIVE for new customers', async () => {
      const savedCustomer: Customer = {
        customerId: '123456789',
        firstName: validRequest.firstName,
        lastName: validRequest.lastName,
        dateOfBirth: new Date(validRequest.dateOfBirth),
        ssn: `encrypted_${validRequest.ssn}`,
        governmentId: `encrypted_${validRequest.governmentId}`,
        addressLine1: validRequest.addressLine1,
        city: validRequest.city,
        state: validRequest.state,
        zipCode: validRequest.zipCode,
        country: validRequest.country,
        phone1: validRequest.phone1,
        isPrimaryCardholder: validRequest.isPrimaryCardholder,
        ficoScore: validRequest.ficoScore,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 10000,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockResolvedValue(null);
      mockCustomerRepository.create.mockResolvedValue(savedCustomer);

      await customerService.createCustomer(validRequest, userId);

      const createCall = mockCustomerRepository.create.mock.calls[0][0];
      expect(createCall.status).toBe(CustomerStatus.ACTIVE);
    });

    it('should set verification status to PENDING for new customers', async () => {
      const savedCustomer: Customer = {
        customerId: '123456789',
        firstName: validRequest.firstName,
        lastName: validRequest.lastName,
        dateOfBirth: new Date(validRequest.dateOfBirth),
        ssn: `encrypted_${validRequest.ssn}`,
        governmentId: `encrypted_${validRequest.governmentId}`,
        addressLine1: validRequest.addressLine1,
        city: validRequest.city,
        state: validRequest.state,
        zipCode: validRequest.zipCode,
        country: validRequest.country,
        phone1: validRequest.phone1,
        isPrimaryCardholder: validRequest.isPrimaryCardholder,
        ficoScore: validRequest.ficoScore,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 10000,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockResolvedValue(null);
      mockCustomerRepository.create.mockResolvedValue(savedCustomer);

      await customerService.createCustomer(validRequest, userId);

      const createCall = mockCustomerRepository.create.mock.calls[0][0];
      expect(createCall.verificationStatus).toBe(VerificationStatus.PENDING);
    });

    it('should set createdBy and updatedBy to userId', async () => {
      const savedCustomer: Customer = {
        customerId: '123456789',
        firstName: validRequest.firstName,
        lastName: validRequest.lastName,
        dateOfBirth: new Date(validRequest.dateOfBirth),
        ssn: `encrypted_${validRequest.ssn}`,
        governmentId: `encrypted_${validRequest.governmentId}`,
        addressLine1: validRequest.addressLine1,
        city: validRequest.city,
        state: validRequest.state,
        zipCode: validRequest.zipCode,
        country: validRequest.country,
        phone1: validRequest.phone1,
        isPrimaryCardholder: validRequest.isPrimaryCardholder,
        ficoScore: validRequest.ficoScore,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 10000,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockResolvedValue(null);
      mockCustomerRepository.create.mockResolvedValue(savedCustomer);

      await customerService.createCustomer(validRequest, userId);

      const createCall = mockCustomerRepository.create.mock.calls[0][0];
      expect(createCall.createdBy).toBe(userId);
      expect(createCall.updatedBy).toBe(userId);
    });
  });

  describe('createCustomer - Repository Error Handling', () => {
    it('should propagate repository errors', async () => {
      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockResolvedValue(null);
      mockCustomerRepository.create.mockRejectedValue(new Error('Database connection failed'));

      await expect(customerService.createCustomer(validRequest, userId)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle findBySSN errors', async () => {
      mockCustomerRepository.findBySSN.mockRejectedValue(new Error('Database query failed'));

      await expect(customerService.createCustomer(validRequest, userId)).rejects.toThrow(
        'Database query failed'
      );
    });

    it('should handle findByGovernmentId errors', async () => {
      mockCustomerRepository.findBySSN.mockResolvedValue(null);
      mockCustomerRepository.findByGovernmentId.mockRejectedValue(
        new Error('Database query failed')
      );

      await expect(customerService.createCustomer(validRequest, userId)).rejects.toThrow(
        'Database query failed'
      );
    });
  });
});
