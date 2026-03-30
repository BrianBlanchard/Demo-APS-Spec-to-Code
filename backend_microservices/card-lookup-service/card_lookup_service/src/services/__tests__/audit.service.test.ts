import { AuditService } from '../audit.service';
import { UserRole } from '../../types/user-role.type';
import { logger } from '../../infrastructure/logger';

// Mock the logger
jest.mock('../../infrastructure/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(() => {
    service = new AuditService();
    jest.clearAllMocks();
  });

  describe('logCardAccess', () => {
    it('should log successful card access', () => {
      service.logCardAccess('4532123456781234', 'user123', UserRole.CUSTOMER, true);

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'CARD_ACCESS',
          maskedCardNumber: '****1234',
          userId: '****r123',
          userRole: 'customer',
          accessGranted: true,
        }),
        'Card access attempt'
      );
    });

    it('should log failed card access with reason', () => {
      service.logCardAccess(
        '4532123456781234',
        'user123',
        UserRole.CUSTOMER,
        false,
        'Card not found'
      );

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'CARD_ACCESS',
          maskedCardNumber: '****1234',
          userId: '****r123',
          userRole: 'customer',
          accessGranted: false,
          reason: 'Card not found',
        }),
        'Card access attempt'
      );
    });

    it('should log with CSR role', () => {
      service.logCardAccess('4532123456781234', 'csr456', UserRole.CSR, true);

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          userRole: 'csr',
        }),
        'Card access attempt'
      );
    });

    it('should log with ADMIN role', () => {
      service.logCardAccess('4532123456781234', 'admin789', UserRole.ADMIN, true);

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          userRole: 'admin',
        }),
        'Card access attempt'
      );
    });

    it('should mask short user IDs', () => {
      service.logCardAccess('4532123456781234', 'abc', UserRole.CUSTOMER, true);

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: '****',
        }),
        'Card access attempt'
      );
    });
  });

  describe('logFullCardNumberAccess', () => {
    it('should log admin full card number access with high severity', () => {
      service.logFullCardNumberAccess('4532123456781234', 'admin789');

      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'FULL_CARD_ACCESS',
          maskedCardNumber: '****1234',
          userId: '****n789',
          severity: 'HIGH',
          alertSecurityTeam: true,
        }),
        'Full card number accessed by admin'
      );
    });

    it('should use warn level for admin access', () => {
      service.logFullCardNumberAccess('4532123456781234', 'admin123');

      expect(logger.warn).toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });
  });
});
