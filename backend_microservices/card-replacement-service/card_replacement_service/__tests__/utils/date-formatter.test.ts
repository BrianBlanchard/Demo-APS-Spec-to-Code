import { formatDate, formatDateTime, parseDate } from '../../src/utils/date-formatter';

describe('Date Formatter Utilities', () => {
  describe('formatDate', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDate(date);
      expect(formatted).toBe('2024-01-15');
    });

    it('should pad single digit month', () => {
      const date = new Date('2024-03-05T10:30:00Z');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should pad single digit day', () => {
      const date = new Date('2024-12-09T10:30:00Z');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should handle end of month', () => {
      const date = new Date('2024-02-29T10:30:00Z'); // Leap year
      const formatted = formatDate(date);
      expect(formatted).toBe('2024-02-29');
    });

    it('should handle end of year', () => {
      const date = new Date('2024-12-31T23:59:59Z');
      const formatted = formatDate(date);
      expect(formatted).toBe('2024-12-31');
    });

    it('should handle start of year', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const formatted = formatDate(date);
      expect(formatted).toBe('2024-01-01');
    });
  });

  describe('formatDateTime', () => {
    it('should format date as ISO 8601 string', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      const formatted = formatDateTime(date);
      expect(formatted).toBe('2024-01-15T10:30:00.000Z');
    });

    it('should include milliseconds', () => {
      const date = new Date('2024-01-15T10:30:45.123Z');
      const formatted = formatDateTime(date);
      expect(formatted).toContain('.123Z');
    });

    it('should include timezone (Z)', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      const formatted = formatDateTime(date);
      expect(formatted).toMatch(/Z$/);
    });

    it('should handle midnight', () => {
      const date = new Date('2024-01-15T00:00:00.000Z');
      const formatted = formatDateTime(date);
      expect(formatted).toBe('2024-01-15T00:00:00.000Z');
    });

    it('should handle end of day', () => {
      const date = new Date('2024-01-15T23:59:59.999Z');
      const formatted = formatDateTime(date);
      expect(formatted).toBe('2024-01-15T23:59:59.999Z');
    });
  });

  describe('parseDate', () => {
    it('should parse valid ISO date string', () => {
      const dateString = '2024-01-15T10:30:00.000Z';
      const date = parseDate(dateString);
      expect(date).toBeInstanceOf(Date);
      expect(date.toISOString()).toBe(dateString);
    });

    it('should parse date-only string', () => {
      const dateString = '2024-01-15';
      const date = parseDate(dateString);
      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0); // January is 0
      expect(date.getDate()).toBe(15);
    });

    it('should parse datetime with timezone', () => {
      const dateString = '2024-01-15T10:30:00.000Z';
      const date = parseDate(dateString);
      expect(date.getUTCHours()).toBe(10);
      expect(date.getUTCMinutes()).toBe(30);
    });

    it('should handle various date formats', () => {
      const formats = [
        '2024-01-15',
        '2024-01-15T10:30:00Z',
        '2024-01-15T10:30:00.000Z',
        'Mon Jan 15 2024 10:30:00 GMT+0000',
      ];

      formats.forEach((format) => {
        const date = parseDate(format);
        expect(date).toBeInstanceOf(Date);
        expect(isNaN(date.getTime())).toBe(false);
      });
    });

    it('should return invalid date for invalid string', () => {
      const dateString = 'invalid-date';
      const date = parseDate(dateString);
      expect(isNaN(date.getTime())).toBe(true);
    });
  });

  describe('Integration: format and parse round trip', () => {
    it('should maintain date integrity through formatDateTime and parseDate', () => {
      const original = new Date('2024-01-15T10:30:45.123Z');
      const formatted = formatDateTime(original);
      const parsed = parseDate(formatted);

      expect(parsed.getTime()).toBe(original.getTime());
    });

    it('should maintain date through formatDate and parseDate', () => {
      const original = new Date('2024-01-15T00:00:00.000Z');
      const formatted = formatDate(original);
      const parsed = parseDate(formatted);

      expect(parsed.getFullYear()).toBe(original.getFullYear());
      expect(parsed.getMonth()).toBe(original.getMonth());
      expect(parsed.getDate()).toBe(original.getDate());
    });
  });
});
