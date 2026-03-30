import {
  CustomerEntity,
  AccountEntity,
  AuditLogEntity,
} from '../../../types/entities';

describe('Entity Types', () => {
  describe('CustomerEntity', () => {
    it('should create valid customer entity with required fields', () => {
      const customer: CustomerEntity = {
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
        updated_by: 'SYSTEM',
        version: 1,
      };

      expect(customer.customer_id).toBe('123456789');
      expect(customer.first_name).toBe('John');
      expect(customer.last_name).toBe('Doe');
      expect(customer.version).toBe(1);
    });

    it('should create customer entity with optional fields', () => {
      const customer: CustomerEntity = {
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

      expect(customer.middle_name).toBe('Michael');
      expect(customer.address_line2).toBe('Apt 4B');
      expect(customer.phone2).toBe('312-555-0456');
      expect(customer.fico_score).toBe(720);
    });

    it('should handle different customer statuses', () => {
      const activeCustomer: CustomerEntity = {
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
        updated_by: 'SYSTEM',
        version: 1,
      };

      expect(activeCustomer.status).toBe('active');

      const suspendedCustomer = { ...activeCustomer, status: 'suspended' };
      expect(suspendedCustomer.status).toBe('suspended');

      const inactiveCustomer = { ...activeCustomer, status: 'inactive' };
      expect(inactiveCustomer.status).toBe('inactive');
    });

    it('should handle version increments', () => {
      const customer: CustomerEntity = {
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
        updated_by: 'SYSTEM',
        version: 1,
      };

      expect(customer.version).toBe(1);

      const updatedCustomer = { ...customer, version: customer.version + 1 };
      expect(updatedCustomer.version).toBe(2);
    });

    it('should handle boolean flags correctly', () => {
      const primaryCardholder: CustomerEntity = {
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
        updated_by: 'SYSTEM',
        version: 1,
      };

      expect(primaryCardholder.is_primary_cardholder).toBe(true);

      const nonPrimaryCardholder = { ...primaryCardholder, is_primary_cardholder: false };
      expect(nonPrimaryCardholder.is_primary_cardholder).toBe(false);
    });
  });

  describe('AccountEntity', () => {
    it('should create valid account entity', () => {
      const account: AccountEntity = {
        account_id: '12345678901',
        customer_id: '123456789',
        status: 'active',
        balance: 2450.75,
        created_at: new Date('2024-01-15T10:30:00Z'),
        updated_at: new Date('2024-01-20T14:22:00Z'),
      };

      expect(account.account_id).toBe('12345678901');
      expect(account.customer_id).toBe('123456789');
      expect(account.status).toBe('active');
      expect(account.balance).toBe(2450.75);
    });

    it('should handle different account statuses', () => {
      const baseAccount: AccountEntity = {
        account_id: '12345678901',
        customer_id: '123456789',
        status: 'active',
        balance: 1000,
        created_at: new Date(),
        updated_at: new Date(),
      };

      expect(baseAccount.status).toBe('active');

      const inactiveAccount = { ...baseAccount, status: 'inactive' };
      expect(inactiveAccount.status).toBe('inactive');

      const closedAccount = { ...baseAccount, status: 'closed' };
      expect(closedAccount.status).toBe('closed');
    });

    it('should handle zero balance', () => {
      const account: AccountEntity = {
        account_id: '12345678901',
        customer_id: '123456789',
        status: 'active',
        balance: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      expect(account.balance).toBe(0);
    });

    it('should handle negative balance', () => {
      const account: AccountEntity = {
        account_id: '12345678901',
        customer_id: '123456789',
        status: 'overdrawn',
        balance: -50.25,
        created_at: new Date(),
        updated_at: new Date(),
      };

      expect(account.balance).toBeLessThan(0);
      expect(account.balance).toBe(-50.25);
    });

    it('should handle large balance amounts', () => {
      const account: AccountEntity = {
        account_id: '12345678901',
        customer_id: '123456789',
        status: 'active',
        balance: 999999.99,
        created_at: new Date(),
        updated_at: new Date(),
      };

      expect(account.balance).toBe(999999.99);
    });
  });

  describe('AuditLogEntity', () => {
    it('should create audit log with all required fields', () => {
      const auditLog: AuditLogEntity = {
        customer_id: '123456789',
        field_name: 'phone1',
        old_value: '312-555-0123',
        new_value: '312-555-9999',
        changed_by: 'CSR00123',
        ip_address: '192.168.1.1',
      };

      expect(auditLog.customer_id).toBe('123456789');
      expect(auditLog.field_name).toBe('phone1');
      expect(auditLog.old_value).toBe('312-555-0123');
      expect(auditLog.new_value).toBe('312-555-9999');
      expect(auditLog.changed_by).toBe('CSR00123');
      expect(auditLog.ip_address).toBe('192.168.1.1');
    });

    it('should create audit log with optional fields', () => {
      const auditLog: AuditLogEntity = {
        audit_id: '550e8400-e29b-41d4-a716-446655440000',
        customer_id: '123456789',
        field_name: 'address_line1',
        old_value: '123 Main St',
        new_value: '456 Oak Ave',
        changed_at: new Date('2024-01-21T09:15:00Z'),
        changed_by: 'CSR00123',
        ip_address: '192.168.1.1',
        trace_id: 'trace-123',
      };

      expect(auditLog.audit_id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(auditLog.changed_at).toBeInstanceOf(Date);
      expect(auditLog.trace_id).toBe('trace-123');
    });

    it('should handle null/undefined old value for new field', () => {
      const auditLog: AuditLogEntity = {
        customer_id: '123456789',
        field_name: 'phone2',
        old_value: undefined,
        new_value: '312-555-8888',
        changed_by: 'CSR00123',
        ip_address: '192.168.1.1',
      };

      expect(auditLog.old_value).toBeUndefined();
      expect(auditLog.new_value).toBe('312-555-8888');
    });

    it('should handle null/undefined new value for field deletion', () => {
      const auditLog: AuditLogEntity = {
        customer_id: '123456789',
        field_name: 'phone2',
        old_value: '312-555-8888',
        new_value: undefined,
        changed_by: 'CSR00123',
        ip_address: '192.168.1.1',
      };

      expect(auditLog.old_value).toBe('312-555-8888');
      expect(auditLog.new_value).toBeUndefined();
    });

    it('should handle sensitive field masking in values', () => {
      const auditLog: AuditLogEntity = {
        customer_id: '123456789',
        field_name: 'ssn',
        old_value: '*****6789',
        new_value: '*****5678',
        changed_by: 'ADMIN001',
        ip_address: '10.0.0.1',
      };

      expect(auditLog.old_value).toBe('*****6789');
      expect(auditLog.new_value).toBe('*****5678');
    });

    it('should track multiple field changes for same customer', () => {
      const auditLogs: AuditLogEntity[] = [
        {
          customer_id: '123456789',
          field_name: 'address_line1',
          old_value: '123 Main St',
          new_value: '456 Oak Ave',
          changed_by: 'CSR00123',
          ip_address: '192.168.1.1',
        },
        {
          customer_id: '123456789',
          field_name: 'city',
          old_value: 'Chicago',
          new_value: 'Springfield',
          changed_by: 'CSR00123',
          ip_address: '192.168.1.1',
        },
        {
          customer_id: '123456789',
          field_name: 'zip_code',
          old_value: '60601',
          new_value: '62701',
          changed_by: 'CSR00123',
          ip_address: '192.168.1.1',
        },
      ];

      expect(auditLogs).toHaveLength(3);
      expect(auditLogs.every(log => log.customer_id === '123456789')).toBe(true);
      expect(auditLogs.every(log => log.changed_by === 'CSR00123')).toBe(true);
    });
  });

  describe('Entity Relationships', () => {
    it('should maintain customer-account relationship', () => {
      const customer: CustomerEntity = {
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
        updated_by: 'SYSTEM',
        version: 1,
      };

      const accounts: AccountEntity[] = [
        {
          account_id: '12345678901',
          customer_id: customer.customer_id,
          status: 'active',
          balance: 1000,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          account_id: '12345678902',
          customer_id: customer.customer_id,
          status: 'active',
          balance: 2000,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      expect(accounts.every(acc => acc.customer_id === customer.customer_id)).toBe(true);
      expect(accounts).toHaveLength(2);
    });

    it('should maintain customer-audit relationship', () => {
      const customer: CustomerEntity = {
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
        updated_by: 'SYSTEM',
        version: 1,
      };

      const auditLogs: AuditLogEntity[] = [
        {
          customer_id: customer.customer_id,
          field_name: 'phone1',
          old_value: '312-555-0123',
          new_value: '312-555-9999',
          changed_by: 'CSR00123',
          ip_address: '192.168.1.1',
        },
      ];

      expect(auditLogs.every(log => log.customer_id === customer.customer_id)).toBe(true);
    });
  });
});
