import { AccountStatus } from '../../src/types/account-status.enum';

describe('AccountStatus', () => {
  it('should have NEW status', () => {
    expect(AccountStatus.NEW).toBe('New');
  });

  it('should have ACTIVE status', () => {
    expect(AccountStatus.ACTIVE).toBe('Active');
  });

  it('should have SUSPENDED status', () => {
    expect(AccountStatus.SUSPENDED).toBe('Suspended');
  });

  it('should have CLOSED status', () => {
    expect(AccountStatus.CLOSED).toBe('Closed');
  });

  it('should have exactly 4 statuses', () => {
    const statuses = Object.values(AccountStatus);
    expect(statuses).toHaveLength(4);
  });

  it('should contain all expected status values', () => {
    const statuses = Object.values(AccountStatus);
    expect(statuses).toContain('New');
    expect(statuses).toContain('Active');
    expect(statuses).toContain('Suspended');
    expect(statuses).toContain('Closed');
  });
});
