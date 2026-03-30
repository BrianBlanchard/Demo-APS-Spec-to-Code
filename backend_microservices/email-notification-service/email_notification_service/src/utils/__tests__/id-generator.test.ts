import { generateNotificationId, generateTraceId } from '../id-generator';

describe('ID Generator Utilities', () => {
  describe('generateNotificationId', () => {
    it('should generate a notification ID with correct format', () => {
      const id = generateNotificationId();

      expect(id).toMatch(/^EMAIL-\d{8}-[A-F0-9]{8}$/);
    });

    it('should include current date in notification ID', () => {
      const id = generateNotificationId();
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');

      expect(id).toContain(today);
    });

    it('should generate unique notification IDs', () => {
      const ids = new Set<string>();

      for (let i = 0; i < 100; i++) {
        ids.add(generateNotificationId());
      }

      expect(ids.size).toBe(100);
    });

    it('should start with EMAIL- prefix', () => {
      const id = generateNotificationId();

      expect(id).toMatch(/^EMAIL-/);
    });

    it('should have uppercase hex suffix', () => {
      const id = generateNotificationId();
      const suffix = id.split('-')[2];

      expect(suffix).toMatch(/^[A-F0-9]+$/);
      expect(suffix.length).toBe(8);
    });

    it('should generate different IDs on consecutive calls', () => {
      const id1 = generateNotificationId();
      const id2 = generateNotificationId();

      expect(id1).not.toBe(id2);
    });

    it('should maintain format across multiple generations', () => {
      const ids = Array.from({ length: 50 }, () => generateNotificationId());

      ids.forEach(id => {
        expect(id).toMatch(/^EMAIL-\d{8}-[A-F0-9]{8}$/);
      });
    });

    it('should include 8-digit date component', () => {
      const id = generateNotificationId();
      const datePart = id.split('-')[1];

      expect(datePart).toHaveLength(8);
      expect(datePart).toMatch(/^\d{8}$/);
    });

    it('should generate valid date format (YYYYMMDD)', () => {
      const id = generateNotificationId();
      const datePart = id.split('-')[1];
      const year = parseInt(datePart.substring(0, 4));
      const month = parseInt(datePart.substring(4, 6));
      const day = parseInt(datePart.substring(6, 8));

      expect(year).toBeGreaterThanOrEqual(2024);
      expect(month).toBeGreaterThanOrEqual(1);
      expect(month).toBeLessThanOrEqual(12);
      expect(day).toBeGreaterThanOrEqual(1);
      expect(day).toBeLessThanOrEqual(31);
    });
  });

  describe('generateTraceId', () => {
    it('should generate a 32-character hexadecimal trace ID', () => {
      const id = generateTraceId();

      expect(id).toMatch(/^[a-f0-9]{32}$/);
      expect(id.length).toBe(32);
    });

    it('should generate unique trace IDs', () => {
      const ids = new Set<string>();

      for (let i = 0; i < 100; i++) {
        ids.add(generateTraceId());
      }

      expect(ids.size).toBe(100);
    });

    it('should generate different IDs on consecutive calls', () => {
      const id1 = generateTraceId();
      const id2 = generateTraceId();

      expect(id1).not.toBe(id2);
    });

    it('should use lowercase hexadecimal characters', () => {
      const ids = Array.from({ length: 20 }, () => generateTraceId());

      ids.forEach(id => {
        expect(id).toMatch(/^[a-f0-9]+$/);
        expect(id).not.toMatch(/[A-F]/);
      });
    });

    it('should maintain consistent length', () => {
      const ids = Array.from({ length: 50 }, () => generateTraceId());

      ids.forEach(id => {
        expect(id.length).toBe(32);
      });
    });

    it('should have high entropy (no repeated patterns)', () => {
      const ids = Array.from({ length: 10 }, () => generateTraceId());

      // Check that IDs don't have obvious repeated patterns
      ids.forEach(id => {
        const firstHalf = id.substring(0, 16);
        const secondHalf = id.substring(16, 32);
        expect(firstHalf).not.toBe(secondHalf);
      });
    });

    it('should generate cryptographically random IDs', () => {
      const ids = Array.from({ length: 100 }, () => generateTraceId());
      const uniqueChars = new Set(ids.join('').split(''));

      // Should use most hexadecimal characters (0-9, a-f)
      expect(uniqueChars.size).toBeGreaterThanOrEqual(14);
    });
  });

  describe('ID Generator Integration', () => {
    it('should generate IDs that can be used together', () => {
      const notificationId = generateNotificationId();
      const traceId = generateTraceId();

      expect(notificationId).toBeTruthy();
      expect(traceId).toBeTruthy();
      expect(notificationId).not.toBe(traceId);
    });

    it('should handle rapid generation without collisions', () => {
      const notificationIds = new Set<string>();
      const traceIds = new Set<string>();

      for (let i = 0; i < 1000; i++) {
        notificationIds.add(generateNotificationId());
        traceIds.add(generateTraceId());
      }

      expect(notificationIds.size).toBe(1000);
      expect(traceIds.size).toBe(1000);
    });
  });
});
