import { CustomerRepository } from '../../src/repositories/customer.repository';
import { Customer, CustomerStatus, VerificationStatus } from '../../src/types/customer.types';
import { newDb } from 'pg-mem';

describe('CustomerRepository', () => {
  let customerRepository: CustomerRepository;
  let db: any;

  beforeEach(async () => {
    // Create in-memory PostgreSQL database
    const mem = newDb();
    db = mem.adapters.createKnex();

    // Create customers table
    await db.schema.createTable('customers', (table: any) => {
      table.string('customer_id', 9).primary();
      table.string('first_name', 25).notNullable();
      table.string('middle_name', 25);
      table.string('last_name', 25).notNullable();
      table.date('date_of_birth').notNullable();
      table.string('ssn', 255).notNullable().unique();
      table.string('government_id', 255).notNullable().unique();
      table.string('address_line1', 50).notNullable();
      table.string('address_line2', 50);
      table.string('address_line3', 50);
      table.string('city', 50).notNullable();
      table.string('state', 2).notNullable();
      table.string('zip_code', 10).notNullable();
      table.string('country', 3).notNullable();
      table.string('phone1', 15).notNullable();
      table.string('phone2', 15);
      table.string('eft_account_id', 20);
      table.string('is_primary_cardholder', 1).notNullable();
      table.smallint('fico_score').notNullable();
      table.string('status', 20).notNullable();
      table.string('verification_status', 30).notNullable();
      table.float('credit_limit').notNullable();
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(db.fn.now());
      table.string('created_by', 8).notNullable();
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(db.fn.now());
      table.string('updated_by', 8).notNullable();
    });

    customerRepository = new CustomerRepository(db);
  });

  afterEach(async () => {
    await db.destroy();
  });

  describe('create', () => {
    it('should create customer with all required fields', async () => {
      const customer: Omit<Customer, 'createdAt' | 'updatedAt'> = {
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
        createdBy: 'USER123',
        updatedBy: 'USER123',
      };

      const result = await customerRepository.create(customer);

      expect(result).toBeDefined();
      expect(result.customerId).toBe('123456789');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Anderson');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should create customer with optional fields', async () => {
      const customer: Omit<Customer, 'createdAt' | 'updatedAt'> = {
        customerId: '987654321',
        firstName: 'Jane',
        middleName: 'Marie',
        lastName: 'Smith',
        dateOfBirth: new Date('1990-03-20'),
        ssn: 'encrypted-ssn-2',
        governmentId: 'encrypted-id-2',
        addressLine1: '456 Oak Avenue',
        addressLine2: 'Suite 100',
        addressLine3: 'Building B',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA',
        phone1: '310-555-0123',
        phone2: '310-555-0456',
        eftAccountId: 'EFT123456',
        isPrimaryCardholder: false,
        ficoScore: 800,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.VERIFIED,
        creditLimit: 15000,
        createdBy: 'ADMIN1',
        updatedBy: 'ADMIN1',
      };

      const result = await customerRepository.create(customer);

      expect(result.middleName).toBe('Marie');
      expect(result.addressLine2).toBe('Suite 100');
      expect(result.addressLine3).toBe('Building B');
      expect(result.phone2).toBe('310-555-0456');
      expect(result.eftAccountId).toBe('EFT123456');
    });

    it('should store isPrimaryCardholder as Y or N', async () => {
      const customerTrue: Omit<Customer, 'createdAt' | 'updatedAt'> = {
        customerId: '111111111',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: new Date('1985-01-01'),
        ssn: 'encrypted-ssn-3',
        governmentId: 'encrypted-id-3',
        addressLine1: 'Address',
        city: 'City',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        phone1: '312-555-0001',
        isPrimaryCardholder: true,
        ficoScore: 720,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 5000,
        createdBy: 'USER1',
        updatedBy: 'USER1',
      };

      const resultTrue = await customerRepository.create(customerTrue);
      expect(resultTrue.isPrimaryCardholder).toBe(true);

      const customerFalse: Omit<Customer, 'createdAt' | 'updatedAt'> = {
        ...customerTrue,
        customerId: '222222222',
        ssn: 'encrypted-ssn-4',
        governmentId: 'encrypted-id-4',
        isPrimaryCardholder: false,
      };

      const resultFalse = await customerRepository.create(customerFalse);
      expect(resultFalse.isPrimaryCardholder).toBe(false);
    });

    it('should store credit limit as decimal', async () => {
      const customer: Omit<Customer, 'createdAt' | 'updatedAt'> = {
        customerId: '333333333',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: new Date('1985-01-01'),
        ssn: 'encrypted-ssn-5',
        governmentId: 'encrypted-id-5',
        addressLine1: 'Address',
        city: 'City',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        phone1: '312-555-0001',
        isPrimaryCardholder: true,
        ficoScore: 720,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 5000.50,
        createdBy: 'USER1',
        updatedBy: 'USER1',
      };

      const result = await customerRepository.create(customer);
      expect(result.creditLimit).toBe(5000.50);
    });
  });

  describe('findBySSN', () => {
    beforeEach(async () => {
      const customer: Omit<Customer, 'createdAt' | 'updatedAt'> = {
        customerId: '123456789',
        firstName: 'John',
        lastName: 'Anderson',
        dateOfBirth: new Date('1985-06-15'),
        ssn: 'encrypted-ssn-unique',
        governmentId: 'encrypted-id-unique',
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
        createdBy: 'USER123',
        updatedBy: 'USER123',
      };
      await customerRepository.create(customer);
    });

    it('should find customer by SSN', async () => {
      const result = await customerRepository.findBySSN('encrypted-ssn-unique');

      expect(result).toBeDefined();
      expect(result?.customerId).toBe('123456789');
      expect(result?.ssn).toBe('encrypted-ssn-unique');
    });

    it('should return null when SSN not found', async () => {
      const result = await customerRepository.findBySSN('non-existent-ssn');

      expect(result).toBeNull();
    });

    it('should return complete customer data', async () => {
      const result = await customerRepository.findBySSN('encrypted-ssn-unique');

      expect(result?.firstName).toBe('John');
      expect(result?.lastName).toBe('Anderson');
      expect(result?.dateOfBirth).toBeInstanceOf(Date);
      expect(result?.status).toBe(CustomerStatus.ACTIVE);
      expect(result?.verificationStatus).toBe(VerificationStatus.PENDING);
    });
  });

  describe('findByGovernmentId', () => {
    beforeEach(async () => {
      const customer: Omit<Customer, 'createdAt' | 'updatedAt'> = {
        customerId: '987654321',
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: new Date('1990-03-20'),
        ssn: 'encrypted-ssn-jane',
        governmentId: 'encrypted-id-jane',
        addressLine1: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA',
        phone1: '310-555-0123',
        isPrimaryCardholder: true,
        ficoScore: 800,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.VERIFIED,
        creditLimit: 15000,
        createdBy: 'ADMIN1',
        updatedBy: 'ADMIN1',
      };
      await customerRepository.create(customer);
    });

    it('should find customer by government ID', async () => {
      const result = await customerRepository.findByGovernmentId('encrypted-id-jane');

      expect(result).toBeDefined();
      expect(result?.customerId).toBe('987654321');
      expect(result?.governmentId).toBe('encrypted-id-jane');
    });

    it('should return null when government ID not found', async () => {
      const result = await customerRepository.findByGovernmentId('non-existent-id');

      expect(result).toBeNull();
    });

    it('should return complete customer data', async () => {
      const result = await customerRepository.findByGovernmentId('encrypted-id-jane');

      expect(result?.firstName).toBe('Jane');
      expect(result?.lastName).toBe('Smith');
      expect(result?.ficoScore).toBe(800);
      expect(result?.creditLimit).toBe(15000);
    });
  });

  describe('findById', () => {
    beforeEach(async () => {
      const customer: Omit<Customer, 'createdAt' | 'updatedAt'> = {
        customerId: '111222333',
        firstName: 'Bob',
        lastName: 'Wilson',
        dateOfBirth: new Date('1980-12-10'),
        ssn: 'encrypted-ssn-bob',
        governmentId: 'encrypted-id-bob',
        addressLine1: '789 Pine Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        phone1: '212-555-0123',
        isPrimaryCardholder: true,
        ficoScore: 650,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 3000,
        createdBy: 'CSR001',
        updatedBy: 'CSR001',
      };
      await customerRepository.create(customer);
    });

    it('should find customer by customer ID', async () => {
      const result = await customerRepository.findById('111222333');

      expect(result).toBeDefined();
      expect(result?.customerId).toBe('111222333');
      expect(result?.firstName).toBe('Bob');
    });

    it('should return null when customer ID not found', async () => {
      const result = await customerRepository.findById('999999999');

      expect(result).toBeNull();
    });

    it('should return complete customer data', async () => {
      const result = await customerRepository.findById('111222333');

      expect(result?.lastName).toBe('Wilson');
      expect(result?.city).toBe('New York');
      expect(result?.state).toBe('NY');
      expect(result?.ficoScore).toBe(650);
    });
  });

  describe('Data Type Mapping', () => {
    it('should correctly map date fields', async () => {
      const dateOfBirth = new Date('1985-06-15');
      const customer: Omit<Customer, 'createdAt' | 'updatedAt'> = {
        customerId: '444555666',
        firstName: 'Test',
        lastName: 'Date',
        dateOfBirth,
        ssn: 'encrypted-ssn-date',
        governmentId: 'encrypted-id-date',
        addressLine1: 'Address',
        city: 'City',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        phone1: '312-555-0001',
        isPrimaryCardholder: true,
        ficoScore: 720,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 5000,
        createdBy: 'USER1',
        updatedBy: 'USER1',
      };

      const result = await customerRepository.create(customer);

      expect(result.dateOfBirth).toBeInstanceOf(Date);
      expect(result.dateOfBirth.toISOString().split('T')[0]).toBe('1985-06-15');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should correctly map enum values', async () => {
      const customer: Omit<Customer, 'createdAt' | 'updatedAt'> = {
        customerId: '555666777',
        firstName: 'Test',
        lastName: 'Enum',
        dateOfBirth: new Date('1985-01-01'),
        ssn: 'encrypted-ssn-enum',
        governmentId: 'encrypted-id-enum',
        addressLine1: 'Address',
        city: 'City',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        phone1: '312-555-0001',
        isPrimaryCardholder: true,
        ficoScore: 720,
        status: CustomerStatus.SUSPENDED,
        verificationStatus: VerificationStatus.MANUAL_REVIEW_REQUIRED,
        creditLimit: 5000,
        createdBy: 'USER1',
        updatedBy: 'USER1',
      };

      const result = await customerRepository.create(customer);

      expect(result.status).toBe(CustomerStatus.SUSPENDED);
      expect(result.verificationStatus).toBe(VerificationStatus.MANUAL_REVIEW_REQUIRED);
    });
  });

  describe('Edge Cases', () => {
    it('should handle customer with minimum FICO score', async () => {
      const customer: Omit<Customer, 'createdAt' | 'updatedAt'> = {
        customerId: '666777888',
        firstName: 'Low',
        lastName: 'Score',
        dateOfBirth: new Date('1985-01-01'),
        ssn: 'encrypted-ssn-low',
        governmentId: 'encrypted-id-low',
        addressLine1: 'Address',
        city: 'City',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        phone1: '312-555-0001',
        isPrimaryCardholder: true,
        ficoScore: 300,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 1000,
        createdBy: 'USER1',
        updatedBy: 'USER1',
      };

      const result = await customerRepository.create(customer);
      expect(result.ficoScore).toBe(300);
    });

    it('should handle customer with maximum FICO score', async () => {
      const customer: Omit<Customer, 'createdAt' | 'updatedAt'> = {
        customerId: '777888999',
        firstName: 'High',
        lastName: 'Score',
        dateOfBirth: new Date('1985-01-01'),
        ssn: 'encrypted-ssn-high',
        governmentId: 'encrypted-id-high',
        addressLine1: 'Address',
        city: 'City',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        phone1: '312-555-0001',
        isPrimaryCardholder: true,
        ficoScore: 850,
        status: CustomerStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 15000,
        createdBy: 'USER1',
        updatedBy: 'USER1',
      };

      const result = await customerRepository.create(customer);
      expect(result.ficoScore).toBe(850);
    });
  });
});
