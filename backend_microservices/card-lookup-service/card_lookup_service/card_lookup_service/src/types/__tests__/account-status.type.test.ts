import { AccountStatus } from '../account-status.type';

describe('AccountStatus', () => {
  it('should have ACTIVE status', () => {
    expect(AccountStatus.ACTIVE).toBe('active');
  });

  it('should have INACTIVE status', () => {
    expect(AccountStatus.INACTIVE).toBe('inactive');
  });

  it('should have CLOSED status', () => {
    expect(AccountStatus.CLOSED).toBe('closed');
  });

  it('should have SUSPENDED status', () => {
    expect(AccountStatus.SUSPENDED).toBe('suspended');
  });

  it('should have exactly 4 statuses', () => {
    const statuses = Object.values(AccountStatus);
    expect(statuses).toHaveLength(4);
  });

  it('should contain only expected status values', () => {
    const statuses = Object.values(AccountStatus);
    expect(statuses).toEqual(
      expect.arrayContaining(['active', 'inactive', 'closed', 'suspended'])
    );
  });
});
