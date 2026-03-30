import { AccountStatusService } from '../../../src/services/account-status.service';
import { IAccountRepository } from '../../../src/repositories/account.repository';
import { IAuditService } from '../../../src/services/audit.service';
import { INotificationService } from '../../../src/services/notification.service';
import { IEventPublisher } from '../../../src/services/event-publisher.service';
import { AccountStatus } from '../../../src/enums/account-status.enum';
import { StatusChangeReason } from '../../../src/enums/status-change-reason.enum';
import { AccountNotFoundException } from '../../../src/exceptions/account-not-found.exception';
import { InvalidTransitionException } from '../../../src/exceptions/invalid-transition.exception';
import { ConcurrentModificationException } from '../../../src/exceptions/concurrent-modification.exception';
import { Account } from '../../../src/entities/account.entity';

describe('AccountStatusService', () => {
  let service: AccountStatusService;
  let mockRepository: jest.Mocked<IAccountRepository>;
  let mockAuditService: jest.Mocked<IAuditService>;
  let mockNotificationService: jest.Mocked<INotificationService>;
  let mockEventPublisher: jest.Mocked<IEventPublisher>;

  const mockAccount: Account = {
    accountId: '12345678901',
    accountStatus: AccountStatus.ACTIVE,
    balance: 1000.50,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    updatedBy: 'SYSTEM',
    version: 1,
  };

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      updateStatus: jest.fn(),
      createStatusHistory: jest.fn(),
      cascadeCardsStatus: jest.fn(),
      getAccountCards: jest.fn(),
      beginTransaction: jest.fn(),
    } as any;

    mockAuditService = {
      logStatusChange: jest.fn(),
      logRetry: jest.fn(),
      logFailure: jest.fn(),
    } as any;

    mockNotificationService = {
      sendStatusChangeNotification: jest.fn(),
    } as any;

    mockEventPublisher = {
      publishAccountStatusChanged: jest.fn(),
      publishAccountClosedWithBalance: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    } as any;

    service = new AccountStatusService(
      mockRepository,
      mockAuditService,
      mockNotificationService,
      mockEventPublisher
    );
  });

  describe('updateAccountStatus - Successful scenarios', () => {
    it('should successfully update status from active to suspended', async () => {
      const request = {
        newStatus: AccountStatus.SUSPENDED,
        reason: StatusChangeReason.FRAUD_INVESTIGATION,
        notes: 'Suspicious activity detected',
        notifyCustomer: true,
      };

      mockRepository.findById.mockResolvedValue(mockAccount);
      mockRepository.updateStatus.mockResolvedValue(true);
      mockRepository.createStatusHistory.mockResolvedValue('hist-123');
      mockRepository.getAccountCards.mockResolvedValue([
        { cardNumber: '1234567890123456', status: 'active' },
      ]);
      mockRepository.cascadeCardsStatus.mockResolvedValue(1);
      mockNotificationService.sendStatusChangeNotification.mockResolvedValue(true);

      const result = await service.updateAccountStatus(
        '12345678901',
        request,
        'ADMIN001',
        '192.168.1.1'
      );

      expect(result.accountId).toBe('12345678901');
      expect(result.previousStatus).toBe(AccountStatus.ACTIVE);
      expect(result.newStatus).toBe(AccountStatus.SUSPENDED);
      expect(result.reason).toBe(StatusChangeReason.FRAUD_INVESTIGATION);
      expect(result.notificationSent).toBe(true);
      expect(result.cascadedCards).toHaveLength(1);
    });

    it('should successfully update status from suspended to active', async () => {
      const suspendedAccount = { ...mockAccount, accountStatus: AccountStatus.SUSPENDED };
      const request = {
        newStatus: AccountStatus.ACTIVE,
        reason: StatusChangeReason.CUSTOMER_REQUEST,
        notifyCustomer: false,
      };

      mockRepository.findById.mockResolvedValue(suspendedAccount);
      mockRepository.updateStatus.mockResolvedValue(true);
      mockRepository.createStatusHistory.mockResolvedValue('hist-456');
      mockRepository.getAccountCards.mockResolvedValue([]);

      const result = await service.updateAccountStatus(
        '12345678901',
        request,
        'ADMIN002',
        '192.168.1.2'
      );

      expect(result.previousStatus).toBe(AccountStatus.SUSPENDED);
      expect(result.newStatus).toBe(AccountStatus.ACTIVE);
      expect(result.notificationSent).toBe(false);
      expect(result.cascadedCards).toHaveLength(0);
    });

    it('should successfully close account (active to inactive)', async () => {
      const request = {
        newStatus: AccountStatus.INACTIVE,
        reason: StatusChangeReason.CUSTOMER_REQUEST,
        notes: 'Customer requested closure',
        notifyCustomer: true,
      };

      mockRepository.findById.mockResolvedValue(mockAccount);
      mockRepository.updateStatus.mockResolvedValue(true);
      mockRepository.createStatusHistory.mockResolvedValue('hist-789');
      mockRepository.getAccountCards.mockResolvedValue([
        { cardNumber: '1111222233334444', status: 'active' },
        { cardNumber: '5555666677778888', status: 'suspended' },
      ]);
      mockRepository.cascadeCardsStatus.mockResolvedValue(2);
      mockNotificationService.sendStatusChangeNotification.mockResolvedValue(true);

      const result = await service.updateAccountStatus(
        '12345678901',
        request,
        'ADMIN003',
        '192.168.1.3'
      );

      expect(result.newStatus).toBe(AccountStatus.INACTIVE);
      expect(result.cascadedCards).toHaveLength(2);
      expect(mockEventPublisher.publishAccountStatusChanged).toHaveBeenCalled();
    });

    it('should publish AccountClosedWithBalance event when closing account with balance', async () => {
      const accountWithBalance = { ...mockAccount, balance: 500.75 };
      const request = {
        newStatus: AccountStatus.INACTIVE,
        reason: StatusChangeReason.CUSTOMER_REQUEST,
        notifyCustomer: false,
      };

      mockRepository.findById.mockResolvedValue(accountWithBalance);
      mockRepository.updateStatus.mockResolvedValue(true);
      mockRepository.createStatusHistory.mockResolvedValue('hist-balance');
      mockRepository.getAccountCards.mockResolvedValue([]);

      await service.updateAccountStatus('12345678901', request, 'ADMIN004', '192.168.1.4');

      expect(mockEventPublisher.publishAccountClosedWithBalance).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: '12345678901',
          balance: 500.75,
        })
      );
    });

    it('should mask card numbers in response', async () => {
      const request = {
        newStatus: AccountStatus.SUSPENDED,
        reason: StatusChangeReason.SYSTEM_MAINTENANCE,
        notifyCustomer: false,
      };

      mockRepository.findById.mockResolvedValue(mockAccount);
      mockRepository.updateStatus.mockResolvedValue(true);
      mockRepository.createStatusHistory.mockResolvedValue('hist-mask');
      mockRepository.getAccountCards.mockResolvedValue([
        { cardNumber: '1234567890123456', status: 'active' },
      ]);
      mockRepository.cascadeCardsStatus.mockResolvedValue(1);

      const result = await service.updateAccountStatus(
        '12345678901',
        request,
        'ADMIN005',
        '192.168.1.5'
      );

      expect(result.cascadedCards[0].cardNumber).toBe('************3456');
    });
  });

  describe('updateAccountStatus - Error scenarios', () => {
    it('should throw AccountNotFoundException when account does not exist', async () => {
      const request = {
        newStatus: AccountStatus.SUSPENDED,
        reason: StatusChangeReason.FRAUD_INVESTIGATION,
        notifyCustomer: true,
      };

      mockRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateAccountStatus('99999999999', request, 'ADMIN001', '192.168.1.1')
      ).rejects.toThrow(AccountNotFoundException);
    });

    it('should throw error when new status equals current status', async () => {
      const request = {
        newStatus: AccountStatus.ACTIVE,
        reason: StatusChangeReason.CUSTOMER_REQUEST,
        notifyCustomer: false,
      };

      mockRepository.findById.mockResolvedValue(mockAccount);

      await expect(
        service.updateAccountStatus('12345678901', request, 'ADMIN001', '192.168.1.1')
      ).rejects.toThrow('New status must be different from current status');
    });

    it('should throw InvalidTransitionException for inactive to active transition', async () => {
      const inactiveAccount = { ...mockAccount, accountStatus: AccountStatus.INACTIVE };
      const request = {
        newStatus: AccountStatus.ACTIVE,
        reason: StatusChangeReason.CUSTOMER_REQUEST,
        notifyCustomer: false,
      };

      mockRepository.findById.mockResolvedValue(inactiveAccount);

      await expect(
        service.updateAccountStatus('12345678901', request, 'ADMIN001', '192.168.1.1')
      ).rejects.toThrow(InvalidTransitionException);
    });

    it('should throw InvalidTransitionException for inactive to suspended transition', async () => {
      const inactiveAccount = { ...mockAccount, accountStatus: AccountStatus.INACTIVE };
      const request = {
        newStatus: AccountStatus.SUSPENDED,
        reason: StatusChangeReason.SYSTEM_MAINTENANCE,
        notifyCustomer: false,
      };

      mockRepository.findById.mockResolvedValue(inactiveAccount);

      await expect(
        service.updateAccountStatus('12345678901', request, 'ADMIN001', '192.168.1.1')
      ).rejects.toThrow(InvalidTransitionException);
    });

    it('should throw ConcurrentModificationException when optimistic locking fails', async () => {
      const request = {
        newStatus: AccountStatus.SUSPENDED,
        reason: StatusChangeReason.FRAUD_INVESTIGATION,
        notifyCustomer: true,
      };

      mockRepository.findById.mockResolvedValue(mockAccount);
      mockRepository.updateStatus.mockResolvedValue(false); // Optimistic lock failure
      mockRepository.getAccountCards.mockResolvedValue([]);

      await expect(
        service.updateAccountStatus('12345678901', request, 'ADMIN001', '192.168.1.1')
      ).rejects.toThrow(ConcurrentModificationException);
    });

    it('should log failure when error occurs during update', async () => {
      const request = {
        newStatus: AccountStatus.SUSPENDED,
        reason: StatusChangeReason.FRAUD_INVESTIGATION,
        notifyCustomer: true,
      };

      mockRepository.findById.mockResolvedValue(mockAccount);
      mockRepository.updateStatus.mockRejectedValue(new Error('Database error'));
      mockRepository.getAccountCards.mockResolvedValue([]);

      await expect(
        service.updateAccountStatus('12345678901', request, 'ADMIN001', '192.168.1.1')
      ).rejects.toThrow();

      expect(mockAuditService.logFailure).toHaveBeenCalled();
    });
  });

  describe('updateAccountStatus - Notification handling', () => {
    it('should set notificationSent to false when notification fails', async () => {
      const request = {
        newStatus: AccountStatus.SUSPENDED,
        reason: StatusChangeReason.FRAUD_INVESTIGATION,
        notifyCustomer: true,
      };

      mockRepository.findById.mockResolvedValue(mockAccount);
      mockRepository.updateStatus.mockResolvedValue(true);
      mockRepository.createStatusHistory.mockResolvedValue('hist-123');
      mockRepository.getAccountCards.mockResolvedValue([]);
      mockNotificationService.sendStatusChangeNotification.mockResolvedValue(false);

      const result = await service.updateAccountStatus(
        '12345678901',
        request,
        'ADMIN001',
        '192.168.1.1'
      );

      expect(result.notificationSent).toBe(false);
    });

    it('should not send notification when notifyCustomer is false', async () => {
      const request = {
        newStatus: AccountStatus.SUSPENDED,
        reason: StatusChangeReason.SYSTEM_MAINTENANCE,
        notifyCustomer: false,
      };

      mockRepository.findById.mockResolvedValue(mockAccount);
      mockRepository.updateStatus.mockResolvedValue(true);
      mockRepository.createStatusHistory.mockResolvedValue('hist-456');
      mockRepository.getAccountCards.mockResolvedValue([]);

      await service.updateAccountStatus('12345678901', request, 'ADMIN001', '192.168.1.1');

      expect(mockNotificationService.sendStatusChangeNotification).not.toHaveBeenCalled();
    });
  });

  describe('updateAccountStatus - Cascading logic', () => {
    it('should cascade status when account becomes inactive', async () => {
      const request = {
        newStatus: AccountStatus.INACTIVE,
        reason: StatusChangeReason.CUSTOMER_REQUEST,
        notifyCustomer: false,
      };

      mockRepository.findById.mockResolvedValue(mockAccount);
      mockRepository.updateStatus.mockResolvedValue(true);
      mockRepository.createStatusHistory.mockResolvedValue('hist-cascade');
      mockRepository.getAccountCards.mockResolvedValue([
        { cardNumber: '1234567890123456', status: 'active' },
      ]);
      mockRepository.cascadeCardsStatus.mockResolvedValue(1);

      await service.updateAccountStatus('12345678901', request, 'ADMIN001', '192.168.1.1');

      expect(mockRepository.cascadeCardsStatus).toHaveBeenCalledWith(
        '12345678901',
        AccountStatus.INACTIVE
      );
    });

    it('should cascade status when account becomes suspended', async () => {
      const request = {
        newStatus: AccountStatus.SUSPENDED,
        reason: StatusChangeReason.FRAUD_INVESTIGATION,
        notifyCustomer: false,
      };

      mockRepository.findById.mockResolvedValue(mockAccount);
      mockRepository.updateStatus.mockResolvedValue(true);
      mockRepository.createStatusHistory.mockResolvedValue('hist-suspend');
      mockRepository.getAccountCards.mockResolvedValue([
        { cardNumber: '1111222233334444', status: 'active' },
      ]);
      mockRepository.cascadeCardsStatus.mockResolvedValue(1);

      await service.updateAccountStatus('12345678901', request, 'ADMIN001', '192.168.1.1');

      expect(mockRepository.cascadeCardsStatus).toHaveBeenCalledWith(
        '12345678901',
        AccountStatus.SUSPENDED
      );
    });

    it('should not cascade status when account becomes active', async () => {
      const suspendedAccount = { ...mockAccount, accountStatus: AccountStatus.SUSPENDED };
      const request = {
        newStatus: AccountStatus.ACTIVE,
        reason: StatusChangeReason.CUSTOMER_REQUEST,
        notifyCustomer: false,
      };

      mockRepository.findById.mockResolvedValue(suspendedAccount);
      mockRepository.updateStatus.mockResolvedValue(true);
      mockRepository.createStatusHistory.mockResolvedValue('hist-active');
      mockRepository.getAccountCards.mockResolvedValue([]);

      await service.updateAccountStatus('12345678901', request, 'ADMIN001', '192.168.1.1');

      expect(mockRepository.cascadeCardsStatus).not.toHaveBeenCalled();
    });
  });

  describe('updateAccountStatus - Audit logging', () => {
    it('should log successful status change', async () => {
      const request = {
        newStatus: AccountStatus.SUSPENDED,
        reason: StatusChangeReason.FRAUD_INVESTIGATION,
        notifyCustomer: true,
      };

      mockRepository.findById.mockResolvedValue(mockAccount);
      mockRepository.updateStatus.mockResolvedValue(true);
      mockRepository.createStatusHistory.mockResolvedValue('hist-audit');
      mockRepository.getAccountCards.mockResolvedValue([]);
      mockNotificationService.sendStatusChangeNotification.mockResolvedValue(true);

      await service.updateAccountStatus('12345678901', request, 'ADMIN001', '192.168.1.1');

      expect(mockAuditService.logStatusChange).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'ACCOUNT_STATUS_CHANGED',
          accountId: '12345678901',
          userId: 'ADMIN001',
          action: 'UPDATE_STATUS',
          previousValue: AccountStatus.ACTIVE,
          newValue: AccountStatus.SUSPENDED,
          success: true,
        })
      );
    });
  });
});
