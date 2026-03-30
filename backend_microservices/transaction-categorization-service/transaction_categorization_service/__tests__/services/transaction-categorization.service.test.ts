import { TransactionCategorizationService } from '../../src/services/transaction-categorization.service';
import type { ITransactionCategoryRepository } from '../../src/repositories/transaction-category.repository';
import type { IAuditService } from '../../src/services/audit.service';
import type { CategorizeRequest } from '../../src/dto/categorize-request.dto';
import type { TransactionCategory } from '../../src/entities/transaction-category.entity';

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import logger from '../../src/utils/logger';

describe('TransactionCategorizationService', () => {
  let service: TransactionCategorizationService;
  let mockRepository: ITransactionCategoryRepository;
  let mockAuditService: IAuditService;

  beforeEach(() => {
    mockRepository = {
      findByMcc: jest.fn(),
      checkDatabaseHealth: jest.fn(),
    };

    mockAuditService = {
      logOperation: jest.fn(),
    };

    service = new TransactionCategorizationService(mockRepository, mockAuditService);
    jest.clearAllMocks();
  });

  describe('categorizeTransaction - Known MCC', () => {
    it('should categorize transaction with known MCC', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Test Restaurant',
        amount: 50.0,
        description: 'Lunch payment',
      };

      const category: TransactionCategory = {
        categoryCode: '5812',
        categoryName: 'Eating Places and Restaurants',
        transactionType: '01',
        categoryGroup: 'dining',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 2.0,
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(category);

      const result = await service.categorizeTransaction(request);

      expect(result).toEqual({
        transactionType: '01',
        transactionTypeName: 'Purchase',
        transactionCategory: '5812',
        categoryName: 'Eating Places and Restaurants',
        categoryGroup: 'dining',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 2.0,
      });
    });

    it('should call repository with correct MCC', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '5411',
        merchantName: 'Grocery Store',
        amount: 100.0,
        description: 'Groceries',
      };

      const category: TransactionCategory = {
        categoryCode: '5411',
        categoryName: 'Grocery Stores and Supermarkets',
        transactionType: '01',
        categoryGroup: 'groceries',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 3.0,
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(category);

      await service.categorizeTransaction(request);

      expect(mockRepository.findByMcc).toHaveBeenCalledWith('5411');
    });

    it('should log categorization attempt', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Test Restaurant',
        amount: 50.0,
        description: 'Lunch payment',
      };

      const category: TransactionCategory = {
        categoryCode: '5812',
        categoryName: 'Eating Places and Restaurants',
        transactionType: '01',
        categoryGroup: 'dining',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 2.0,
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(category);

      await service.categorizeTransaction(request);

      expect(logger.info).toHaveBeenCalledWith(
        { mcc: '5812' },
        'Categorizing transaction'
      );
    });

    it('should log successful categorization', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Test Restaurant',
        amount: 50.0,
        description: 'Lunch payment',
      };

      const category: TransactionCategory = {
        categoryCode: '5812',
        categoryName: 'Eating Places and Restaurants',
        transactionType: '01',
        categoryGroup: 'dining',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 2.0,
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(category);

      await service.categorizeTransaction(request);

      expect(logger.info).toHaveBeenCalledWith(
        {
          mcc: '5812',
          category: 'Eating Places and Restaurants',
        },
        'Transaction categorized successfully'
      );
    });

    it('should audit successful operation', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Test Restaurant',
        amount: 50.0,
        description: 'Lunch payment',
      };

      const category: TransactionCategory = {
        categoryCode: '5812',
        categoryName: 'Eating Places and Restaurants',
        transactionType: '01',
        categoryGroup: 'dining',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 2.0,
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(category);

      await service.categorizeTransaction(request);

      expect(mockAuditService.logOperation).toHaveBeenCalledWith(
        'categorize_transaction',
        'success',
        {
          merchantCategoryCode: '5812',
          merchantName: 'Test Restaurant',
          amount: 50.0,
        }
      );
    });
  });

  describe('categorizeTransaction - Unknown MCC', () => {
    it('should return default category for unknown MCC', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '9999',
        merchantName: 'Unknown Merchant',
        amount: 100.0,
        description: 'Unknown transaction',
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(null);

      const result = await service.categorizeTransaction(request);

      expect(result).toEqual({
        transactionType: '01',
        transactionTypeName: 'Purchase',
        transactionCategory: '9999',
        categoryName: 'Other',
        categoryGroup: 'other',
        interestRate: 19.99,
        rewardsEligible: false,
        rewardsRate: 0.0,
      });
    });

    it('should log warning for unknown MCC', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '9999',
        merchantName: 'Unknown Merchant',
        amount: 100.0,
        description: 'Unknown transaction',
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(null);

      await service.categorizeTransaction(request);

      expect(logger.warn).toHaveBeenCalledWith(
        { mcc: '9999' },
        'Unknown MCC, assigning default category'
      );
    });

    it('should audit unknown MCC operation', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '9999',
        merchantName: 'Unknown Merchant',
        amount: 100.0,
        description: 'Unknown transaction',
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(null);

      await service.categorizeTransaction(request);

      expect(mockAuditService.logOperation).toHaveBeenCalledWith(
        'unknown_mcc',
        'success',
        {
          merchantCategoryCode: '9999',
          assignedCategory: '9999',
        },
        'MCC not found in mapping table'
      );
    });

    it('should audit categorize_transaction for unknown MCC', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '9999',
        merchantName: 'Unknown Merchant',
        amount: 100.0,
        description: 'Unknown transaction',
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(null);

      await service.categorizeTransaction(request);

      expect(mockAuditService.logOperation).toHaveBeenCalledWith(
        'categorize_transaction',
        'success',
        expect.any(Object)
      );
    });
  });

  describe('Transaction type mapping', () => {
    it('should map transaction type 01 to Purchase', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Test',
        amount: 50.0,
        description: 'Test',
      };

      const category: TransactionCategory = {
        categoryCode: '5812',
        categoryName: 'Test Category',
        transactionType: '01',
        categoryGroup: 'test',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 2.0,
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(category);

      const result = await service.categorizeTransaction(request);

      expect(result.transactionType).toBe('01');
      expect(result.transactionTypeName).toBe('Purchase');
    });

    it('should map transaction type 02 to Cash Advance', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '6011',
        merchantName: 'ATM',
        amount: 100.0,
        description: 'Cash withdrawal',
      };

      const category: TransactionCategory = {
        categoryCode: '6011',
        categoryName: 'ATM',
        transactionType: '02',
        categoryGroup: 'cash',
        interestRate: 24.99,
        rewardsEligible: false,
        rewardsRate: 0.0,
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(category);

      const result = await service.categorizeTransaction(request);

      expect(result.transactionType).toBe('02');
      expect(result.transactionTypeName).toBe('Cash Advance');
    });

    it('should map transaction type 03 to Balance Transfer', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '0000',
        merchantName: 'Transfer',
        amount: 500.0,
        description: 'Balance transfer',
      };

      const category: TransactionCategory = {
        categoryCode: '0000',
        categoryName: 'Balance Transfer',
        transactionType: '03',
        categoryGroup: 'transfer',
        interestRate: 15.99,
        rewardsEligible: false,
        rewardsRate: 0.0,
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(category);

      const result = await service.categorizeTransaction(request);

      expect(result.transactionType).toBe('03');
      expect(result.transactionTypeName).toBe('Balance Transfer');
    });

    it('should map transaction type 04 to Payment', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '0001',
        merchantName: 'Payment',
        amount: 200.0,
        description: 'Payment',
      };

      const category: TransactionCategory = {
        categoryCode: '0001',
        categoryName: 'Payment',
        transactionType: '04',
        categoryGroup: 'payment',
        interestRate: 0.0,
        rewardsEligible: false,
        rewardsRate: 0.0,
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(category);

      const result = await service.categorizeTransaction(request);

      expect(result.transactionType).toBe('04');
      expect(result.transactionTypeName).toBe('Payment');
    });

    it('should map transaction type 05 to Fee', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '0002',
        merchantName: 'Fee',
        amount: 35.0,
        description: 'Late fee',
      };

      const category: TransactionCategory = {
        categoryCode: '0002',
        categoryName: 'Late Fee',
        transactionType: '05',
        categoryGroup: 'fee',
        interestRate: 0.0,
        rewardsEligible: false,
        rewardsRate: 0.0,
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(category);

      const result = await service.categorizeTransaction(request);

      expect(result.transactionType).toBe('05');
      expect(result.transactionTypeName).toBe('Fee');
    });

    it('should map transaction type 06 to Interest', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '0003',
        merchantName: 'Interest',
        amount: 15.5,
        description: 'Interest charge',
      };

      const category: TransactionCategory = {
        categoryCode: '0003',
        categoryName: 'Interest Charge',
        transactionType: '06',
        categoryGroup: 'interest',
        interestRate: 0.0,
        rewardsEligible: false,
        rewardsRate: 0.0,
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(category);

      const result = await service.categorizeTransaction(request);

      expect(result.transactionType).toBe('06');
      expect(result.transactionTypeName).toBe('Interest');
    });

    it('should map unknown transaction type to Unknown', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Test',
        amount: 50.0,
        description: 'Test',
      };

      const category: TransactionCategory = {
        categoryCode: '5812',
        categoryName: 'Test Category',
        transactionType: '99',
        categoryGroup: 'test',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 2.0,
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(category);

      const result = await service.categorizeTransaction(request);

      expect(result.transactionType).toBe('99');
      expect(result.transactionTypeName).toBe('Unknown');
    });
  });

  describe('Response mapping', () => {
    it('should include all required fields in response', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Test Restaurant',
        amount: 50.0,
        description: 'Lunch payment',
      };

      const category: TransactionCategory = {
        categoryCode: '5812',
        categoryName: 'Eating Places and Restaurants',
        transactionType: '01',
        categoryGroup: 'dining',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 2.0,
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(category);

      const result = await service.categorizeTransaction(request);

      expect(result).toHaveProperty('transactionType');
      expect(result).toHaveProperty('transactionTypeName');
      expect(result).toHaveProperty('transactionCategory');
      expect(result).toHaveProperty('categoryName');
      expect(result).toHaveProperty('categoryGroup');
      expect(result).toHaveProperty('interestRate');
      expect(result).toHaveProperty('rewardsEligible');
      expect(result).toHaveProperty('rewardsRate');
    });

    it('should preserve category code in response', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '5411',
        merchantName: 'Grocery',
        amount: 100.0,
        description: 'Groceries',
      };

      const category: TransactionCategory = {
        categoryCode: '5411',
        categoryName: 'Grocery Stores',
        transactionType: '01',
        categoryGroup: 'groceries',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 3.0,
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(category);

      const result = await service.categorizeTransaction(request);

      expect(result.transactionCategory).toBe('5411');
    });

    it('should preserve all numeric values', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Test',
        amount: 50.0,
        description: 'Test',
      };

      const category: TransactionCategory = {
        categoryCode: '5812',
        categoryName: 'Test Category',
        transactionType: '01',
        categoryGroup: 'test',
        interestRate: 21.75,
        rewardsEligible: true,
        rewardsRate: 1.5,
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(category);

      const result = await service.categorizeTransaction(request);

      expect(result.interestRate).toBe(21.75);
      expect(result.rewardsRate).toBe(1.5);
    });

    it('should preserve boolean values', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Test',
        amount: 50.0,
        description: 'Test',
      };

      const category: TransactionCategory = {
        categoryCode: '5812',
        categoryName: 'Test Category',
        transactionType: '01',
        categoryGroup: 'test',
        interestRate: 19.99,
        rewardsEligible: false,
        rewardsRate: 0.0,
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(category);

      const result = await service.categorizeTransaction(request);

      expect(result.rewardsEligible).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle MCC with leading zeros', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '0001',
        merchantName: 'Test',
        amount: 50.0,
        description: 'Test',
      };

      const category: TransactionCategory = {
        categoryCode: '0001',
        categoryName: 'Test Category',
        transactionType: '01',
        categoryGroup: 'test',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 2.0,
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(category);

      const result = await service.categorizeTransaction(request);

      expect(result.transactionCategory).toBe('0001');
    });

    it('should handle zero interest rate', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Test',
        amount: 50.0,
        description: 'Test',
      };

      const category: TransactionCategory = {
        categoryCode: '5812',
        categoryName: 'Test Category',
        transactionType: '01',
        categoryGroup: 'test',
        interestRate: 0.0,
        rewardsEligible: true,
        rewardsRate: 2.0,
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(category);

      const result = await service.categorizeTransaction(request);

      expect(result.interestRate).toBe(0.0);
    });

    it('should handle zero rewards rate', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Test',
        amount: 50.0,
        description: 'Test',
      };

      const category: TransactionCategory = {
        categoryCode: '5812',
        categoryName: 'Test Category',
        transactionType: '01',
        categoryGroup: 'test',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 0.0,
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(category);

      const result = await service.categorizeTransaction(request);

      expect(result.rewardsRate).toBe(0.0);
    });

    it('should handle high interest rate', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '6011',
        merchantName: 'ATM',
        amount: 100.0,
        description: 'Cash advance',
      };

      const category: TransactionCategory = {
        categoryCode: '6011',
        categoryName: 'ATM',
        transactionType: '02',
        categoryGroup: 'cash',
        interestRate: 29.99,
        rewardsEligible: false,
        rewardsRate: 0.0,
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(category);

      const result = await service.categorizeTransaction(request);

      expect(result.interestRate).toBe(29.99);
    });

    it('should handle high rewards rate', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Restaurant',
        amount: 50.0,
        description: 'Dining',
      };

      const category: TransactionCategory = {
        categoryCode: '5812',
        categoryName: 'Restaurant',
        transactionType: '01',
        categoryGroup: 'dining',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 5.0,
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(category);

      const result = await service.categorizeTransaction(request);

      expect(result.rewardsRate).toBe(5.0);
    });
  });

  describe('Audit logging', () => {
    it('should audit with sensitive data for masking', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Test Restaurant',
        amount: 50.0,
        description: 'Lunch payment',
      };

      const category: TransactionCategory = {
        categoryCode: '5812',
        categoryName: 'Test Category',
        transactionType: '01',
        categoryGroup: 'test',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 2.0,
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(category);

      await service.categorizeTransaction(request);

      expect(mockAuditService.logOperation).toHaveBeenCalledWith(
        'categorize_transaction',
        'success',
        expect.objectContaining({
          merchantName: 'Test Restaurant',
          amount: 50.0,
        })
      );
    });

    it('should call audit service exactly once for known MCC', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Test',
        amount: 50.0,
        description: 'Test',
      };

      const category: TransactionCategory = {
        categoryCode: '5812',
        categoryName: 'Test Category',
        transactionType: '01',
        categoryGroup: 'test',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 2.0,
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(category);

      await service.categorizeTransaction(request);

      expect(mockAuditService.logOperation).toHaveBeenCalledTimes(1);
    });

    it('should call audit service twice for unknown MCC', async () => {
      const request: CategorizeRequest = {
        merchantCategoryCode: '9999',
        merchantName: 'Unknown',
        amount: 100.0,
        description: 'Unknown',
      };

      (mockRepository.findByMcc as jest.Mock).mockResolvedValue(null);

      await service.categorizeTransaction(request);

      expect(mockAuditService.logOperation).toHaveBeenCalledTimes(2);
    });
  });
});
