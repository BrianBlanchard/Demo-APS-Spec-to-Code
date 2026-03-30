import { Channel, ChannelType, isValidChannel } from '../../src/types/channel.type';

describe('Channel Type', () => {
  describe('Channel constants', () => {
    it('should have EMAIL constant', () => {
      expect(Channel.EMAIL).toBe('email');
    });

    it('should have SMS constant', () => {
      expect(Channel.SMS).toBe('sms');
    });

    it('should have PUSH constant', () => {
      expect(Channel.PUSH).toBe('push');
    });

    it('should have exactly 3 channel types', () => {
      expect(Object.keys(Channel).length).toBe(3);
    });
  });

  describe('isValidChannel', () => {
    it('should return true for valid email channel', () => {
      expect(isValidChannel('email')).toBe(true);
    });

    it('should return true for valid sms channel', () => {
      expect(isValidChannel('sms')).toBe(true);
    });

    it('should return true for valid push channel', () => {
      expect(isValidChannel('push')).toBe(true);
    });

    it('should return false for invalid channel', () => {
      expect(isValidChannel('invalid')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidChannel('')).toBe(false);
    });

    it('should return false for uppercase channel', () => {
      expect(isValidChannel('EMAIL')).toBe(false);
    });

    it('should return false for mixed case channel', () => {
      expect(isValidChannel('Email')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isValidChannel(null as any)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isValidChannel(undefined as any)).toBe(false);
    });
  });

  describe('ChannelType', () => {
    it('should accept valid channel types', () => {
      const email: ChannelType = 'email';
      const sms: ChannelType = 'sms';
      const push: ChannelType = 'push';

      expect(email).toBe('email');
      expect(sms).toBe('sms');
      expect(push).toBe('push');
    });
  });
});
