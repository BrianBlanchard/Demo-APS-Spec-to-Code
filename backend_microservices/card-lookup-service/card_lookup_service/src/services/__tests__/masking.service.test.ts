import { MaskingService } from '../masking.service';
import { UserRole } from '../../types/user-role.type';

describe('MaskingService', () => {
  let service: MaskingService;

  beforeEach(() => {
    service = new MaskingService();
  });

  describe('maskCardNumber', () => {
    const fullCardNumber = '4532123456781234';

    it('should mask card number for customer (last 4 digits visible)', () => {
      const masked = service.maskCardNumber(fullCardNumber, UserRole.CUSTOMER);
      expect(masked).toBe('************1234');
    });

    it('should mask card number for CSR (last 6 digits visible)', () => {
      const masked = service.maskCardNumber(fullCardNumber, UserRole.CSR);
      expect(masked).toBe('**********781234');
    });

    it('should not mask card number for admin', () => {
      const masked = service.maskCardNumber(fullCardNumber, UserRole.ADMIN);
      expect(masked).toBe('4532123456781234');
    });

    it('should fully mask invalid card number (empty)', () => {
      const masked = service.maskCardNumber('', UserRole.CUSTOMER);
      expect(masked).toBe('****************');
    });

    it('should fully mask invalid card number (wrong length)', () => {
      const masked = service.maskCardNumber('123', UserRole.CUSTOMER);
      expect(masked).toBe('****************');
    });

    it('should fully mask invalid card number (too long)', () => {
      const masked = service.maskCardNumber('12345678901234567', UserRole.CUSTOMER);
      expect(masked).toBe('****************');
    });

    it('should handle edge case with exactly 16 characters', () => {
      const masked = service.maskCardNumber('1234567890123456', UserRole.CUSTOMER);
      expect(masked).toBe('************3456');
    });
  });

  describe('maskCvv', () => {
    it('should always return three asterisks', () => {
      const masked = service.maskCvv();
      expect(masked).toBe('***');
    });

    it('should always return the same value', () => {
      expect(service.maskCvv()).toBe(service.maskCvv());
    });
  });
});
