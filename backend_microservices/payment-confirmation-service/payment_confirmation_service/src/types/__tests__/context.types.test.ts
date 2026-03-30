import { RequestContext } from '../context.types';

describe('Context Types', () => {
  describe('RequestContext interface', () => {
    it('should accept a valid request context object', () => {
      const context: RequestContext = {
        traceId: '550e8400-e29b-41d4-a716-446655440000',
        timestamp: '2024-01-15T10:30:00Z',
      };

      expect(context.traceId).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(context.timestamp).toBe('2024-01-15T10:30:00Z');
    });

    it('should support various UUID formats for traceId', () => {
      const context1: RequestContext = {
        traceId: '123e4567-e89b-12d3-a456-426614174000',
        timestamp: '2024-01-15T10:30:00Z',
      };

      const context2: RequestContext = {
        traceId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        timestamp: '2024-01-15T10:30:00Z',
      };

      expect(context1.traceId).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(context2.traceId).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
    });

    it('should support ISO 8601 timestamp format', () => {
      const context: RequestContext = {
        traceId: '550e8400-e29b-41d4-a716-446655440000',
        timestamp: '2024-01-15T10:30:00.000Z',
      };

      expect(context.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});
