import { logger } from '../../src/utils/logger';

describe('Logger', () => {
  describe('Logger instance', () => {
    it('should be defined', () => {
      expect(logger).toBeDefined();
    });

    it('should have info method', () => {
      expect(logger.info).toBeDefined();
      expect(typeof logger.info).toBe('function');
    });

    it('should have error method', () => {
      expect(logger.error).toBeDefined();
      expect(typeof logger.error).toBe('function');
    });

    it('should have warn method', () => {
      expect(logger.warn).toBeDefined();
      expect(typeof logger.warn).toBe('function');
    });

    it('should have debug method', () => {
      expect(logger.debug).toBeDefined();
      expect(typeof logger.debug).toBe('function');
    });

    it('should have trace method', () => {
      expect(logger.trace).toBeDefined();
      expect(typeof logger.trace).toBe('function');
    });

    it('should have fatal method', () => {
      expect(logger.fatal).toBeDefined();
      expect(typeof logger.fatal).toBe('function');
    });
  });

  describe('Logger configuration', () => {
    it('should have level property', () => {
      expect(logger.level).toBeDefined();
      expect(typeof logger.level).toBe('string');
    });

    it('should support logging simple messages', () => {
      expect(() => {
        logger.info('Test message');
      }).not.toThrow();
    });

    it('should support logging with metadata object', () => {
      expect(() => {
        logger.info({ key: 'value' }, 'Test message with metadata');
      }).not.toThrow();
    });

    it('should support logging errors', () => {
      expect(() => {
        const error = new Error('Test error');
        logger.error({ error }, 'Error occurred');
      }).not.toThrow();
    });

    it('should support logging with nested objects', () => {
      expect(() => {
        logger.info({
          user: { id: '123', name: 'Test User' },
          action: 'test-action',
        }, 'Complex metadata');
      }).not.toThrow();
    });
  });

  describe('Log levels', () => {
    it('should log info level messages', () => {
      expect(() => {
        logger.info('Info message');
      }).not.toThrow();
    });

    it('should log warn level messages', () => {
      expect(() => {
        logger.warn('Warning message');
      }).not.toThrow();
    });

    it('should log error level messages', () => {
      expect(() => {
        logger.error('Error message');
      }).not.toThrow();
    });

    it('should log debug level messages', () => {
      expect(() => {
        logger.debug('Debug message');
      }).not.toThrow();
    });
  });
});
