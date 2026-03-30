import { CardStatus } from '../card-status.type';

describe('CardStatus', () => {
  it('should have ACTIVE status', () => {
    expect(CardStatus.ACTIVE).toBe('active');
  });

  it('should have INACTIVE status', () => {
    expect(CardStatus.INACTIVE).toBe('inactive');
  });

  it('should have BLOCKED status', () => {
    expect(CardStatus.BLOCKED).toBe('blocked');
  });

  it('should have EXPIRED status', () => {
    expect(CardStatus.EXPIRED).toBe('expired');
  });

  it('should have exactly 4 statuses', () => {
    const statuses = Object.values(CardStatus);
    expect(statuses).toHaveLength(4);
  });

  it('should contain only expected status values', () => {
    const statuses = Object.values(CardStatus);
    expect(statuses).toEqual(
      expect.arrayContaining(['active', 'inactive', 'blocked', 'expired'])
    );
  });
});
