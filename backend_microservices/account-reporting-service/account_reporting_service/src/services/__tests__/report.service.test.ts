import { ReportService } from '../report.service';
import { IAccountRepository } from '../../repositories/account.repository';
import { IReportRepository } from '../../repositories/report.repository';
import { IAuditService } from '../audit.service';
import { GenerateReportRequestDto } from '../../dtos/report.dto';
import { ValidationError, ReportGenerationError } from '../../errors/application.error';
import { ReportType, ReportFormat } from '../../types/report.types';
import { AccountSummary } from '../../entities/account.entity';

jest.mock('../../utils/logger', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
}));
jest.mock('../../utils/id-generator', () => ({
  generateReportId: jest.fn(() => 'RPT-20240131-TEST01'),
}));

describe('ReportService', () => {
  let reportService: ReportService;
  let mockAccountRepository: jest.Mocked<IAccountRepository>;
  let mockReportRepository: jest.Mocked<IReportRepository>;
  let mockAuditService: jest.Mocked<IAuditService>;

  beforeEach(() => {
    mockAccountRepository = {
      getAccountSummaryByDate: jest.fn(),
      getAccountsByStatus: jest.fn(),
    };

    mockReportRepository = {
      saveReport: jest.fn(),
      getReportById: jest.fn(),
    };

    mockAuditService = {
      logEvent: jest.fn(),
    };

    reportService = new ReportService(
      mockAccountRepository,
      mockReportRepository,
      mockAuditService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateReport', () => {
    const validRequest: GenerateReportRequestDto = {
      reportType: ReportType.ACCOUNT_STATUS,
      asOfDate: '2024-01-31',
      format: ReportFormat.CSV,
    };

    const mockSummary: AccountSummary = {
      totalAccounts: 10000,
      activeAccounts: 9500,
      suspendedAccounts: 400,
      closedAccounts: 100,
    };

    beforeEach(() => {
      mockAccountRepository.getAccountSummaryByDate.mockResolvedValue(mockSummary);
      mockReportRepository.saveReport.mockImplementation(async (report) => report);
    });

    it('should generate report successfully', async () => {
      const response = await reportService.generateReport(validRequest);

      expect(response.reportId).toBe('RPT-20240131-TEST01');
      expect(response.reportType).toBe(ReportType.ACCOUNT_STATUS);
      expect(response.totalAccounts).toBe(10000);
      expect(response.activeAccounts).toBe(9500);
      expect(response.suspendedAccounts).toBe(400);
      expect(response.closedAccounts).toBe(100);
      expect(response.downloadUrl).toContain('RPT-20240131-TEST01.csv');
    });

    it('should call account repository with parsed date', async () => {
      await reportService.generateReport(validRequest);

      expect(mockAccountRepository.getAccountSummaryByDate).toHaveBeenCalledWith(
        new Date('2024-01-31')
      );
    });

    it('should save report to repository', async () => {
      await reportService.generateReport(validRequest);

      expect(mockReportRepository.saveReport).toHaveBeenCalledWith(
        expect.objectContaining({
          reportId: 'RPT-20240131-TEST01',
          reportType: ReportType.ACCOUNT_STATUS,
          format: ReportFormat.CSV,
          totalAccounts: 10000,
        })
      );
    });

    it('should log audit events for success', async () => {
      await reportService.generateReport(validRequest);

      expect(mockAuditService.logEvent).toHaveBeenCalledTimes(2);
      expect(mockAuditService.logEvent).toHaveBeenNthCalledWith(1, {
        action: 'GENERATE_REPORT',
        resource: 'report',
        status: 'success',
        details: { reportType: ReportType.ACCOUNT_STATUS },
      });
      expect(mockAuditService.logEvent).toHaveBeenNthCalledWith(2, {
        action: 'GENERATE_REPORT',
        resource: 'report',
        resourceId: 'RPT-20240131-TEST01',
        status: 'success',
        details: { reportType: ReportType.ACCOUNT_STATUS },
      });
    });

    it('should generate CSV download URL', async () => {
      const response = await reportService.generateReport(validRequest);

      expect(response.downloadUrl).toBe(
        'https://reports.example.com/RPT-20240131-TEST01.csv'
      );
    });

    it('should generate JSON download URL', async () => {
      const request: GenerateReportRequestDto = {
        ...validRequest,
        format: ReportFormat.JSON,
      };

      const response = await reportService.generateReport(request);

      expect(response.downloadUrl).toContain('.json');
    });

    it('should generate PDF download URL', async () => {
      const request: GenerateReportRequestDto = {
        ...validRequest,
        format: ReportFormat.PDF,
      };

      const response = await reportService.generateReport(request);

      expect(response.downloadUrl).toContain('.pdf');
    });

    it('should handle zero account counts', async () => {
      const emptySummary: AccountSummary = {
        totalAccounts: 0,
        activeAccounts: 0,
        suspendedAccounts: 0,
        closedAccounts: 0,
      };

      mockAccountRepository.getAccountSummaryByDate.mockResolvedValue(emptySummary);

      const response = await reportService.generateReport(validRequest);

      expect(response.totalAccounts).toBe(0);
      expect(response.activeAccounts).toBe(0);
      expect(response.suspendedAccounts).toBe(0);
      expect(response.closedAccounts).toBe(0);
    });

    it('should throw ValidationError for future date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      const request: GenerateReportRequestDto = {
        ...validRequest,
        asOfDate: futureDateStr,
      };

      await expect(reportService.generateReport(request)).rejects.toThrow(ValidationError);
      await expect(reportService.generateReport(request)).rejects.toThrow(
        'Date cannot be in the future'
      );
    });

    it('should throw ValidationError for date before 2000', async () => {
      const request: GenerateReportRequestDto = {
        ...validRequest,
        asOfDate: '1999-12-31',
      };

      await expect(reportService.generateReport(request)).rejects.toThrow(ValidationError);
      await expect(reportService.generateReport(request)).rejects.toThrow(
        'Date cannot be before 2000-01-01'
      );
    });

    it('should throw ValidationError for invalid date format', async () => {
      const request: GenerateReportRequestDto = {
        ...validRequest,
        asOfDate: 'invalid-date',
      };

      await expect(reportService.generateReport(request)).rejects.toThrow(ValidationError);
      await expect(reportService.generateReport(request)).rejects.toThrow('Invalid date format');
    });

    it('should accept valid date on boundary (2000-01-01)', async () => {
      const request: GenerateReportRequestDto = {
        ...validRequest,
        asOfDate: '2000-01-01',
      };

      const response = await reportService.generateReport(request);

      expect(response.reportId).toBeDefined();
    });

    it('should log audit event on failure', async () => {
      mockAccountRepository.getAccountSummaryByDate.mockRejectedValue(
        new Error('Database error')
      );

      await expect(reportService.generateReport(validRequest)).rejects.toThrow();

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'GENERATE_REPORT',
          resource: 'report',
          status: 'failure',
        })
      );
    });

    it('should throw ReportGenerationError when account repository fails', async () => {
      mockAccountRepository.getAccountSummaryByDate.mockRejectedValue(
        new Error('Database connection lost')
      );

      await expect(reportService.generateReport(validRequest)).rejects.toThrow(
        ReportGenerationError
      );
      await expect(reportService.generateReport(validRequest)).rejects.toThrow(
        'Failed to generate report'
      );
    });

    it('should throw ReportGenerationError when report repository fails', async () => {
      mockReportRepository.saveReport.mockRejectedValue(new Error('Save failed'));

      await expect(reportService.generateReport(validRequest)).rejects.toThrow(
        ReportGenerationError
      );
    });

    it('should propagate ValidationError without wrapping', async () => {
      const validationError = new ValidationError('Invalid input');
      mockAccountRepository.getAccountSummaryByDate.mockRejectedValue(validationError);

      await expect(reportService.generateReport(validRequest)).rejects.toThrow(ValidationError);
      await expect(reportService.generateReport(validRequest)).rejects.toThrow('Invalid input');
    });

    it('should handle credit_utilization report type', async () => {
      const request: GenerateReportRequestDto = {
        reportType: ReportType.CREDIT_UTILIZATION,
        asOfDate: '2024-01-31',
        format: ReportFormat.JSON,
      };

      const response = await reportService.generateReport(request);

      expect(response.reportType).toBe(ReportType.CREDIT_UTILIZATION);
    });

    it('should handle delinquency report type', async () => {
      const request: GenerateReportRequestDto = {
        reportType: ReportType.DELINQUENCY,
        asOfDate: '2024-01-31',
        format: ReportFormat.PDF,
      };

      const response = await reportService.generateReport(request);

      expect(response.reportType).toBe(ReportType.DELINQUENCY);
    });

    it('should handle monthly_statement report type', async () => {
      const request: GenerateReportRequestDto = {
        reportType: ReportType.MONTHLY_STATEMENT,
        asOfDate: '2024-01-31',
        format: ReportFormat.CSV,
      };

      const response = await reportService.generateReport(request);

      expect(response.reportType).toBe(ReportType.MONTHLY_STATEMENT);
    });

    it('should not modify input request', async () => {
      const request = { ...validRequest };
      const original = { ...request };

      await reportService.generateReport(request);

      expect(request).toEqual(original);
    });
  });
});
