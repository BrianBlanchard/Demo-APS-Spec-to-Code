import { BillingCycleService } from '../../src/services/billing-cycle.service';
import { IAccountRepository } from '../../src/repositories/account.repository';
import { ICycleArchiveRepository } from '../../src/repositories/cycle-archive.repository';
import { IAuditService } from '../../src/services/audit.service';
import { Account, AccountStatus, CycleArchive } from '../../src/types/billing.types';
import { BusinessLogicError } from '../../src/utils/errors.util';

describe('BillingCycleService', () => {
  let service: BillingCycleService;
  let mockAccountRepo: jest.Mocked<IAccountRepository>;
  let mockCycleArchiveRepo: jest.Mocked<ICycleArchiveRepository>;
  let mockAuditService: jest.Mocked<IAuditService>;

  beforeEach(() => {
    mockAccountRepo = {
      findActiveAccounts: jest.fn(),
      findById: jest.fn(),
      resetCycleCounters: jest.fn(),
    };

    mockCycleArchiveRepo = {
      create: jest.fn(),
      findByBillingCycle: jest.fn(),
    };

    mockAuditService = {
      logSuccess: jest.fn(),
      logFailure: jest.fn(),
      logRetry: jest.fn(),
    };

    service = new BillingCycleService(
      mockAccountRepo,
      mockCycleArchiveRepo,
      mockAuditService
    );
  });

  describe('closeCycle', () => {
    const validRequest = {
      billingCycleEnd: '2024-01-31',
      processingDate: '2024-02-01',
    };

    it('should successfully close cycle for active accounts', async () => {
      const mockAccounts: Account[] = [
        {
          id: '1',
          accountNumber: '123456',
          currentCycleCredit: 100,
          currentCycleDebit: 500,
          status: AccountStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockAccountRepo.findActiveAccounts.mockResolvedValue(mockAccounts);
      mockCycleArchiveRepo.create.mockResolvedValue({} as CycleArchive);
      mockAccountRepo.resetCycleCounters.mockResolvedValue();

      const result = await service.closeCycle(validRequest);

      expect(result.billingCycle).toBe('2024-01');
      expect(result.accountsProcessed).toBe(1);
      expect(result.statementsGenerated).toBe(1);
      expect(result.totalInterestCharged).toBeGreaterThan(0);
      expect(mockAuditService.logSuccess).toHaveBeenCalled();
    });

    it('should throw error when no active accounts found', async () => {
      mockAccountRepo.findActiveAccounts.mockResolvedValue([]);

      await expect(service.closeCycle(validRequest)).rejects.toThrow(BusinessLogicError);
      await expect(service.closeCycle(validRequest)).rejects.toThrow('No active accounts found');
    });

    it('should process multiple accounts', async () => {
      const mockAccounts: Account[] = [
        {
          id: '1',
          accountNumber: '123',
          currentCycleCredit: 100,
          currentCycleDebit: 500,
          status: AccountStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          accountNumber: '456',
          currentCycleCredit: 200,
          currentCycleDebit: 300,
          status: AccountStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockAccountRepo.findActiveAccounts.mockResolvedValue(mockAccounts);
      mockCycleArchiveRepo.create.mockResolvedValue({} as CycleArchive);
      mockAccountRepo.resetCycleCounters.mockResolvedValue();

      const result = await service.closeCycle(validRequest);

      expect(result.accountsProcessed).toBe(2);
      expect(mockCycleArchiveRepo.create).toHaveBeenCalledTimes(2);
      expect(mockAccountRepo.resetCycleCounters).toHaveBeenCalledTimes(2);
    });

    it('should calculate interest correctly', async () => {
      const mockAccounts: Account[] = [
        {
          id: '1',
          accountNumber: '123',
          currentCycleCredit: 0,
          currentCycleDebit: 1200,
          status: AccountStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockAccountRepo.findActiveAccounts.mockResolvedValue(mockAccounts);
      mockCycleArchiveRepo.create.mockResolvedValue({} as CycleArchive);
      mockAccountRepo.resetCycleCounters.mockResolvedValue();

      const result = await service.closeCycle(validRequest);

      // 1200 * 0.18 / 12 = 18.00
      expect(result.totalInterestCharged).toBe(18.00);
    });

    it('should assess late fees for accounts with balance > 100', async () => {
      const mockAccounts: Account[] = [
        {
          id: '1',
          accountNumber: '123',
          currentCycleCredit: 0,
          currentCycleDebit: 200,
          status: AccountStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockAccountRepo.findActiveAccounts.mockResolvedValue(mockAccounts);
      mockCycleArchiveRepo.create.mockResolvedValue({} as CycleArchive);
      mockAccountRepo.resetCycleCounters.mockResolvedValue();

      const result = await service.closeCycle(validRequest);

      expect(result.totalFeesCharged).toBe(25.00);
    });

    it('should not assess fees when balance is less than 100', async () => {
      const mockAccounts: Account[] = [
        {
          id: '1',
          accountNumber: '123',
          currentCycleCredit: 0,
          currentCycleDebit: 50,
          status: AccountStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockAccountRepo.findActiveAccounts.mockResolvedValue(mockAccounts);
      mockCycleArchiveRepo.create.mockResolvedValue({} as CycleArchive);
      mockAccountRepo.resetCycleCounters.mockResolvedValue();

      const result = await service.closeCycle(validRequest);

      expect(result.totalFeesCharged).toBe(0);
    });

    it('should handle account processing failures gracefully', async () => {
      const mockAccounts: Account[] = [
        {
          id: '1',
          accountNumber: '123',
          currentCycleCredit: 100,
          currentCycleDebit: 500,
          status: AccountStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          accountNumber: '456',
          currentCycleCredit: 200,
          currentCycleDebit: 300,
          status: AccountStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockAccountRepo.findActiveAccounts.mockResolvedValue(mockAccounts);
      mockCycleArchiveRepo.create
        .mockResolvedValueOnce({} as CycleArchive)
        .mockRejectedValueOnce(new Error('Archive failed'));
      mockAccountRepo.resetCycleCounters.mockResolvedValue();

      const result = await service.closeCycle(validRequest);

      expect(result.accountsProcessed).toBe(1);
      expect(mockAuditService.logFailure).toHaveBeenCalled();
    });
  });
});
