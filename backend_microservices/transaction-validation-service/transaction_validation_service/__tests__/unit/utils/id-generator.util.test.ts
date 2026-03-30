import {
  generateValidationId,
  generateAuthorizationCode,
  generateTraceId,
} from '../../../src/utils/id-generator.util';

describe('ID Generator Utility', () => {
  describe('generateValidationId', () => {
    it('should generate validation ID with correct format', () => {
      const id = generateValidationId();
      expect(id).toMatch(/^VAL-\d{8}-[A-F0-9]{6}$/);
    });

    it('should generate unique validation IDs', () => {
      const id1 = generateValidationId();
      const id2 = generateValidationId();
      expect(id1).not.toBe(id2);
    });

    it('should start with VAL-', () => {
      const id = generateValidationId();
      expect(id.startsWith('VAL-')).toBe(true);
    });

    it('should include date in YYYYMMDD format', () => {
      const id = generateValidationId();
      const datePart = id.split('-')[1];
      expect(datePart).toHaveLength(8);
      expect(parseInt(datePart, 10)).toBeGreaterThan(20000000);
    });

    it('should include 6-character hex suffix', () => {
      const id = generateValidationId();
      const suffix = id.split('-')[2];
      expect(suffix).toHaveLength(6);
      expect(suffix).toMatch(/^[A-F0-9]{6}$/);
    });

    it('should generate multiple unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateValidationId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('generateAuthorizationCode', () => {
    it('should generate authorization code with correct format', () => {
      const code = generateAuthorizationCode();
      expect(code).toMatch(/^AUTH[A-F0-9]{6}$/);
    });

    it('should generate unique authorization codes', () => {
      const code1 = generateAuthorizationCode();
      const code2 = generateAuthorizationCode();
      expect(code1).not.toBe(code2);
    });

    it('should start with AUTH', () => {
      const code = generateAuthorizationCode();
      expect(code.startsWith('AUTH')).toBe(true);
    });

    it('should have 10 total characters', () => {
      const code = generateAuthorizationCode();
      expect(code).toHaveLength(10);
    });

    it('should have uppercase hex suffix', () => {
      const code = generateAuthorizationCode();
      const suffix = code.substring(4);
      expect(suffix).toMatch(/^[A-F0-9]{6}$/);
    });

    it('should generate multiple unique codes', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateAuthorizationCode());
      }
      expect(codes.size).toBe(100);
    });
  });

  describe('generateTraceId', () => {
    it('should generate UUID v4 format', () => {
      const traceId = generateTraceId();
      expect(traceId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should generate unique trace IDs', () => {
      const id1 = generateTraceId();
      const id2 = generateTraceId();
      expect(id1).not.toBe(id2);
    });

    it('should have correct UUID version (4)', () => {
      const traceId = generateTraceId();
      const parts = traceId.split('-');
      expect(parts[2].charAt(0)).toBe('4');
    });

    it('should generate lowercase hex characters', () => {
      const traceId = generateTraceId();
      expect(traceId).toMatch(/^[0-9a-f-]+$/);
    });

    it('should generate multiple unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateTraceId());
      }
      expect(ids.size).toBe(100);
    });

    it('should have correct structure', () => {
      const traceId = generateTraceId();
      const parts = traceId.split('-');
      expect(parts).toHaveLength(5);
      expect(parts[0]).toHaveLength(8);
      expect(parts[1]).toHaveLength(4);
      expect(parts[2]).toHaveLength(4);
      expect(parts[3]).toHaveLength(4);
      expect(parts[4]).toHaveLength(12);
    });
  });
});
