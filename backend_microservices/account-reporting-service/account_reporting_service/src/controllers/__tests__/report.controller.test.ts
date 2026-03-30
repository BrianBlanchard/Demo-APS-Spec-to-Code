import { Request, Response, NextFunction } from 'express';
import { ReportController } from '../report.controller';
import { IReportService } from '../../services/report.service';
import { GenerateReportResponseDto } from '../../dtos/report.dto';
import { ValidationError } from '../../errors/application.error';
import { ReportType, ReportFormat } from '../../types/report.types';

describe('ReportController', () => {
  let reportController: ReportController;
  let mockReportService: jest.Mocked<IReportService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock<NextFunction>;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    mockReportService = {
      generateReport: jest.fn(),
    };

    jsonSpy = jest.fn();
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });

    mockResponse = {
      status: statusSpy,
      json: jsonSpy,
    };

    nextFunction = jest.fn();

    reportController = new ReportController(mockReportService);
  });

  describe('generateReport', () => {
    it('should generate report successfully and return 200', async () => {
      const requestBody = {
        reportType: ReportType.ACCOUNT_STATUS,
        asOfDate: '2024-01-31',
        format: ReportFormat.CSV,
      };

      const responseData: GenerateReportResponseDto = {
        reportId: 'RPT-20240131-ABC123',
        reportType: ReportType.ACCOUNT_STATUS,
        totalAccounts: 10000,
        activeAccounts: 9500,
        suspendedAccounts: 400,
        closedAccounts: 100,
        downloadUrl: 'https://reports.example.com/RPT-20240131-ABC123.csv',
      };

      mockRequest = { body: requestBody };
      mockReportService.generateReport.mockResolvedValue(responseData);

      await reportController.generateReport(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockReportService.generateReport).toHaveBeenCalledWith(requestBody);
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(responseData);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle credit_utilization report type', async () => {
      const requestBody = {
        reportType: ReportType.CREDIT_UTILIZATION,
        asOfDate: '2024-01-31',
        format: ReportFormat.JSON,
      };

      const responseData: GenerateReportResponseDto = {
        reportId: 'RPT-20240131-DEF456',
        reportType: ReportType.CREDIT_UTILIZATION,
        totalAccounts: 5000,
        activeAccounts: 4800,
        suspendedAccounts: 150,
        closedAccounts: 50,
        downloadUrl: 'https://reports.example.com/RPT-20240131-DEF456.json',
      };

      mockRequest = { body: requestBody };
      mockReportService.generateReport.mockResolvedValue(responseData);

      await reportController.generateReport(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockReportService.generateReport).toHaveBeenCalledWith(requestBody);
      expect(jsonSpy).toHaveBeenCalledWith(responseData);
    });

    it('should handle delinquency report type', async () => {
      const requestBody = {
        reportType: ReportType.DELINQUENCY,
        asOfDate: '2024-01-31',
        format: ReportFormat.PDF,
      };

      const responseData: GenerateReportResponseDto = {
        reportId: 'RPT-20240131-GHI789',
        reportType: ReportType.DELINQUENCY,
        totalAccounts: 1000,
        activeAccounts: 950,
        suspendedAccounts: 40,
        closedAccounts: 10,
        downloadUrl: 'https://reports.example.com/RPT-20240131-GHI789.pdf',
      };

      mockRequest = { body: requestBody };
      mockReportService.generateReport.mockResolvedValue(responseData);

      await reportController.generateReport(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(jsonSpy).toHaveBeenCalledWith(responseData);
    });

    it('should call next with error when service throws ValidationError', async () => {
      const requestBody = {
        reportType: ReportType.ACCOUNT_STATUS,
        asOfDate: '2024-01-31',
        format: ReportFormat.CSV,
      };

      const error = new ValidationError('Invalid date format');
      mockRequest = { body: requestBody };
      mockReportService.generateReport.mockRejectedValue(error);

      await reportController.generateReport(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(error);
      expect(statusSpy).not.toHaveBeenCalled();
      expect(jsonSpy).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws generic error', async () => {
      const requestBody = {
        reportType: ReportType.ACCOUNT_STATUS,
        asOfDate: '2024-01-31',
        format: ReportFormat.CSV,
      };

      const error = new Error('Unexpected error');
      mockRequest = { body: requestBody };
      mockReportService.generateReport.mockRejectedValue(error);

      await reportController.generateReport(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(error);
      expect(statusSpy).not.toHaveBeenCalled();
    });

    it('should handle different date formats', async () => {
      const requestBody = {
        reportType: ReportType.ACCOUNT_STATUS,
        asOfDate: '2023-12-31',
        format: ReportFormat.CSV,
      };

      const responseData: GenerateReportResponseDto = {
        reportId: 'RPT-20231231-XYZ123',
        reportType: ReportType.ACCOUNT_STATUS,
        totalAccounts: 8000,
        activeAccounts: 7500,
        suspendedAccounts: 400,
        closedAccounts: 100,
        downloadUrl: 'https://reports.example.com/RPT-20231231-XYZ123.csv',
      };

      mockRequest = { body: requestBody };
      mockReportService.generateReport.mockResolvedValue(responseData);

      await reportController.generateReport(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockReportService.generateReport).toHaveBeenCalledWith(requestBody);
      expect(jsonSpy).toHaveBeenCalledWith(responseData);
    });

    it('should handle reports with zero account counts', async () => {
      const requestBody = {
        reportType: ReportType.ACCOUNT_STATUS,
        asOfDate: '2024-01-31',
        format: ReportFormat.CSV,
      };

      const responseData: GenerateReportResponseDto = {
        reportId: 'RPT-20240131-ZERO00',
        reportType: ReportType.ACCOUNT_STATUS,
        totalAccounts: 0,
        activeAccounts: 0,
        suspendedAccounts: 0,
        closedAccounts: 0,
        downloadUrl: 'https://reports.example.com/RPT-20240131-ZERO00.csv',
      };

      mockRequest = { body: requestBody };
      mockReportService.generateReport.mockResolvedValue(responseData);

      await reportController.generateReport(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(jsonSpy).toHaveBeenCalledWith(responseData);
    });

    it('should not modify request body', async () => {
      const requestBody = {
        reportType: ReportType.ACCOUNT_STATUS,
        asOfDate: '2024-01-31',
        format: ReportFormat.CSV,
      };

      const responseData: GenerateReportResponseDto = {
        reportId: 'RPT-20240131-ABC123',
        reportType: ReportType.ACCOUNT_STATUS,
        totalAccounts: 10000,
        activeAccounts: 9500,
        suspendedAccounts: 400,
        closedAccounts: 100,
        downloadUrl: 'https://reports.example.com/RPT-20240131-ABC123.csv',
      };

      mockRequest = { body: { ...requestBody } };
      mockReportService.generateReport.mockResolvedValue(responseData);

      const originalBody = { ...requestBody };

      await reportController.generateReport(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.body).toEqual(originalBody);
    });
  });
});
