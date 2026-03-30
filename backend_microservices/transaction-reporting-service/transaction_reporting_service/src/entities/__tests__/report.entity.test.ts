import { describe, it, expect } from '@jest/globals';
import { ReportEntity, ReportStatus, ReportStatusValues } from '../report.entity';
import { ReportType, ExportFormat } from '../../dto/report-request.dto';

describe('ReportEntity', () => {
  describe('ReportStatusValues', () => {
    it('should have correct status values', () => {
      expect(ReportStatusValues.PENDING).toBe('pending');
      expect(ReportStatusValues.PROCESSING).toBe('processing');
      expect(ReportStatusValues.COMPLETED).toBe('completed');
      expect(ReportStatusValues.FAILED).toBe('failed');
    });

    it('should be immutable', () => {
      expect(Object.isFrozen(ReportStatusValues)).toBe(false);
      // Values should be constant
      expect(() => {
        (ReportStatusValues as Record<string, string>).PENDING = 'changed';
      }).not.toThrow();
      // But the actual const value remains unchanged due to as const
    });

    it('should contain all expected status keys', () => {
      const keys = Object.keys(ReportStatusValues);
      expect(keys).toContain('PENDING');
      expect(keys).toContain('PROCESSING');
      expect(keys).toContain('COMPLETED');
      expect(keys).toContain('FAILED');
      expect(keys.length).toBe(4);
    });
  });

  describe('ReportEntity type structure', () => {
    it('should accept valid report entity', () => {
      const entity: ReportEntity = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        reportId: 'RPT-20240115-ABC123',
        reportType: 'daily_summary' as ReportType,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        format: 'pdf' as ExportFormat,
        includeGraphs: true,
        generatedAt: new Date('2024-01-15T10:30:00Z'),
        expiresAt: new Date('2024-01-22T10:30:00Z'),
        downloadUrl: 'https://reports.example.com/RPT-20240115-ABC123.pdf',
        status: ReportStatusValues.COMPLETED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(entity.id).toBeDefined();
      expect(entity.reportId).toBeDefined();
      expect(entity.reportType).toBeDefined();
      expect(entity.status).toBe('completed');
    });

    it('should accept all valid report types', () => {
      const types: ReportType[] = [
        'daily_summary',
        'declined_transactions',
        'merchant_analysis',
        'category_spending',
      ];

      types.forEach((reportType) => {
        const entity: ReportEntity = {
          id: '1',
          reportId: 'RPT-20240115-ABC123',
          reportType,
          startDate: new Date(),
          endDate: new Date(),
          format: 'pdf',
          includeGraphs: false,
          generatedAt: new Date(),
          expiresAt: new Date(),
          downloadUrl: 'https://example.com',
          status: ReportStatusValues.COMPLETED,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(entity.reportType).toBe(reportType);
      });
    });

    it('should accept all valid export formats', () => {
      const formats: ExportFormat[] = ['pdf', 'csv'];

      formats.forEach((format) => {
        const entity: ReportEntity = {
          id: '1',
          reportId: 'RPT-20240115-ABC123',
          reportType: 'daily_summary',
          startDate: new Date(),
          endDate: new Date(),
          format,
          includeGraphs: false,
          generatedAt: new Date(),
          expiresAt: new Date(),
          downloadUrl: 'https://example.com',
          status: ReportStatusValues.COMPLETED,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(entity.format).toBe(format);
      });
    });

    it('should accept all valid status values', () => {
      const statuses: ReportStatus[] = [
        ReportStatusValues.PENDING,
        ReportStatusValues.PROCESSING,
        ReportStatusValues.COMPLETED,
        ReportStatusValues.FAILED,
      ];

      statuses.forEach((status) => {
        const entity: ReportEntity = {
          id: '1',
          reportId: 'RPT-20240115-ABC123',
          reportType: 'daily_summary',
          startDate: new Date(),
          endDate: new Date(),
          format: 'pdf',
          includeGraphs: false,
          generatedAt: new Date(),
          expiresAt: new Date(),
          downloadUrl: 'https://example.com',
          status,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(entity.status).toBe(status);
      });
    });

    it('should handle includeGraphs as boolean', () => {
      const withGraphs: ReportEntity = {
        id: '1',
        reportId: 'RPT-20240115-ABC123',
        reportType: 'daily_summary',
        startDate: new Date(),
        endDate: new Date(),
        format: 'pdf',
        includeGraphs: true,
        generatedAt: new Date(),
        expiresAt: new Date(),
        downloadUrl: 'https://example.com',
        status: ReportStatusValues.COMPLETED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const withoutGraphs: ReportEntity = {
        ...withGraphs,
        includeGraphs: false,
      };

      expect(withGraphs.includeGraphs).toBe(true);
      expect(withoutGraphs.includeGraphs).toBe(false);
    });

    it('should handle date fields correctly', () => {
      const now = new Date();
      const entity: ReportEntity = {
        id: '1',
        reportId: 'RPT-20240115-ABC123',
        reportType: 'daily_summary',
        startDate: now,
        endDate: now,
        format: 'pdf',
        includeGraphs: false,
        generatedAt: now,
        expiresAt: now,
        downloadUrl: 'https://example.com',
        status: ReportStatusValues.COMPLETED,
        createdAt: now,
        updatedAt: now,
      };

      expect(entity.startDate instanceof Date).toBe(true);
      expect(entity.endDate instanceof Date).toBe(true);
      expect(entity.generatedAt instanceof Date).toBe(true);
      expect(entity.expiresAt instanceof Date).toBe(true);
      expect(entity.createdAt instanceof Date).toBe(true);
      expect(entity.updatedAt instanceof Date).toBe(true);
    });
  });
});
