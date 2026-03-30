import { MessageType, Priority, SmsStatus } from '../enums';

describe('MessageType Enum', () => {
  it('should have fraud_alert value', () => {
    expect(MessageType.FRAUD_ALERT).toBe('fraud_alert');
  });

  it('should have otp value', () => {
    expect(MessageType.OTP).toBe('otp');
  });

  it('should have transaction_confirmation value', () => {
    expect(MessageType.TRANSACTION_CONFIRMATION).toBe('transaction_confirmation');
  });

  it('should have account_status value', () => {
    expect(MessageType.ACCOUNT_STATUS).toBe('account_status');
  });

  it('should have exactly 4 values', () => {
    const values = Object.values(MessageType);
    expect(values.length).toBe(4);
  });

  it('should contain all expected values', () => {
    const values = Object.values(MessageType);
    expect(values).toContain('fraud_alert');
    expect(values).toContain('otp');
    expect(values).toContain('transaction_confirmation');
    expect(values).toContain('account_status');
  });
});

describe('Priority Enum', () => {
  it('should have critical value', () => {
    expect(Priority.CRITICAL).toBe('critical');
  });

  it('should have high value', () => {
    expect(Priority.HIGH).toBe('high');
  });

  it('should have medium value', () => {
    expect(Priority.MEDIUM).toBe('medium');
  });

  it('should have low value', () => {
    expect(Priority.LOW).toBe('low');
  });

  it('should have exactly 4 values', () => {
    const values = Object.values(Priority);
    expect(values.length).toBe(4);
  });

  it('should contain all expected values', () => {
    const values = Object.values(Priority);
    expect(values).toContain('critical');
    expect(values).toContain('high');
    expect(values).toContain('medium');
    expect(values).toContain('low');
  });
});

describe('SmsStatus Enum', () => {
  it('should have sent value', () => {
    expect(SmsStatus.SENT).toBe('sent');
  });

  it('should have failed value', () => {
    expect(SmsStatus.FAILED).toBe('failed');
  });

  it('should have queued value', () => {
    expect(SmsStatus.QUEUED).toBe('queued');
  });

  it('should have opted_out value', () => {
    expect(SmsStatus.OPTED_OUT).toBe('opted_out');
  });

  it('should have exactly 4 values', () => {
    const values = Object.values(SmsStatus);
    expect(values.length).toBe(4);
  });

  it('should contain all expected values', () => {
    const values = Object.values(SmsStatus);
    expect(values).toContain('sent');
    expect(values).toContain('failed');
    expect(values).toContain('queued');
    expect(values).toContain('opted_out');
  });
});
