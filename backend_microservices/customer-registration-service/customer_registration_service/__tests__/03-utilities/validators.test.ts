import { createCustomerSchema } from '../../src/validators/customer.validator';

describe('Customer Validators', () => {
  describe('createCustomerSchema', () => {
    const validCustomer = {
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

    it('should validate valid customer data', () => {
      const result = createCustomerSchema.safeParse(validCustomer);
      expect(result.success).toBe(true);
    });

    it('should validate customer with optional fields', () => {
      const customerWithOptional = {
        ...validCustomer,
        middleName: 'Michael',
        addressLine2: 'Apt 4B',
        addressLine3: 'Building C',
        phone2: '312-555-0456',
        eftAccountId: 'EFT987654321',
      };

      const result = createCustomerSchema.safeParse(customerWithOptional);
      expect(result.success).toBe(true);
    });

    it('should fail when firstName is missing', () => {
      const { firstName, ...customer } = validCustomer;
      const result = createCustomerSchema.safeParse(customer);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('firstName');
      }
    });

    it('should fail when firstName exceeds 25 characters', () => {
      const customer = {
        ...validCustomer,
        firstName: 'A'.repeat(26),
      };

      const result = createCustomerSchema.safeParse(customer);
      expect(result.success).toBe(false);
    });

    it('should fail when lastName is missing', () => {
      const { lastName, ...customer } = validCustomer;
      const result = createCustomerSchema.safeParse(customer);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('lastName');
      }
    });

    it('should fail when dateOfBirth has invalid format', () => {
      const customer = {
        ...validCustomer,
        dateOfBirth: '06/15/1985',
      };

      const result = createCustomerSchema.safeParse(customer);
      expect(result.success).toBe(false);
    });

    it('should fail when SSN has invalid format', () => {
      const customer = {
        ...validCustomer,
        ssn: '123456789',
      };

      const result = createCustomerSchema.safeParse(customer);
      expect(result.success).toBe(false);
    });

    it('should pass when SSN has correct format', () => {
      const customer = {
        ...validCustomer,
        ssn: '123-45-6789',
      };

      const result = createCustomerSchema.safeParse(customer);
      expect(result.success).toBe(true);
    });

    it('should fail when state code is not 2 characters', () => {
      const customer = {
        ...validCustomer,
        state: 'ILL',
      };

      const result = createCustomerSchema.safeParse(customer);
      expect(result.success).toBe(false);
    });

    it('should fail when country code is not 3 characters', () => {
      const customer = {
        ...validCustomer,
        country: 'US',
      };

      const result = createCustomerSchema.safeParse(customer);
      expect(result.success).toBe(false);
    });

    it('should fail when ficoScore is below 300', () => {
      const customer = {
        ...validCustomer,
        ficoScore: 299,
      };

      const result = createCustomerSchema.safeParse(customer);
      expect(result.success).toBe(false);
    });

    it('should fail when ficoScore is above 850', () => {
      const customer = {
        ...validCustomer,
        ficoScore: 851,
      };

      const result = createCustomerSchema.safeParse(customer);
      expect(result.success).toBe(false);
    });

    it('should pass when ficoScore is exactly 300', () => {
      const customer = {
        ...validCustomer,
        ficoScore: 300,
      };

      const result = createCustomerSchema.safeParse(customer);
      expect(result.success).toBe(true);
    });

    it('should pass when ficoScore is exactly 850', () => {
      const customer = {
        ...validCustomer,
        ficoScore: 850,
      };

      const result = createCustomerSchema.safeParse(customer);
      expect(result.success).toBe(true);
    });

    it('should fail when isPrimaryCardholder is not boolean', () => {
      const customer = {
        ...validCustomer,
        isPrimaryCardholder: 'true',
      };

      const result = createCustomerSchema.safeParse(customer);
      expect(result.success).toBe(false);
    });

    it('should fail when phone1 is too short', () => {
      const customer = {
        ...validCustomer,
        phone1: '123',
      };

      const result = createCustomerSchema.safeParse(customer);
      expect(result.success).toBe(false);
    });

    it('should fail when zipCode is too short', () => {
      const customer = {
        ...validCustomer,
        zipCode: '123',
      };

      const result = createCustomerSchema.safeParse(customer);
      expect(result.success).toBe(false);
    });

    it('should pass with 5-digit zipCode', () => {
      const customer = {
        ...validCustomer,
        zipCode: '60601',
      };

      const result = createCustomerSchema.safeParse(customer);
      expect(result.success).toBe(true);
    });

    it('should pass with 10-digit zipCode (ZIP+4)', () => {
      const customer = {
        ...validCustomer,
        zipCode: '60601-1234',
      };

      const result = createCustomerSchema.safeParse(customer);
      expect(result.success).toBe(true);
    });
  });
});
