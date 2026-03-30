import { FeeService } from '../fee.service';
import { IAccountRepository } from '../../repositories/account.repository';
import { ITransactionRepository } from '../../repositories/transaction.repository';
import { IAuditService } from '../audit.service';
import { FeeType } from '../../types/fee-types';
import { NotFoundError, BusinessError } from '../../middleware/error-handler.middleware';

describe('FeeService', () => {
  let feeService: FeeService;
  let mockAccountRepository: jest.Mocked<IAccountRepository>;
  let mockTransactionRepository: jest.Mocked<ITransactionRepository>;
  let mockAuditService: jest.Mocked<IAuditService>;

  beforeEach(() => {
    mockAccountRepository = {
      findById: jest.fn(),
      updateBalance: jest.fn(),
    };

    mockTransactionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
    };

    mockAuditService = {
      logFeeAssessment: jest.fn(),
      logFeePosted: jest.fn(),
      logError: jest.fn(),
    };

    feeService = new FeeService(
      mockAccountRepository,
      mockTransactionRepository,
      mockAuditService
    );
  });

  describe('assessFee', () => {
    it('should successfully assess fee for active account', async () => {
      const request = {
        accountId: '12345678901',
        feeType: FeeType.LATE_PAYMENT,
        amount: 35.0,
        reason: 'Payment past due date',
      };

      const mockAccount = {
        accountId: '12345678901',
        balance: 1000.0,
        creditLimit: 5000.0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTransaction = {
        transactionId: '1234567890123456',
        accountId: '12345678901',
        transactionType: '04',
        amount: 35.0,
        description: 'Late payment fee - Payment past due date',
        status: 'posted',
        createdAt: new Date(),
      };

      mockAccountRepository.findById.mockResolvedValue(mockAccount);
      mockTransactionRepository.create.mockResolvedValue(mockTransaction);
      mockAccountRepository.updateBalance.mockResolvedValue();

      const result = await feeService.assessFee(request);

      expect(result).toEqual({
        accountId: '12345678901',
        feeType: FeeType.LATE_PAYMENT,
        amount: 35.0,
        transactionId: '1234567890123456',
        posted: true,
      });

      expect(mockAuditService.logFeeAssessment).toHaveBeenCalledWith({
        accountId: '12345678901',
        feeType: FeeType.LATE_PAYMENT,
        amount: 35.0,
      });

      expect(mockAccountRepository.findById).toHaveBeenCalledWith('12345678901');
      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: '12345678901',
          transactionType: '04',
          amount: 35.0,
          status: 'posted',
        })
      );

      expect(mockAccountRepository.updateBalance).toHaveBeenCalledWith('12345678901', 1035.0);

      expect(mockAuditService.logFeePosted).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: '12345678901',
          transactionId: '1234567890123456',
          feeType: FeeType.LATE_PAYMENT,
          amount: 35.0,
          newBalance: 1035.0,
        })
      );
    });

    it('should throw NotFoundError when account does not exist', async () => {
      const request = {
        accountId: '99999999999',
        feeType: FeeType.LATE_PAYMENT,
        amount: 35.0,
        reason: 'Test',
      };

      mockAccountRepository.findById.mockResolvedValue(null);

      await expect(feeService.assessFee(request)).rejects.toThrow(NotFoundError);
      await expect(feeService.assessFee(request)).rejects.toThrow('Account not found: 99999999999');

      expect(mockAuditService.logFeeAssessment).toHaveBeenCalled();
      expect(mockTransactionRepository.create).not.toHaveBeenCalled();
      expect(mockAccountRepository.updateBalance).not.toHaveBeenCalled();
    });

    it('should throw BusinessError when account is not active', async () => {
      const request = {
        accountId: '12345678901',
        feeType: FeeType.LATE_PAYMENT,
        amount: 35.0,
        reason: 'Test',
      };

      const mockAccount = {
        accountId: '12345678901',
        balance: 1000.0,
        creditLimit: 5000.0,
        status: 'suspended',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAccountRepository.findById.mockResolvedValue(mockAccount);

      await expect(feeService.assessFee(request)).rejects.toThrow(BusinessError);
      await expect(feeService.assessFee(request)).rejects.toThrow('Account is not active: suspended');

      expect(mockTransactionRepository.create).not.toHaveBeenCalled();
      expect(mockAccountRepository.updateBalance).not.toHaveBeenCalled();
    });

    it('should handle all fee types correctly', async () => {
      const feeTypes = [
        FeeType.LATE_PAYMENT,
        FeeType.ANNUAL_FEE,
        FeeType.OVER_LIMIT,
        FeeType.CASH_ADVANCE,
        FeeType.RETURNED_PAYMENT,
      ];

      const mockAccount = {
        accountId: '12345678901',
        balance: 1000.0,
        creditLimit: 5000.0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAccountRepository.findById.mockResolvedValue(mockAccount);

      for (const feeType of feeTypes) {
        const mockTransaction = {
          transactionId: '1234567890123456',
          accountId: '12345678901',
          transactionType: '04',
          amount: 35.0,
          description: 'Test fee',
          status: 'posted',
          createdAt: new Date(),
        };

        mockTransactionRepository.create.mockResolvedValue(mockTransaction);
        mockAccountRepository.updateBalance.mockResolvedValue();

        const request = {
          accountId: '12345678901',
          feeType,
          amount: 35.0,
          reason: 'Test',
        };

        const result = await feeService.assessFee(request);

        expect(result.feeType).toBe(feeType);
        expect(result.posted).toBe(true);
      }
    });

    it('should update account balance correctly', async () => {
      const request = {
        accountId: '12345678901',
        feeType: FeeType.LATE_PAYMENT,
        amount: 50.0,
        reason: 'Test',
      };

      const mockAccount = {
        accountId: '12345678901',
        balance: 500.0,
        creditLimit: 5000.0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTransaction = {
        transactionId: '1234567890123456',
        accountId: '12345678901',
        transactionType: '04',
        amount: 50.0,
        description: 'Test',
        status: 'posted',
        createdAt: new Date(),
      };

      mockAccountRepository.findById.mockResolvedValue(mockAccount);
      mockTransactionRepository.create.mockResolvedValue(mockTransaction);
      mockAccountRepository.updateBalance.mockResolvedValue();

      await feeService.assessFee(request);

      expect(mockAccountRepository.updateBalance).toHaveBeenCalledWith('12345678901', 550.0);
    });

    it('should create transaction with type 04', async () => {
      const request = {
        accountId: '12345678901',
        feeType: FeeType.ANNUAL_FEE,
        amount: 95.0,
        reason: 'Annual maintenance',
      };

      const mockAccount = {
        accountId: '12345678901',
        balance: 0,
        creditLimit: 5000.0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTransaction = {
        transactionId: '1234567890123456',
        accountId: '12345678901',
        transactionType: '04',
        amount: 95.0,
        description: 'Annual account fee - Annual maintenance',
        status: 'posted',
        createdAt: new Date(),
      };

      mockAccountRepository.findById.mockResolvedValue(mockAccount);
      mockTransactionRepository.create.mockResolvedValue(mockTransaction);
      mockAccountRepository.updateBalance.mockResolvedValue();

      await feeService.assessFee(request);

      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionType: '04',
        })
      );
    });

    it('should include fee description with reason', async () => {
      const request = {
        accountId: '12345678901',
        feeType: FeeType.LATE_PAYMENT,
        amount: 35.0,
        reason: 'Payment 30 days overdue',
      };

      const mockAccount = {
        accountId: '12345678901',
        balance: 1000.0,
        creditLimit: 5000.0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTransaction = {
        transactionId: '1234567890123456',
        accountId: '12345678901',
        transactionType: '04',
        amount: 35.0,
        description: 'Late payment fee - Payment 30 days overdue',
        status: 'posted',
        createdAt: new Date(),
      };

      mockAccountRepository.findById.mockResolvedValue(mockAccount);
      mockTransactionRepository.create.mockResolvedValue(mockTransaction);
      mockAccountRepository.updateBalance.mockResolvedValue();

      await feeService.assessFee(request);

      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Late payment fee - Payment 30 days overdue',
        })
      );
    });
  });
});
