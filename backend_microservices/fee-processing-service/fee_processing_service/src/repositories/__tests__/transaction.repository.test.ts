import { TransactionRepository } from '../transaction.repository';
import { Knex } from 'knex';

describe('TransactionRepository', () => {
  let transactionRepository: TransactionRepository;
  let mockDb: jest.Mocked<Partial<Knex>>;
  let mockQueryBuilder: any;

  beforeEach(() => {
    mockQueryBuilder = {
      insert: jest.fn().mockReturnThis(),
      returning: jest.fn(),
      where: jest.fn().mockReturnThis(),
      first: jest.fn(),
    };

    mockDb = jest.fn().mockReturnValue(mockQueryBuilder) as any;
    mockDb.fn = {
      now: jest.fn().mockReturnValue('NOW()'),
    } as any;

    transactionRepository = new TransactionRepository(mockDb as Knex);
  });

  describe('create', () => {
    it('should create and return transaction', async () => {
      const transaction = {
        transactionId: '1234567890123456',
        accountId: '12345678901',
        transactionType: '04',
        amount: 35.0,
        description: 'Late payment fee',
        status: 'posted',
      };

      const mockRow = {
        transaction_id: '1234567890123456',
        account_id: '12345678901',
        transaction_type: '04',
        amount: 35.0,
        description: 'Late payment fee',
        status: 'posted',
        created_at: new Date('2024-01-15'),
      };

      mockQueryBuilder.returning.mockResolvedValue([mockRow]);

      const result = await transactionRepository.create(transaction);

      expect(result).toEqual({
        transactionId: '1234567890123456',
        accountId: '12345678901',
        transactionType: '04',
        amount: 35.0,
        description: 'Late payment fee',
        status: 'posted',
        createdAt: mockRow.created_at,
      });

      expect(mockDb).toHaveBeenCalledWith('transactions');
      expect(mockQueryBuilder.insert).toHaveBeenCalled();
      expect(mockQueryBuilder.returning).toHaveBeenCalledWith('*');
    });
  });

  describe('findById', () => {
    it('should return transaction when found', async () => {
      const mockRow = {
        transaction_id: '1234567890123456',
        account_id: '12345678901',
        transaction_type: '04',
        amount: 35.0,
        description: 'Late payment fee',
        status: 'posted',
        created_at: new Date('2024-01-15'),
      };

      mockQueryBuilder.first.mockResolvedValue(mockRow);

      const result = await transactionRepository.findById('1234567890123456');

      expect(result).toEqual({
        transactionId: '1234567890123456',
        accountId: '12345678901',
        transactionType: '04',
        amount: 35.0,
        description: 'Late payment fee',
        status: 'posted',
        createdAt: mockRow.created_at,
      });
    });

    it('should return null when transaction not found', async () => {
      mockQueryBuilder.first.mockResolvedValue(undefined);

      const result = await transactionRepository.findById('9999999999999999');

      expect(result).toBeNull();
    });
  });
});
