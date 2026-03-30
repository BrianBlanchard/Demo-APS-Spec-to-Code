import { ReportEntity } from '../report.entity';
import { ReportType, ReportFormat } from '../../types/report.types';

describe('report.entity', () => {
  describe('ReportEntity', () => {
    it('should create a valid report entity with all required fields', () => {
      const report: ReportEntity = {
        reportId: 'RPT-20240131-ABC123',
        reportType: ReportType.ACCOUNT_STATUS,
        asOfDate: new Date('2024-01-31'),
        format: ReportFormat.CSV,
        totalAccounts: 10000,
        activeAccounts: 9500,
        suspendedAccounts: 400,
        closedAccounts: 100,
        downloadUrl: 'https://reports.example.com/RPT-20240131-ABC123.csv',
        createdAt: new Date('2024-01-31T10:30:00Z'),
      };

      expect(report.reportId).toBe('RPT-20240131-ABC123');
      expect(report.reportType).toBe(ReportType.ACCOUNT_STATUS);
      expect(report.asOfDate).toEqual(new Date('2024-01-31'));
      expect(report.format).toBe(ReportFormat.CSV);
      expect(report.totalAccounts).toBe(10000);
      expect(report.activeAccounts).toBe(9500);
      expect(report.suspendedAccounts).toBe(400);
      expect(report.closedAccounts).toBe(100);
      expect(report.downloadUrl).toBe('https://reports.example.com/RPT-20240131-ABC123.csv');
      expect(report.createdAt).toEqual(new Date('2024-01-31T10:30:00Z'));
    });

    it('should create report with credit_utilization type', () => {
      const report: ReportEntity = {
        reportId: 'RPT-20240131-DEF456',
        reportType: ReportType.CREDIT_UTILIZATION,
        asOfDate: new Date('2024-01-31'),
        format: ReportFormat.JSON,
        totalAccounts: 5000,
        activeAccounts: 4800,
        suspendedAccounts: 150,
        closedAccounts: 50,
        downloadUrl: 'https://reports.example.com/RPT-20240131-DEF456.json',
        createdAt: new Date('2024-01-31T11:00:00Z'),
      };

      expect(report.reportType).toBe(ReportType.CREDIT_UTILIZATION);
      expect(report.format).toBe(ReportFormat.JSON);
    });

    it('should create report with delinquency type', () => {
      const report: ReportEntity = {
        reportId: 'RPT-20240131-GHI789',
        reportType: ReportType.DELINQUENCY,
        asOfDate: new Date('2024-01-31'),
        format: ReportFormat.PDF,
        totalAccounts: 1000,
        activeAccounts: 950,
        suspendedAccounts: 40,
        closedAccounts: 10,
        downloadUrl: 'https://reports.example.com/RPT-20240131-GHI789.pdf',
        createdAt: new Date('2024-01-31T12:00:00Z'),
      };

      expect(report.reportType).toBe(ReportType.DELINQUENCY);
      expect(report.format).toBe(ReportFormat.PDF);
    });

    it('should create report with monthly_statement type', () => {
      const report: ReportEntity = {
        reportId: 'RPT-20240131-JKL012',
        reportType: ReportType.MONTHLY_STATEMENT,
        asOfDate: new Date('2024-01-31'),
        format: ReportFormat.CSV,
        totalAccounts: 20000,
        activeAccounts: 19000,
        suspendedAccounts: 800,
        closedAccounts: 200,
        downloadUrl: 'https://reports.example.com/RPT-20240131-JKL012.csv',
        createdAt: new Date('2024-01-31T13:00:00Z'),
      };

      expect(report.reportType).toBe(ReportType.MONTHLY_STATEMENT);
    });

    it('should create report with zero account counts', () => {
      const report: ReportEntity = {
        reportId: 'RPT-20240131-ZERO00',
        reportType: ReportType.ACCOUNT_STATUS,
        asOfDate: new Date('2024-01-31'),
        format: ReportFormat.CSV,
        totalAccounts: 0,
        activeAccounts: 0,
        suspendedAccounts: 0,
        closedAccounts: 0,
        downloadUrl: 'https://reports.example.com/RPT-20240131-ZERO00.csv',
        createdAt: new Date('2024-01-31T14:00:00Z'),
      };

      expect(report.totalAccounts).toBe(0);
      expect(report.activeAccounts).toBe(0);
      expect(report.suspendedAccounts).toBe(0);
      expect(report.closedAccounts).toBe(0);
    });

    it('should create report with different date formats', () => {
      const report: ReportEntity = {
        reportId: 'RPT-20200101-OLD001',
        reportType: ReportType.ACCOUNT_STATUS,
        asOfDate: new Date('2000-01-01'),
        format: ReportFormat.CSV,
        totalAccounts: 100,
        activeAccounts: 90,
        suspendedAccounts: 8,
        closedAccounts: 2,
        downloadUrl: 'https://reports.example.com/RPT-20200101-OLD001.csv',
        createdAt: new Date('2000-01-01T00:00:00Z'),
      };

      expect(report.asOfDate).toEqual(new Date('2000-01-01'));
      expect(report.createdAt).toEqual(new Date('2000-01-01T00:00:00Z'));
    });

    it('should create report with CSV format and appropriate URL', () => {
      const report: ReportEntity = {
        reportId: 'RPT-20240131-CSV001',
        reportType: ReportType.ACCOUNT_STATUS,
        asOfDate: new Date('2024-01-31'),
        format: ReportFormat.CSV,
        totalAccounts: 1000,
        activeAccounts: 900,
        suspendedAccounts: 80,
        closedAccounts: 20,
        downloadUrl: 'https://reports.example.com/RPT-20240131-CSV001.csv',
        createdAt: new Date('2024-01-31T10:00:00Z'),
      };

      expect(report.format).toBe(ReportFormat.CSV);
      expect(report.downloadUrl).toContain('.csv');
    });

    it('should create report with JSON format and appropriate URL', () => {
      const report: ReportEntity = {
        reportId: 'RPT-20240131-JSON01',
        reportType: ReportType.ACCOUNT_STATUS,
        asOfDate: new Date('2024-01-31'),
        format: ReportFormat.JSON,
        totalAccounts: 1000,
        activeAccounts: 900,
        suspendedAccounts: 80,
        closedAccounts: 20,
        downloadUrl: 'https://reports.example.com/RPT-20240131-JSON01.json',
        createdAt: new Date('2024-01-31T10:00:00Z'),
      };

      expect(report.format).toBe(ReportFormat.JSON);
      expect(report.downloadUrl).toContain('.json');
    });

    it('should create report with PDF format and appropriate URL', () => {
      const report: ReportEntity = {
        reportId: 'RPT-20240131-PDF001',
        reportType: ReportType.ACCOUNT_STATUS,
        asOfDate: new Date('2024-01-31'),
        format: ReportFormat.PDF,
        totalAccounts: 1000,
        activeAccounts: 900,
        suspendedAccounts: 80,
        closedAccounts: 20,
        downloadUrl: 'https://reports.example.com/RPT-20240131-PDF001.pdf',
        createdAt: new Date('2024-01-31T10:00:00Z'),
      };

      expect(report.format).toBe(ReportFormat.PDF);
      expect(report.downloadUrl).toContain('.pdf');
    });

    it('should support large account counts', () => {
      const report: ReportEntity = {
        reportId: 'RPT-20240131-LARGE1',
        reportType: ReportType.ACCOUNT_STATUS,
        asOfDate: new Date('2024-01-31'),
        format: ReportFormat.CSV,
        totalAccounts: 10000000,
        activeAccounts: 9500000,
        suspendedAccounts: 400000,
        closedAccounts: 100000,
        downloadUrl: 'https://reports.example.com/RPT-20240131-LARGE1.csv',
        createdAt: new Date('2024-01-31T10:00:00Z'),
      };

      expect(report.totalAccounts).toBe(10000000);
    });
  });
});
