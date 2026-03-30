import { mapCustomerEntityToDTO, mapAccountEntityToDTO } from '../../../utils/mapper';
import { CustomerEntity, AccountEntity } from '../../../types/entities';
import { UserRole, CustomerStatus } from '../../../types/dtos';

describe('Mapper Utilities', () => {
  describe('mapAccountEntityToDTO', () => {
    it('should map account entity to DTO', () => {
      const entity: AccountEntity = {
        account_id: '12345678901',
        customer_id: '123456789',
        status: 'active',
        balance: 2450.75,
        created_at: new Date('2024-01-15T10:30:00Z'),
        updated_at: new Date('2024-01-20T14:22:00Z'),
      };

      const dto = mapAccountEntityToDTO(entity);

      expect(dto.accountId).toBe('12345678901');
      expect(dto.status).toBe('active');
      expect(dto.balance).toBe(2450.75);
    });

    it('should convert balance to number', () => {
      const entity: AccountEntity = {
        account_id: '12345678901',
        customer_id: '123456789',
        status: 'active',
        balance: 1000,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const dto = mapAccountEntityToDTO(entity);

      expect(typeof dto.balance).toBe('number');
      expect(dto.balance).toBe(1000);
    });

    it('should handle zero balance', () => {
      const entity: AccountEntity = {
        account_id: '12345678901',
        customer_id: '123456789',
        status: 'active',
        balance: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const dto = mapAccountEntityToDTO(entity);

      expect(dto.balance).toBe(0);
    });

    it('should handle negative balance', () => {
      const entity: AccountEntity = {
        account_id: '12345678901',
        customer_id: '123456789',
        status: 'overdrawn',
        balance: -50.25,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const dto = mapAccountEntityToDTO(entity);

      expect(dto.balance).toBe(-50.25);
    });

    it('should handle different account statuses', () => {
      const statuses = ['active', 'inactive', 'closed'];

      statuses.forEach((status) => {
        const entity: AccountEntity = {
          account_id: '12345678901',
          customer_id: '123456789',
          status,
          balance: 1000,
          created_at: new Date(),
          updated_at: new Date(),
        };

        const dto = mapAccountEntityToDTO(entity);
        expect(dto.status).toBe(status);
      });
    });
  });

  describe('mapCustomerEntityToDTO', () => {
    const baseEntity: CustomerEntity = {
      customer_id: '123456789',
      first_name: 'John',
      middle_name: 'Michael',
      last_name: 'Doe',
      date_of_birth: new Date('1985-06-15'),
      ssn: '123-45-6789',
      government_id: 'DL12345678',
      address_line1: '123 Main St',
      address_line2: 'Apt 4B',
      city: 'Chicago',
      state: 'IL',
      zip_code: '60601',
      country: 'USA',
      phone1: '312-555-0123',
      phone2: '312-555-0456',
      eft_account_id: 'EFT123456',
      is_primary_cardholder: true,
      fico_score: 720,
      status: 'active',
      created_at: new Date('2024-01-15T10:30:00Z'),
      updated_at: new Date('2024-01-20T14:22:00Z'),
      updated_by: 'ADMIN001',
      version: 1,
    };

    it('should map customer entity to DTO for ADMIN role', () => {
      const dto = mapCustomerEntityToDTO(baseEntity, UserRole.ADMIN);

      expect(dto.customerId).toBe('123456789');
      expect(dto.firstName).toBe('John');
      expect(dto.middleName).toBe('Michael');
      expect(dto.lastName).toBe('Doe');
      expect(dto.dateOfBirth).toBe('1985-06-15');
      expect(dto.ssn).toBe('123-45-6789'); // Full SSN for ADMIN
      expect(dto.governmentId).toBe('DL12345678'); // Full govId for ADMIN
      expect(dto.ficoScore).toBe(720); // FICO visible for ADMIN
      expect(dto.status).toBe(CustomerStatus.ACTIVE);
    });

    it('should mask SSN for CSR role', () => {
      const dto = mapCustomerEntityToDTO(baseEntity, UserRole.CSR);

      expect(dto.ssn).toBe('***-**-6789');
      expect(dto.governmentId).toBe('*****45678');
      expect(dto.ficoScore).toBeUndefined(); // FICO hidden for CSR
    });

    it('should fully mask SSN for CUSTOMER role', () => {
      const dto = mapCustomerEntityToDTO(baseEntity, UserRole.CUSTOMER);

      expect(dto.ssn).toBe('***-**-****');
      expect(dto.governmentId).toBe('*****45678');
      expect(dto.ficoScore).toBeUndefined(); // FICO hidden for CUSTOMER
    });

    it('should format date of birth correctly', () => {
      const dto = mapCustomerEntityToDTO(baseEntity, UserRole.ADMIN);

      expect(dto.dateOfBirth).toBe('1985-06-15');
      expect(dto.dateOfBirth).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should format timestamps to ISO 8601', () => {
      const dto = mapCustomerEntityToDTO(baseEntity, UserRole.ADMIN);

      expect(dto.createdAt).toBe('2024-01-15T10:30:00.000Z');
      expect(dto.updatedAt).toBe('2024-01-20T14:22:00.000Z');
    });

    it('should map customer without optional fields', () => {
      const minimalEntity: CustomerEntity = {
        customer_id: '123456789',
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: new Date('1985-06-15'),
        ssn: '123-45-6789',
        government_id: 'DL12345678',
        address_line1: '123 Main St',
        city: 'Chicago',
        state: 'IL',
        zip_code: '60601',
        country: 'USA',
        phone1: '312-555-0123',
        eft_account_id: 'EFT123456',
        is_primary_cardholder: true,
        status: 'active',
        created_at: new Date('2024-01-15T10:30:00Z'),
        updated_at: new Date('2024-01-20T14:22:00Z'),
        updated_by: 'ADMIN001',
        version: 1,
      };

      const dto = mapCustomerEntityToDTO(minimalEntity, UserRole.ADMIN);

      expect(dto.middleName).toBeUndefined();
      expect(dto.addressLine2).toBeUndefined();
      expect(dto.phone2).toBeUndefined();
      expect(dto.ficoScore).toBeUndefined();
    });

    it('should include accounts when provided', () => {
      const accounts: AccountEntity[] = [
        {
          account_id: '12345678901',
          customer_id: '123456789',
          status: 'active',
          balance: 1000,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          account_id: '12345678902',
          customer_id: '123456789',
          status: 'active',
          balance: 2000,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const dto = mapCustomerEntityToDTO(baseEntity, UserRole.ADMIN, accounts);

      expect(dto.accounts).toBeDefined();
      expect(dto.accounts).toHaveLength(2);
      expect(dto.accounts?.[0].accountId).toBe('12345678901');
      expect(dto.accounts?.[1].accountId).toBe('12345678902');
    });

    it('should not include accounts when not provided', () => {
      const dto = mapCustomerEntityToDTO(baseEntity, UserRole.ADMIN);

      expect(dto.accounts).toBeUndefined();
    });

    it('should handle empty accounts array', () => {
      const dto = mapCustomerEntityToDTO(baseEntity, UserRole.ADMIN, []);

      expect(dto.accounts).toBeUndefined();
    });

    it('should map all address fields correctly', () => {
      const dto = mapCustomerEntityToDTO(baseEntity, UserRole.ADMIN);

      expect(dto.addressLine1).toBe('123 Main St');
      expect(dto.addressLine2).toBe('Apt 4B');
      expect(dto.city).toBe('Chicago');
      expect(dto.state).toBe('IL');
      expect(dto.zipCode).toBe('60601');
      expect(dto.country).toBe('USA');
    });

    it('should map all contact fields correctly', () => {
      const dto = mapCustomerEntityToDTO(baseEntity, UserRole.ADMIN);

      expect(dto.phone1).toBe('312-555-0123');
      expect(dto.phone2).toBe('312-555-0456');
      expect(dto.eftAccountId).toBe('EFT123456');
    });

    it('should map boolean fields correctly', () => {
      const primaryEntity = { ...baseEntity, is_primary_cardholder: true };
      const nonPrimaryEntity = { ...baseEntity, is_primary_cardholder: false };

      const primaryDto = mapCustomerEntityToDTO(primaryEntity, UserRole.ADMIN);
      const nonPrimaryDto = mapCustomerEntityToDTO(nonPrimaryEntity, UserRole.ADMIN);

      expect(primaryDto.isPrimaryCardholder).toBe(true);
      expect(nonPrimaryDto.isPrimaryCardholder).toBe(false);
    });

    it('should map different customer statuses', () => {
      const statuses = ['active', 'inactive', 'suspended'];

      statuses.forEach((status) => {
        const entity = { ...baseEntity, status };
        const dto = mapCustomerEntityToDTO(entity, UserRole.ADMIN);

        expect(dto.status).toBe(status as CustomerStatus);
      });
    });

    it('should apply correct masking for each role', () => {
      const adminDto = mapCustomerEntityToDTO(baseEntity, UserRole.ADMIN);
      const csrDto = mapCustomerEntityToDTO(baseEntity, UserRole.CSR);
      const customerDto = mapCustomerEntityToDTO(baseEntity, UserRole.CUSTOMER);

      // SSN masking
      expect(adminDto.ssn).toBe('123-45-6789');
      expect(csrDto.ssn).toBe('***-**-6789');
      expect(customerDto.ssn).toBe('***-**-****');

      // Government ID masking
      expect(adminDto.governmentId).toBe('DL12345678');
      expect(csrDto.governmentId).toBe('*****45678');
      expect(customerDto.governmentId).toBe('*****45678');

      // FICO score visibility
      expect(adminDto.ficoScore).toBe(720);
      expect(csrDto.ficoScore).toBeUndefined();
      expect(customerDto.ficoScore).toBeUndefined();
    });
  });

  describe('Mapper Integration', () => {
    it('should map customer with accounts correctly', () => {
      const customerEntity: CustomerEntity = {
        customer_id: '123456789',
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: new Date('1985-06-15'),
        ssn: '123-45-6789',
        government_id: 'DL12345678',
        address_line1: '123 Main St',
        city: 'Chicago',
        state: 'IL',
        zip_code: '60601',
        country: 'USA',
        phone1: '312-555-0123',
        eft_account_id: 'EFT123456',
        is_primary_cardholder: true,
        fico_score: 720,
        status: 'active',
        created_at: new Date('2024-01-15T10:30:00Z'),
        updated_at: new Date('2024-01-20T14:22:00Z'),
        updated_by: 'ADMIN001',
        version: 1,
      };

      const accountEntities: AccountEntity[] = [
        {
          account_id: '12345678901',
          customer_id: '123456789',
          status: 'active',
          balance: 2450.75,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const dto = mapCustomerEntityToDTO(customerEntity, UserRole.ADMIN, accountEntities);

      expect(dto.customerId).toBe('123456789');
      expect(dto.accounts).toHaveLength(1);
      expect(dto.accounts?.[0].balance).toBe(2450.75);
    });

    it('should preserve data integrity during mapping', () => {
      const entity: CustomerEntity = {
        customer_id: '123456789',
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: new Date('1985-06-15'),
        ssn: '123-45-6789',
        government_id: 'DL12345678',
        address_line1: '123 Main St',
        city: 'Chicago',
        state: 'IL',
        zip_code: '60601',
        country: 'USA',
        phone1: '312-555-0123',
        eft_account_id: 'EFT123456',
        is_primary_cardholder: true,
        status: 'active',
        created_at: new Date('2024-01-15T10:30:00Z'),
        updated_at: new Date('2024-01-20T14:22:00Z'),
        updated_by: 'ADMIN001',
        version: 1,
      };

      const dto = mapCustomerEntityToDTO(entity, UserRole.ADMIN);

      // All non-sensitive data should match exactly
      expect(dto.customerId).toBe(entity.customer_id);
      expect(dto.firstName).toBe(entity.first_name);
      expect(dto.lastName).toBe(entity.last_name);
      expect(dto.city).toBe(entity.city);
      expect(dto.state).toBe(entity.state);
      expect(dto.zipCode).toBe(entity.zip_code);
    });

    it('should handle multiple accounts for same customer', () => {
      const entity: CustomerEntity = {
        customer_id: '123456789',
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: new Date('1985-06-15'),
        ssn: '123-45-6789',
        government_id: 'DL12345678',
        address_line1: '123 Main St',
        city: 'Chicago',
        state: 'IL',
        zip_code: '60601',
        country: 'USA',
        phone1: '312-555-0123',
        eft_account_id: 'EFT123456',
        is_primary_cardholder: true,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
        updated_by: 'ADMIN001',
        version: 1,
      };

      const accounts: AccountEntity[] = [
        {
          account_id: '12345678901',
          customer_id: '123456789',
          status: 'active',
          balance: 1000,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          account_id: '12345678902',
          customer_id: '123456789',
          status: 'active',
          balance: 2000,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          account_id: '12345678903',
          customer_id: '123456789',
          status: 'inactive',
          balance: 0,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const dto = mapCustomerEntityToDTO(entity, UserRole.ADMIN, accounts);

      expect(dto.accounts).toHaveLength(3);
      expect(dto.accounts?.[0].balance).toBe(1000);
      expect(dto.accounts?.[1].balance).toBe(2000);
      expect(dto.accounts?.[2].balance).toBe(0);
      expect(dto.accounts?.[2].status).toBe('inactive');
    });
  });
});
