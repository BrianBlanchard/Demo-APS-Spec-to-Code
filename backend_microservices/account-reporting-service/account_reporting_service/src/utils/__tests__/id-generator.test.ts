import { generateReportId, generateTraceId } from '../id-generator';

describe('id-generator', () => {
  describe('generateReportId', () => {
    it('should generate a report ID with correct format', () => {
      const reportId = generateReportId();
      expect(reportId).toMatch(/^RPT-\d{8}-[A-F0-9]{8}$/);
    });

    it('should include current date in YYYYMMDD format', () => {
      const reportId = generateReportId();
      const datePart = reportId.split('-')[1];

      expect(datePart).toHaveLength(8);
      expect(datePart).toMatch(/^\d{8}$/);

      const year = parseInt(datePart.substring(0, 4), 10);
      const month = parseInt(datePart.substring(4, 6), 10);
      const day = parseInt(datePart.substring(6, 8), 10);

      expect(year).toBeGreaterThanOrEqual(2000);
      expect(year).toBeLessThanOrEqual(9999);
      expect(month).toBeGreaterThanOrEqual(1);
      expect(month).toBeLessThanOrEqual(12);
      expect(day).toBeGreaterThanOrEqual(1);
      expect(day).toBeLessThanOrEqual(31);
    });

    it('should start with RPT- prefix', () => {
      const reportId = generateReportId();
      expect(reportId.startsWith('RPT-')).toBe(true);
    });

    it('should have random hex suffix in uppercase', () => {
      const reportId = generateReportId();
      const randomPart = reportId.split('-')[2];

      expect(randomPart).toHaveLength(8);
      expect(randomPart).toMatch(/^[A-F0-9]{8}$/);
    });

    it('should generate unique IDs on consecutive calls', () => {
      const id1 = generateReportId();
      const id2 = generateReportId();

      // While date parts might be same, random parts should differ
      expect(id1).not.toBe(id2);
    });

    it('should generate different random parts', () => {
      const ids = Array.from({ length: 10 }, () => generateReportId());
      const randomParts = ids.map(id => id.split('-')[2]);
      const uniqueRandomParts = new Set(randomParts);

      // All random parts should be unique
      expect(uniqueRandomParts.size).toBe(10);
    });

    it('should maintain consistent format across multiple generations', () => {
      const ids = Array.from({ length: 5 }, () => generateReportId());

      ids.forEach(id => {
        expect(id).toMatch(/^RPT-\d{8}-[A-F0-9]{8}$/);
      });
    });
  });

  describe('generateTraceId', () => {
    it('should generate a 32-character hex string', () => {
      const traceId = generateTraceId();
      expect(traceId).toHaveLength(32);
      expect(traceId).toMatch(/^[a-f0-9]{32}$/);
    });

    it('should generate unique trace IDs', () => {
      const traceId1 = generateTraceId();
      const traceId2 = generateTraceId();

      expect(traceId1).not.toBe(traceId2);
    });

    it('should use lowercase hexadecimal characters', () => {
      const traceId = generateTraceId();
      expect(traceId).toMatch(/^[a-f0-9]+$/);
      expect(traceId).not.toMatch(/[A-F]/);
    });

    it('should generate cryptographically random values', () => {
      const ids = Array.from({ length: 100 }, () => generateTraceId());
      const uniqueIds = new Set(ids);

      // All IDs should be unique
      expect(uniqueIds.size).toBe(100);
    });

    it('should not contain special characters', () => {
      const traceId = generateTraceId();
      expect(traceId).not.toMatch(/[^a-f0-9]/);
    });

    it('should maintain consistent length across generations', () => {
      const ids = Array.from({ length: 10 }, () => generateTraceId());

      ids.forEach(id => {
        expect(id).toHaveLength(32);
      });
    });
  });
});
