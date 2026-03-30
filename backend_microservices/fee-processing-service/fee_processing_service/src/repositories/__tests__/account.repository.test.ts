import { AccountRepository } from '../account.repository';
import { Knex } from 'knex';

describe('AccountRepository', () => {
  let accountRepository: AccountRepository;
  let mockDb: jest.Mocked<Partial<Knex>>;
  let mockQueryBuilder: any;

  beforeEach(() => {
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      first: jest.fn(),
      update: jest.fn(),
    };

    mockDb = jest.fn().mockReturnValue(mockQueryBuilder) as any;
    mockDb.fn = {
      now: jest.fn().mockReturnValue('NOW()'),
    } as any;

    accountRepository = new AccountRepository(mockDb as Knex);
  });

  describe('findById', () => {
    it('should return account when found', async () => {
      const mockRow = {
        account_id: '12345678901',
        balance: 1000.0,
        credit_limit: 5000.0,
        status: 'active',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-15'),
      };

      mockQueryBuilder.first.mockResolvedValue(mockRow);

      const result = await accountRepository.findById('12345678901');

      expect(result).toEqual({
        accountId: '12345678901',
        balance: 1000.0,
        creditLimit: 5000.0,
        status: 'active',
        createdAt: mockRow.created_at,
        updatedAt: mockRow.updated_at,
      });

      expect(mockDb).toHaveBeenCalledWith('accounts');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ account_id: '12345678901' });
    });

    it('should return null when account not found', async () => {
      mockQueryBuilder.first.mockResolvedValue(undefined);

      const result = await accountRepository.findById('99999999999');

      expect(result).toBeNull();
    });
  });

  describe('updateBalance', () => {
    it('should update account balance', async () => {
      mockQueryBuilder.update.mockResolvedValue(1);

      await accountRepository.updateBalance('12345678901', 1500.0);

      expect(mockDb).toHaveBeenCalledWith('accounts');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ account_id: '12345678901' });
      expect(mockQueryBuilder.update).toHaveBeenCalledWith({
        balance: 1500.0,
        updated_at: 'NOW()',
      });
    });
  });
});
