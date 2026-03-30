import { AccountStatus } from '../../src/types/billing.types';

describe('Billing Types', () => {
  describe('AccountStatus Enum', () => {
    it('should have ACTIVE status', () => {
      expect(AccountStatus.ACTIVE).toBe('ACTIVE');
    });

    it('should have CLOSED status', () => {
      expect(AccountStatus.CLOSED).toBe('CLOSED');
    });

    it('should have SUSPENDED status', () => {
      expect(AccountStatus.SUSPENDED).toBe('SUSPENDED');
    });

    it('should have exactly 3 statuses', () => {
      const statuses = Object.values(AccountStatus);
      expect(statuses).toHaveLength(3);
    });

    it('should contain only expected statuses', () => {
      const statuses = Object.values(AccountStatus);
      expect(statuses).toEqual(
        expect.arrayContaining(['ACTIVE', 'CLOSED', 'SUSPENDED'])
      );
    });
  });
});
