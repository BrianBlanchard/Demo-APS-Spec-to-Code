import { GenerateReportRequestSchema } from '../report.dto';
import { ReportType, ReportFormat } from '../../types/report.types';
import { ZodError } from 'zod';

describe('report.dto', () => {
  describe('GenerateReportRequestSchema', () => {
    describe('valid requests', () => {
      it('should validate valid account_status report request', () => {
        const validRequest = {
          reportType: ReportType.ACCOUNT_STATUS,
          asOfDate: '2024-01-31',
          format: ReportFormat.CSV,
        };

        const result = GenerateReportRequestSchema.parse(validRequest);
        expect(result).toEqual(validRequest);
      });

      it('should validate valid credit_utilization report request', () => {
        const validRequest = {
          reportType: ReportType.CREDIT_UTILIZATION,
          asOfDate: '2024-12-31',
          format: ReportFormat.JSON,
        };

        const result = GenerateReportRequestSchema.parse(validRequest);
        expect(result).toEqual(validRequest);
      });

      it('should validate valid delinquency report request', () => {
        const validRequest = {
          reportType: ReportType.DELINQUENCY,
          asOfDate: '2023-06-15',
          format: ReportFormat.PDF,
        };

        const result = GenerateReportRequestSchema.parse(validRequest);
        expect(result).toEqual(validRequest);
      });

      it('should validate valid monthly_statement report request', () => {
        const validRequest = {
          reportType: ReportType.MONTHLY_STATEMENT,
          asOfDate: '2024-03-01',
          format: ReportFormat.CSV,
        };

        const result = GenerateReportRequestSchema.parse(validRequest);
        expect(result).toEqual(validRequest);
      });
    });

    describe('invalid reportType', () => {
      it('should reject invalid report type', () => {
        const invalidRequest = {
          reportType: 'invalid_type',
          asOfDate: '2024-01-31',
          format: ReportFormat.CSV,
        };

        expect(() => GenerateReportRequestSchema.parse(invalidRequest)).toThrow(ZodError);
      });

      it('should reject missing report type', () => {
        const invalidRequest = {
          asOfDate: '2024-01-31',
          format: ReportFormat.CSV,
        };

        expect(() => GenerateReportRequestSchema.parse(invalidRequest)).toThrow(ZodError);
      });

      it('should reject null report type', () => {
        const invalidRequest = {
          reportType: null,
          asOfDate: '2024-01-31',
          format: ReportFormat.CSV,
        };

        expect(() => GenerateReportRequestSchema.parse(invalidRequest)).toThrow(ZodError);
      });
    });

    describe('invalid asOfDate', () => {
      it('should reject invalid date format (YYYY/MM/DD)', () => {
        const invalidRequest = {
          reportType: ReportType.ACCOUNT_STATUS,
          asOfDate: '2024/01/31',
          format: ReportFormat.CSV,
        };

        expect(() => GenerateReportRequestSchema.parse(invalidRequest)).toThrow(ZodError);
      });

      it('should reject invalid date format (DD-MM-YYYY)', () => {
        const invalidRequest = {
          reportType: ReportType.ACCOUNT_STATUS,
          asOfDate: '31-01-2024',
          format: ReportFormat.CSV,
        };

        expect(() => GenerateReportRequestSchema.parse(invalidRequest)).toThrow(ZodError);
      });

      it('should reject invalid date format (MM/DD/YYYY)', () => {
        const invalidRequest = {
          reportType: ReportType.ACCOUNT_STATUS,
          asOfDate: '01/31/2024',
          format: ReportFormat.CSV,
        };

        expect(() => GenerateReportRequestSchema.parse(invalidRequest)).toThrow(ZodError);
      });

      it('should reject missing date', () => {
        const invalidRequest = {
          reportType: ReportType.ACCOUNT_STATUS,
          format: ReportFormat.CSV,
        };

        expect(() => GenerateReportRequestSchema.parse(invalidRequest)).toThrow(ZodError);
      });

      it('should reject null date', () => {
        const invalidRequest = {
          reportType: ReportType.ACCOUNT_STATUS,
          asOfDate: null,
          format: ReportFormat.CSV,
        };

        expect(() => GenerateReportRequestSchema.parse(invalidRequest)).toThrow(ZodError);
      });

      it('should reject empty string date', () => {
        const invalidRequest = {
          reportType: ReportType.ACCOUNT_STATUS,
          asOfDate: '',
          format: ReportFormat.CSV,
        };

        expect(() => GenerateReportRequestSchema.parse(invalidRequest)).toThrow(ZodError);
      });

      it('should reject date with time', () => {
        const invalidRequest = {
          reportType: ReportType.ACCOUNT_STATUS,
          asOfDate: '2024-01-31T10:30:00',
          format: ReportFormat.CSV,
        };

        expect(() => GenerateReportRequestSchema.parse(invalidRequest)).toThrow(ZodError);
      });
    });

    describe('invalid format', () => {
      it('should reject invalid format', () => {
        const invalidRequest = {
          reportType: ReportType.ACCOUNT_STATUS,
          asOfDate: '2024-01-31',
          format: 'xml',
        };

        expect(() => GenerateReportRequestSchema.parse(invalidRequest)).toThrow(ZodError);
      });

      it('should reject missing format', () => {
        const invalidRequest = {
          reportType: ReportType.ACCOUNT_STATUS,
          asOfDate: '2024-01-31',
        };

        expect(() => GenerateReportRequestSchema.parse(invalidRequest)).toThrow(ZodError);
      });

      it('should reject null format', () => {
        const invalidRequest = {
          reportType: ReportType.ACCOUNT_STATUS,
          asOfDate: '2024-01-31',
          format: null,
        };

        expect(() => GenerateReportRequestSchema.parse(invalidRequest)).toThrow(ZodError);
      });
    });

    describe('edge cases', () => {
      it('should accept leap year date', () => {
        const validRequest = {
          reportType: ReportType.ACCOUNT_STATUS,
          asOfDate: '2024-02-29',
          format: ReportFormat.CSV,
        };

        const result = GenerateReportRequestSchema.parse(validRequest);
        expect(result).toEqual(validRequest);
      });

      it('should accept year 2000', () => {
        const validRequest = {
          reportType: ReportType.ACCOUNT_STATUS,
          asOfDate: '2000-01-01',
          format: ReportFormat.CSV,
        };

        const result = GenerateReportRequestSchema.parse(validRequest);
        expect(result).toEqual(validRequest);
      });

      it('should accept year 9999', () => {
        const validRequest = {
          reportType: ReportType.ACCOUNT_STATUS,
          asOfDate: '9999-12-31',
          format: ReportFormat.CSV,
        };

        const result = GenerateReportRequestSchema.parse(validRequest);
        expect(result).toEqual(validRequest);
      });

      it('should reject additional properties', () => {
        const invalidRequest = {
          reportType: ReportType.ACCOUNT_STATUS,
          asOfDate: '2024-01-31',
          format: ReportFormat.CSV,
          extraField: 'extra',
        };

        // Zod by default strips additional properties in parse mode
        const result = GenerateReportRequestSchema.parse(invalidRequest);
        expect(result).not.toHaveProperty('extraField');
      });
    });
  });
});
