import { describe, it, expect } from '@jest/globals';
import { ReportResponseSchema } from '../report-response.dto';

describe('ReportResponseDto', () => {
  const validResponse = {
    reportId: 'RPT-20240115-ABC123',
    reportType: 'daily_summary',
    generatedAt: '2024-01-15T10:30:00Z',
    downloadUrl: 'https://reports.example.com/RPT-20240115-ABC123.pdf',
    expiresAt: '2024-01-22T10:30:00Z',
  };

  describe('valid responses', () => {
    it('should accept valid report response', () => {
      expect(() => ReportResponseSchema.parse(validResponse)).not.toThrow();
    });

    it('should accept all valid report types', () => {
      const types = ['daily_summary', 'declined_transactions', 'merchant_analysis', 'category_spending'];
      types.forEach((reportType) => {
        const response = { ...validResponse, reportType };
        expect(() => ReportResponseSchema.parse(response)).not.toThrow();
      });
    });
  });

  describe('reportId validation', () => {
    it('should accept valid reportId format', () => {
      const validIds = [
        'RPT-20240115-ABC123',
        'RPT-20231231-XYZ789',
        'RPT-20240101-000000',
        'RPT-20240315-ABCDEF',
      ];
      validIds.forEach((reportId) => {
        const response = { ...validResponse, reportId };
        expect(() => ReportResponseSchema.parse(response)).not.toThrow();
      });
    });

    it('should reject invalid reportId format', () => {
      const invalidIds = [
        'INVALID',
        'RPT-123-ABC',
        'RPT-20240115-AB',
        'RPT-20240115-ABCDEFG',
        'rpt-20240115-ABC123',
        'RPT20240115ABC123',
        '',
      ];
      invalidIds.forEach((reportId) => {
        const response = { ...validResponse, reportId };
        expect(() => ReportResponseSchema.parse(response)).toThrow();
      });
    });

    it('should reject missing reportId', () => {
      const { reportId, ...missing } = validResponse;
      expect(() => ReportResponseSchema.parse(missing)).toThrow();
    });
  });

  describe('reportType validation', () => {
    it('should reject invalid reportType', () => {
      const response = { ...validResponse, reportType: 'invalid_type' };
      expect(() => ReportResponseSchema.parse(response)).toThrow();
    });

    it('should reject missing reportType', () => {
      const { reportType, ...missing } = validResponse;
      expect(() => ReportResponseSchema.parse(missing)).toThrow();
    });
  });

  describe('timestamp validation', () => {
    it('should accept valid ISO 8601 timestamps', () => {
      const validTimestamps = [
        '2024-01-15T10:30:00Z',
        '2024-01-15T10:30:00.000Z',
        '2024-12-31T23:59:59Z',
      ];
      validTimestamps.forEach((timestamp) => {
        const response = { ...validResponse, generatedAt: timestamp, expiresAt: timestamp };
        expect(() => ReportResponseSchema.parse(response)).not.toThrow();
      });
    });

    it('should reject invalid timestamp formats', () => {
      const invalidTimestamps = [
        '2024-01-15',
        '2024-01-15 10:30:00',
        'not-a-date',
        '',
      ];
      invalidTimestamps.forEach((timestamp) => {
        const response = { ...validResponse, generatedAt: timestamp };
        expect(() => ReportResponseSchema.parse(response)).toThrow();
      });
    });

    it('should reject missing generatedAt', () => {
      const { generatedAt, ...missing } = validResponse;
      expect(() => ReportResponseSchema.parse(missing)).toThrow();
    });

    it('should reject missing expiresAt', () => {
      const { expiresAt, ...missing } = validResponse;
      expect(() => ReportResponseSchema.parse(missing)).toThrow();
    });
  });

  describe('downloadUrl validation', () => {
    it('should accept valid URLs', () => {
      const validUrls = [
        'https://reports.example.com/RPT-20240115-ABC123.pdf',
        'http://localhost:3000/reports/test.pdf',
        'https://cdn.example.com/reports/file.csv',
      ];
      validUrls.forEach((downloadUrl) => {
        const response = { ...validResponse, downloadUrl };
        expect(() => ReportResponseSchema.parse(response)).not.toThrow();
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://invalid.com',
        '',
        'file:///local/path',
      ];
      invalidUrls.forEach((downloadUrl) => {
        const response = { ...validResponse, downloadUrl };
        expect(() => ReportResponseSchema.parse(response)).toThrow();
      });
    });

    it('should reject missing downloadUrl', () => {
      const { downloadUrl, ...missing } = validResponse;
      expect(() => ReportResponseSchema.parse(missing)).toThrow();
    });
  });
});
