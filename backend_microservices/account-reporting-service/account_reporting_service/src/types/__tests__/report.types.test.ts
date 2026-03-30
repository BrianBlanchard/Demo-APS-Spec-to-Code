import { ReportType, ReportFormat, AccountStatus } from '../report.types';

describe('report.types', () => {
  describe('ReportType', () => {
    it('should have ACCOUNT_STATUS value', () => {
      expect(ReportType.ACCOUNT_STATUS).toBe('account_status');
    });

    it('should have CREDIT_UTILIZATION value', () => {
      expect(ReportType.CREDIT_UTILIZATION).toBe('credit_utilization');
    });

    it('should have DELINQUENCY value', () => {
      expect(ReportType.DELINQUENCY).toBe('delinquency');
    });

    it('should have MONTHLY_STATEMENT value', () => {
      expect(ReportType.MONTHLY_STATEMENT).toBe('monthly_statement');
    });

    it('should have exactly 4 report types', () => {
      const keys = Object.keys(ReportType);
      expect(keys).toHaveLength(4);
    });
  });

  describe('ReportFormat', () => {
    it('should have CSV value', () => {
      expect(ReportFormat.CSV).toBe('csv');
    });

    it('should have JSON value', () => {
      expect(ReportFormat.JSON).toBe('json');
    });

    it('should have PDF value', () => {
      expect(ReportFormat.PDF).toBe('pdf');
    });

    it('should have exactly 3 formats', () => {
      const keys = Object.keys(ReportFormat);
      expect(keys).toHaveLength(3);
    });
  });

  describe('AccountStatus', () => {
    it('should have ACTIVE value', () => {
      expect(AccountStatus.ACTIVE).toBe('active');
    });

    it('should have SUSPENDED value', () => {
      expect(AccountStatus.SUSPENDED).toBe('suspended');
    });

    it('should have CLOSED value', () => {
      expect(AccountStatus.CLOSED).toBe('closed');
    });

    it('should have exactly 3 statuses', () => {
      const keys = Object.keys(AccountStatus);
      expect(keys).toHaveLength(3);
    });
  });
});
