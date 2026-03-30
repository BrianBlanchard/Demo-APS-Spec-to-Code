import { describe, it, expect } from '@jest/globals';
import {
  ReportRequestSchema,
  DateRangeSchema,
  ReportTypeEnum,
  ExportFormatEnum,
} from '../report-request.dto';

describe('ReportRequestDto', () => {
  describe('ReportTypeEnum', () => {
    it('should accept valid report types', () => {
      expect(() => ReportTypeEnum.parse('daily_summary')).not.toThrow();
      expect(() => ReportTypeEnum.parse('declined_transactions')).not.toThrow();
      expect(() => ReportTypeEnum.parse('merchant_analysis')).not.toThrow();
      expect(() => ReportTypeEnum.parse('category_spending')).not.toThrow();
    });

    it('should reject invalid report types', () => {
      expect(() => ReportTypeEnum.parse('invalid_type')).toThrow();
      expect(() => ReportTypeEnum.parse('')).toThrow();
      expect(() => ReportTypeEnum.parse(null)).toThrow();
      expect(() => ReportTypeEnum.parse(undefined)).toThrow();
    });
  });

  describe('ExportFormatEnum', () => {
    it('should accept valid export formats', () => {
      expect(() => ExportFormatEnum.parse('pdf')).not.toThrow();
      expect(() => ExportFormatEnum.parse('csv')).not.toThrow();
    });

    it('should reject invalid export formats', () => {
      expect(() => ExportFormatEnum.parse('json')).toThrow();
      expect(() => ExportFormatEnum.parse('xml')).toThrow();
      expect(() => ExportFormatEnum.parse('')).toThrow();
      expect(() => ExportFormatEnum.parse(null)).toThrow();
    });
  });

  describe('DateRangeSchema', () => {
    it('should accept valid date range', () => {
      const validDateRange = {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
      };
      expect(() => DateRangeSchema.parse(validDateRange)).not.toThrow();
    });

    it('should reject invalid date formats', () => {
      const invalidFormat = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };
      expect(() => DateRangeSchema.parse(invalidFormat)).toThrow();
    });

    it('should reject missing startDate', () => {
      const missingStart = {
        endDate: '2024-01-31T23:59:59Z',
      };
      expect(() => DateRangeSchema.parse(missingStart)).toThrow();
    });

    it('should reject missing endDate', () => {
      const missingEnd = {
        startDate: '2024-01-01T00:00:00Z',
      };
      expect(() => DateRangeSchema.parse(missingEnd)).toThrow();
    });

    it('should reject invalid date values', () => {
      const invalidDates = {
        startDate: 'not-a-date',
        endDate: 'also-not-a-date',
      };
      expect(() => DateRangeSchema.parse(invalidDates)).toThrow();
    });
  });

  describe('ReportRequestSchema', () => {
    const validRequest = {
      reportType: 'daily_summary',
      dateRange: {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
      },
      format: 'pdf',
      includeGraphs: true,
    };

    it('should accept valid report request', () => {
      expect(() => ReportRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should accept request without includeGraphs', () => {
      const { includeGraphs, ...requestWithoutGraphs } = validRequest;
      const result = ReportRequestSchema.parse(requestWithoutGraphs);
      expect(result.includeGraphs).toBe(false);
    });

    it('should reject missing reportType', () => {
      const { reportType, ...missingType } = validRequest;
      expect(() => ReportRequestSchema.parse(missingType)).toThrow();
    });

    it('should reject missing dateRange', () => {
      const { dateRange, ...missingRange } = validRequest;
      expect(() => ReportRequestSchema.parse(missingRange)).toThrow();
    });

    it('should reject missing format', () => {
      const { format, ...missingFormat } = validRequest;
      expect(() => ReportRequestSchema.parse(missingFormat)).toThrow();
    });

    it('should reject invalid reportType value', () => {
      const invalidType = { ...validRequest, reportType: 'invalid' };
      expect(() => ReportRequestSchema.parse(invalidType)).toThrow();
    });

    it('should reject invalid format value', () => {
      const invalidFormat = { ...validRequest, format: 'json' };
      expect(() => ReportRequestSchema.parse(invalidFormat)).toThrow();
    });

    it('should reject non-boolean includeGraphs', () => {
      const invalidGraphs = { ...validRequest, includeGraphs: 'yes' };
      expect(() => ReportRequestSchema.parse(invalidGraphs)).toThrow();
    });

    it('should handle all report types', () => {
      const types = ['daily_summary', 'declined_transactions', 'merchant_analysis', 'category_spending'];
      types.forEach((type) => {
        const request = { ...validRequest, reportType: type };
        expect(() => ReportRequestSchema.parse(request)).not.toThrow();
      });
    });

    it('should handle all export formats', () => {
      const formats = ['pdf', 'csv'];
      formats.forEach((format) => {
        const request = { ...validRequest, format };
        expect(() => ReportRequestSchema.parse(request)).not.toThrow();
      });
    });
  });
});
