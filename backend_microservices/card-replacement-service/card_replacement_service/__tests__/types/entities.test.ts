import { Card, CardReplacementHistory, AuditLog } from '../../src/types/entities';
import { CardStatus, ReplacementReason } from '../../src/types/enums';

describe('Entities', () => {
  describe('Card', () => {
    it('should accept valid card entity', () => {
      const card: Card = {
        cardNumber: '1234567890123456',
        accountId: '12345678901',
        customerId: '123456789',
        embossedName: 'JOHN M ANDERSON',
        cvv: '123',
        expirationDate: new Date('2027-01-31'),
        issuedDate: new Date('2024-01-15'),
        status: CardStatus.ACTIVE,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      };

      expect(card.cardNumber).toBe('1234567890123456');
      expect(card.status).toBe('active');
      expect(card.cvv).toBe('123');
      expect(card.expirationDate).toBeInstanceOf(Date);
    });

    it('should support all card statuses', () => {
      const statuses = [
        CardStatus.ACTIVE,
        CardStatus.INACTIVE,
        CardStatus.SUSPENDED,
        CardStatus.REPLACED,
      ];

      statuses.forEach((status) => {
        const card: Card = {
          cardNumber: '1234567890123456',
          accountId: '12345678901',
          customerId: '123456789',
          embossedName: 'JOHN M ANDERSON',
          cvv: '123',
          expirationDate: new Date('2027-01-31'),
          issuedDate: new Date('2024-01-15'),
          status,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(card.status).toBe(status);
      });
    });
  });

  describe('CardReplacementHistory', () => {
    it('should accept valid replacement history with all fields', () => {
      const history: CardReplacementHistory = {
        replacementId: '550e8400-e29b-41d4-a716-446655440000',
        originalCardNumber: '1234567890123456',
        replacementCardNumber: '6543210987654321',
        replacementReason: ReplacementReason.LOST_OR_STOLEN,
        requestedBy: 'user123',
        requestedAt: new Date('2024-01-15T10:00:00Z'),
        expeditedShipping: true,
        estimatedDelivery: new Date('2024-01-17'),
        deliveryLine1: '456 Oak Avenue',
        deliveryLine2: 'Suite 200',
        deliveryCity: 'Chicago',
        deliveryState: 'IL',
        deliveryZipCode: '60602',
      };

      expect(history.replacementId).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(history.originalCardNumber).toBe('1234567890123456');
      expect(history.replacementCardNumber).toBe('6543210987654321');
      expect(history.expeditedShipping).toBe(true);
      expect(history.deliveryLine2).toBe('Suite 200');
    });

    it('should accept replacement history without optional deliveryLine2', () => {
      const history: CardReplacementHistory = {
        replacementId: '550e8400-e29b-41d4-a716-446655440000',
        originalCardNumber: '1234567890123456',
        replacementCardNumber: '6543210987654321',
        replacementReason: ReplacementReason.DAMAGED,
        requestedBy: 'user123',
        requestedAt: new Date('2024-01-15T10:00:00Z'),
        expeditedShipping: false,
        estimatedDelivery: new Date('2024-01-22'),
        deliveryLine1: '123 Main St',
        deliveryCity: 'New York',
        deliveryState: 'NY',
        deliveryZipCode: '10001',
      };

      expect(history.deliveryLine2).toBeUndefined();
      expect(history.expeditedShipping).toBe(false);
    });

    it('should support all replacement reasons', () => {
      const reasons = [
        ReplacementReason.LOST_OR_STOLEN,
        ReplacementReason.DAMAGED,
        ReplacementReason.EXPIRING_SOON,
        ReplacementReason.FRAUD_PREVENTION,
      ];

      reasons.forEach((reason) => {
        const history: CardReplacementHistory = {
          replacementId: '550e8400-e29b-41d4-a716-446655440000',
          originalCardNumber: '1234567890123456',
          replacementCardNumber: '6543210987654321',
          replacementReason: reason,
          requestedBy: 'user123',
          requestedAt: new Date('2024-01-15T10:00:00Z'),
          expeditedShipping: false,
          estimatedDelivery: new Date('2024-01-22'),
          deliveryLine1: '123 Main St',
          deliveryCity: 'New York',
          deliveryState: 'NY',
          deliveryZipCode: '10001',
        };

        expect(history.replacementReason).toBe(reason);
      });
    });
  });

  describe('AuditLog', () => {
    it('should accept valid audit log', () => {
      const auditLog: AuditLog = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        eventType: 'card_replacement',
        entityType: 'card',
        entityId: '1234567890123456',
        userId: 'user123',
        traceId: '123e4567-e89b-12d3-a456-426614174000',
        eventData: {
          originalCard: '************1234',
          replacementCard: '************5678',
          reason: 'lost_or_stolen',
        },
        timestamp: new Date('2024-01-15T10:00:00Z'),
      };

      expect(auditLog.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(auditLog.eventType).toBe('card_replacement');
      expect(auditLog.entityType).toBe('card');
      expect(auditLog.eventData).toHaveProperty('originalCard');
    });

    it('should accept audit log with empty eventData', () => {
      const auditLog: AuditLog = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        eventType: 'card_status_change',
        entityType: 'card',
        entityId: '1234567890123456',
        userId: 'user123',
        traceId: '123e4567-e89b-12d3-a456-426614174000',
        eventData: {},
        timestamp: new Date('2024-01-15T10:00:00Z'),
      };

      expect(auditLog.eventData).toEqual({});
      expect(Object.keys(auditLog.eventData)).toHaveLength(0);
    });

    it('should accept audit log with complex eventData', () => {
      const auditLog: AuditLog = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        eventType: 'card_replacement',
        entityType: 'card',
        entityId: '1234567890123456',
        userId: 'user123',
        traceId: '123e4567-e89b-12d3-a456-426614174000',
        eventData: {
          nested: {
            property: 'value',
          },
          array: [1, 2, 3],
          boolean: true,
          number: 123,
        },
        timestamp: new Date('2024-01-15T10:00:00Z'),
      };

      expect(auditLog.eventData.nested).toEqual({ property: 'value' });
      expect(auditLog.eventData.array).toEqual([1, 2, 3]);
    });
  });
});
