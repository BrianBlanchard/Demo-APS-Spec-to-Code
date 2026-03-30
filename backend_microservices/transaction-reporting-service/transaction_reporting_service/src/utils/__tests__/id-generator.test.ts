import { describe, it, expect } from '@jest/globals';
import { generateReportId, generateTraceId } from '../id-generator';

describe('ID Generator', () => {
  describe('generateReportId', () => {
    it('should generate report ID with correct format', () => {
      const reportId = generateReportId();

      expect(reportId).toMatch(/^RPT-\d{8}-[A-Z0-9]{6}$/);
    });

    it('should include current date in format YYYYMMDD', () => {
      const reportId = generateReportId();
      const datePattern = /RPT-(\d{8})-/;
      const match = reportId.match(datePattern);

      expect(match).not.toBeNull();
      if (match) {
        const dateStr = match[1];
        expect(dateStr.length).toBe(8);

        // Verify it's a valid date format
        const year = parseInt(dateStr.substring(0, 4));
        const month = parseInt(dateStr.substring(4, 6));
        const day = parseInt(dateStr.substring(6, 8));

        expect(year).toBeGreaterThanOrEqual(2024);
        expect(month).toBeGreaterThanOrEqual(1);
        expect(month).toBeLessThanOrEqual(12);
        expect(day).toBeGreaterThanOrEqual(1);
        expect(day).toBeLessThanOrEqual(31);
      }
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      const count = 100;

      for (let i = 0; i < count; i++) {
        ids.add(generateReportId());
      }

      expect(ids.size).toBe(count);
    });

    it('should have 6-character random suffix', () => {
      const reportId = generateReportId();
      const suffixPattern = /-([A-Z0-9]{6})$/;
      const match = reportId.match(suffixPattern);

      expect(match).not.toBeNull();
      if (match) {
        const suffix = match[1];
        expect(suffix.length).toBe(6);
        expect(suffix).toMatch(/^[A-Z0-9]+$/);
      }
    });

    it('should start with RPT- prefix', () => {
      const reportId = generateReportId();

      expect(reportId.startsWith('RPT-')).toBe(true);
    });

    it('should generate different IDs on consecutive calls', () => {
      const id1 = generateReportId();
      const id2 = generateReportId();

      expect(id1).not.toBe(id2);
    });

    it('should have total length of 21 characters', () => {
      const reportId = generateReportId();

      // RPT- (4) + YYYYMMDD (8) + - (1) + XXXXXX (6) = 19 characters
      expect(reportId.length).toBe(19);
    });
  });

  describe('generateTraceId', () => {
    it('should generate trace ID', () => {
      const traceId = generateTraceId();

      expect(traceId).toBeDefined();
      expect(typeof traceId).toBe('string');
      expect(traceId.length).toBeGreaterThan(0);
    });

    it('should contain timestamp', () => {
      const beforeTimestamp = Date.now();
      const traceId = generateTraceId();
      const afterTimestamp = Date.now();

      const timestampPattern = /^(\d+)-/;
      const match = traceId.match(timestampPattern);

      expect(match).not.toBeNull();
      if (match) {
        const timestamp = parseInt(match[1]);
        expect(timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
        expect(timestamp).toBeLessThanOrEqual(afterTimestamp);
      }
    });

    it('should have random suffix', () => {
      const traceId = generateTraceId();
      const parts = traceId.split('-');

      expect(parts.length).toBe(2);
      expect(parts[0]).toMatch(/^\d+$/);
      expect(parts[1]).toMatch(/^[A-Z0-9]+$/);
      expect(parts[1].length).toBe(8);
    });

    it('should generate unique trace IDs', () => {
      const ids = new Set<string>();
      const count = 100;

      for (let i = 0; i < count; i++) {
        ids.add(generateTraceId());
      }

      expect(ids.size).toBe(count);
    });

    it('should generate different IDs on consecutive calls', () => {
      const id1 = generateTraceId();
      const id2 = generateTraceId();

      expect(id1).not.toBe(id2);
    });

    it('should use uppercase letters and numbers only', () => {
      const traceId = generateTraceId();
      const suffix = traceId.split('-')[1];

      expect(suffix).toMatch(/^[A-Z0-9]+$/);
    });

    it('should generate IDs with consistent format', () => {
      for (let i = 0; i < 10; i++) {
        const traceId = generateTraceId();
        expect(traceId).toMatch(/^\d+-[A-Z0-9]{8}$/);
      }
    });
  });

  describe('ID uniqueness across generators', () => {
    it('should generate different formats for report and trace IDs', () => {
      const reportId = generateReportId();
      const traceId = generateTraceId();

      expect(reportId.startsWith('RPT-')).toBe(true);
      expect(traceId.startsWith('RPT-')).toBe(false);
    });

    it('should maintain uniqueness across both generators', () => {
      const allIds = new Set<string>();

      for (let i = 0; i < 50; i++) {
        allIds.add(generateReportId());
        allIds.add(generateTraceId());
      }

      expect(allIds.size).toBe(100);
    });
  });
});
