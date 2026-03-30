import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { ReportController } from '../report.controller';
import { IReportService } from '../../services/report.service';
import { ReportRequestDto } from '../../dto/report-request.dto';
import { ReportResponseDto } from '../../dto/report-response.dto';

describe('ReportController', () => {
  let controller: ReportController;
  let mockReportService: jest.Mocked<IReportService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReportService = {
      generateReport: jest.fn<() => Promise<ReportResponseDto>>(),
    };

    controller = new ReportController(mockReportService);

    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: jest.fn<() => Response>().mockReturnThis() as unknown as (code: number) => Response,
      json: jest.fn<() => Response>() as unknown as (body: unknown) => Response,
    };

    mockNext = jest.fn() as NextFunction;
  });

  describe('generateReport', () => {
    const validRequest: ReportRequestDto = {
      reportType: 'daily_summary',
      dateRange: {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
      },
      format: 'pdf',
      includeGraphs: true,
    };

    const validResponse: ReportResponseDto = {
      reportId: 'RPT-20240115-ABC123',
      reportType: 'daily_summary',
      generatedAt: '2024-01-15T10:30:00Z',
      downloadUrl: 'https://reports.example.com/RPT-20240115-ABC123.pdf',
      expiresAt: '2024-01-22T10:30:00Z',
    };

    it('should generate report successfully', async () => {
      mockRequest.body = validRequest;
      mockReportService.generateReport.mockResolvedValue(validResponse);

      await controller.generateReport(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockReportService.generateReport).toHaveBeenCalledWith(validRequest);
      expect(mockReportService.generateReport).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(validResponse);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle all report types', async () => {
      const reportTypes = ['daily_summary', 'declined_transactions', 'merchant_analysis', 'category_spending'];

      for (const reportType of reportTypes) {
        const request = { ...validRequest, reportType };
        mockRequest.body = request;
        mockReportService.generateReport.mockResolvedValue({
          ...validResponse,
          reportType: reportType as ReportResponseDto['reportType'],
        });

        await controller.generateReport(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockReportService.generateReport).toHaveBeenCalledWith(request);
      }
    });

    it('should handle CSV format', async () => {
      const csvRequest = { ...validRequest, format: 'csv' as const };
      mockRequest.body = csvRequest;
      mockReportService.generateReport.mockResolvedValue({
        ...validResponse,
        downloadUrl: 'https://reports.example.com/RPT-20240115-ABC123.csv',
      });

      await controller.generateReport(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockReportService.generateReport).toHaveBeenCalledWith(csvRequest);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('should handle request without graphs', async () => {
      const noGraphsRequest = { ...validRequest, includeGraphs: false };
      mockRequest.body = noGraphsRequest;
      mockReportService.generateReport.mockResolvedValue(validResponse);

      await controller.generateReport(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockReportService.generateReport).toHaveBeenCalledWith(noGraphsRequest);
    });

    it('should pass errors to error handler', async () => {
      const error = new Error('Service error');
      mockRequest.body = validRequest;
      mockReportService.generateReport.mockRejectedValue(error);

      await controller.generateReport(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should not catch errors in controller', async () => {
      const error = new Error('Validation error');
      mockRequest.body = validRequest;
      mockReportService.generateReport.mockRejectedValue(error);

      await controller.generateReport(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should delegate to service layer', async () => {
      mockRequest.body = validRequest;
      mockReportService.generateReport.mockResolvedValue(validResponse);

      await controller.generateReport(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockReportService.generateReport).toHaveBeenCalledWith(validRequest);
    });

    it('should return 201 status code', async () => {
      mockRequest.body = validRequest;
      mockReportService.generateReport.mockResolvedValue(validResponse);

      await controller.generateReport(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('should return response as JSON', async () => {
      mockRequest.body = validRequest;
      mockReportService.generateReport.mockResolvedValue(validResponse);

      await controller.generateReport(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(validResponse);
    });
  });
});
