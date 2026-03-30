import { NotificationPreferenceEntity } from '../../src/types/notification-preference.entity';

describe('NotificationPreferenceEntity', () => {
  describe('Entity structure', () => {
    it('should create valid entity with all required fields', () => {
      const entity: NotificationPreferenceEntity = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        customerId: 'CUST123',
        emailEnabled: true,
        smsEnabled: true,
        transactionAlertsEnabled: true,
        transactionAlertsThreshold: 500.0,
        transactionAlertsChannels: ['email', 'sms'],
        paymentConfirmationsEnabled: true,
        paymentConfirmationsChannels: ['email'],
        monthlyStatementsEnabled: true,
        monthlyStatementsChannels: ['email'],
        marketingEmailsEnabled: false,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T14:30:00Z'),
      };

      expect(entity.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(entity.customerId).toBe('CUST123');
      expect(entity.emailEnabled).toBe(true);
      expect(entity.smsEnabled).toBe(true);
      expect(entity.transactionAlertsEnabled).toBe(true);
      expect(entity.transactionAlertsThreshold).toBe(500.0);
      expect(entity.transactionAlertsChannels).toEqual(['email', 'sms']);
      expect(entity.paymentConfirmationsEnabled).toBe(true);
      expect(entity.paymentConfirmationsChannels).toEqual(['email']);
      expect(entity.monthlyStatementsEnabled).toBe(true);
      expect(entity.monthlyStatementsChannels).toEqual(['email']);
      expect(entity.marketingEmailsEnabled).toBe(false);
      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.updatedAt).toBeInstanceOf(Date);
    });

    it('should support all notifications disabled', () => {
      const entity: NotificationPreferenceEntity = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        customerId: 'CUST123',
        emailEnabled: false,
        smsEnabled: false,
        transactionAlertsEnabled: false,
        transactionAlertsThreshold: 0,
        transactionAlertsChannels: ['email'],
        paymentConfirmationsEnabled: false,
        paymentConfirmationsChannels: ['email'],
        monthlyStatementsEnabled: false,
        monthlyStatementsChannels: ['email'],
        marketingEmailsEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(entity.emailEnabled).toBe(false);
      expect(entity.smsEnabled).toBe(false);
      expect(entity.transactionAlertsEnabled).toBe(false);
      expect(entity.paymentConfirmationsEnabled).toBe(false);
      expect(entity.monthlyStatementsEnabled).toBe(false);
      expect(entity.marketingEmailsEnabled).toBe(false);
    });

    it('should support zero threshold', () => {
      const entity: NotificationPreferenceEntity = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        customerId: 'CUST123',
        emailEnabled: true,
        smsEnabled: false,
        transactionAlertsEnabled: true,
        transactionAlertsThreshold: 0,
        transactionAlertsChannels: ['email'],
        paymentConfirmationsEnabled: true,
        paymentConfirmationsChannels: ['email'],
        monthlyStatementsEnabled: true,
        monthlyStatementsChannels: ['email'],
        marketingEmailsEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(entity.transactionAlertsThreshold).toBe(0);
    });

    it('should support multiple channels', () => {
      const entity: NotificationPreferenceEntity = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        customerId: 'CUST123',
        emailEnabled: true,
        smsEnabled: true,
        transactionAlertsEnabled: true,
        transactionAlertsThreshold: 500.0,
        transactionAlertsChannels: ['email', 'sms', 'push'],
        paymentConfirmationsEnabled: true,
        paymentConfirmationsChannels: ['email', 'sms'],
        monthlyStatementsEnabled: true,
        monthlyStatementsChannels: ['email', 'push'],
        marketingEmailsEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(entity.transactionAlertsChannels).toHaveLength(3);
      expect(entity.paymentConfirmationsChannels).toHaveLength(2);
      expect(entity.monthlyStatementsChannels).toHaveLength(2);
    });

    it('should support large threshold values', () => {
      const entity: NotificationPreferenceEntity = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        customerId: 'CUST123',
        emailEnabled: true,
        smsEnabled: true,
        transactionAlertsEnabled: true,
        transactionAlertsThreshold: 999999.99,
        transactionAlertsChannels: ['email'],
        paymentConfirmationsEnabled: true,
        paymentConfirmationsChannels: ['email'],
        monthlyStatementsEnabled: true,
        monthlyStatementsChannels: ['email'],
        marketingEmailsEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(entity.transactionAlertsThreshold).toBe(999999.99);
    });

    it('should have proper timestamp types', () => {
      const now = new Date();
      const entity: NotificationPreferenceEntity = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        customerId: 'CUST123',
        emailEnabled: true,
        smsEnabled: true,
        transactionAlertsEnabled: true,
        transactionAlertsThreshold: 500.0,
        transactionAlertsChannels: ['email'],
        paymentConfirmationsEnabled: true,
        paymentConfirmationsChannels: ['email'],
        monthlyStatementsEnabled: true,
        monthlyStatementsChannels: ['email'],
        marketingEmailsEnabled: false,
        createdAt: now,
        updatedAt: now,
      };

      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.updatedAt).toBeInstanceOf(Date);
      expect(entity.createdAt.getTime()).toBe(now.getTime());
      expect(entity.updatedAt.getTime()).toBe(now.getTime());
    });
  });
});
