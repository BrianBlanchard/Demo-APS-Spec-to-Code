import { CardStatus } from '../../src/types/card-status.enum';

describe('CardStatus', () => {
  it('should have ISSUED status', () => {
    expect(CardStatus.ISSUED).toBe('Issued');
  });

  it('should have ACTIVE status', () => {
    expect(CardStatus.ACTIVE).toBe('Active');
  });

  it('should have SUSPENDED status', () => {
    expect(CardStatus.SUSPENDED).toBe('Suspended');
  });

  it('should have CLOSED status', () => {
    expect(CardStatus.CLOSED).toBe('Closed');
  });

  it('should have exactly 4 statuses', () => {
    const statuses = Object.values(CardStatus);
    expect(statuses).toHaveLength(4);
  });

  it('should contain all expected status values', () => {
    const statuses = Object.values(CardStatus);
    expect(statuses).toContain('Issued');
    expect(statuses).toContain('Active');
    expect(statuses).toContain('Suspended');
    expect(statuses).toContain('Closed');
  });
});
