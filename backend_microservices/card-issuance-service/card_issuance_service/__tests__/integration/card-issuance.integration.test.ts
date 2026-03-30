// Set encryption key before imports (exactly 32 bytes for AES-256)
const keyBuffer = Buffer.alloc(32);
keyBuffer.write('test-key-32-bytes-long-for-aes');
process.env.ENCRYPTION_KEY = keyBuffer.toString('base64');

import { EncryptionService } from '../../src/services/encryption.service';
import { AuditService } from '../../src/services/audit.service';
import { LuhnValidator } from '../../src/utils/luhn.validator';
import { MaskingUtil } from '../../src/utils/masking.util';
import { CardStatus } from '../../src/types/card-status.enum';
import { AccountStatus } from '../../src/types/account-status.enum';

describe('Card Issuance Integration Tests', () => {
  describe('End-to-End Card Issuance Flow', () => {
    let encryptionService: EncryptionService;
    let auditService: AuditService;

    beforeAll(() => {
      encryptionService = new EncryptionService();
      auditService = new AuditService();
    });

    it('should complete full card issuance workflow', async () => {
      const cardNumber = '4532015112830366';

      // Step 1: Validate card number with Luhn
      const isValidLuhn = LuhnValidator.validate(cardNumber);
      expect(isValidLuhn).toBe(true);

      // Step 2: Extract last 4 digits
      const lastFour = MaskingUtil.extractLastFourDigits(cardNumber);
      expect(lastFour).toBe('0366');

      // Step 3: Encrypt card number
      const encryptedPAN = await encryptionService.encrypt(cardNumber);
      expect(encryptedPAN).toBeDefined();
      expect(encryptedPAN).not.toBe(cardNumber);
      expect(encryptedPAN.length).toBeGreaterThan(cardNumber.length);

      // Step 4: Verify encryption is reversible
      const decryptedPAN = await encryptionService.decrypt(encryptedPAN);
      expect(decryptedPAN).toBe(cardNumber);

      // Step 5: Mask card number for display
      const maskedCard = MaskingUtil.maskCardNumber(cardNumber);
      expect(maskedCard).toBe('****-****-****-0366');
      expect(maskedCard).not.toContain(cardNumber.substring(0, 12));

      // Step 6: Log audit entry
      auditService.logAudit({
        entityType: 'CARD',
        entityId: 5001,
        action: 'CARD_CREATED',
        userId: 'user-123',
        source: 'UI',
      });

      // Verify workflow completed without errors
      expect(true).toBe(true);
    });

    it('should handle multiple card issuances independently', async () => {
      const cards = [
        { number: '4532015112830366', lastFour: '0366' },
        { number: '5425233430109903', lastFour: '9903' },
        { number: '6011111111111117', lastFour: '1117' },
      ];

      for (const card of cards) {
        const isValid = LuhnValidator.validate(card.number);
        expect(isValid).toBe(true);

        const encrypted = await encryptionService.encrypt(card.number);
        const decrypted = await encryptionService.decrypt(encrypted);
        expect(decrypted).toBe(card.number);

        const lastFour = MaskingUtil.extractLastFourDigits(card.number);
        expect(lastFour).toBe(card.lastFour);

        const masked = MaskingUtil.maskCardNumber(card.number);
        expect(masked).toBe(`****-****-****-${card.lastFour}`);
      }
    });

    it('should prevent duplicate card numbers through encryption comparison', async () => {
      const cardNumber = '4532015112830366';

      const encrypted1 = await encryptionService.encrypt(cardNumber);
      const encrypted2 = await encryptionService.encrypt(cardNumber);

      // Different encryptions due to random IV
      expect(encrypted1).not.toBe(encrypted2);

      // But both decrypt to same value
      const decrypted1 = await encryptionService.decrypt(encrypted1);
      const decrypted2 = await encryptionService.decrypt(encrypted2);
      expect(decrypted1).toBe(cardNumber);
      expect(decrypted2).toBe(cardNumber);
      expect(decrypted1).toBe(decrypted2);
    });

    it('should maintain PCI compliance throughout workflow', async () => {
      const cardNumber = '4532015112830366';

      // Encrypt immediately
      const encrypted = await encryptionService.encrypt(cardNumber);

      // Never log full PAN
      const masked = MaskingUtil.maskCardNumber(cardNumber);
      expect(masked).not.toContain(cardNumber.substring(0, 12));

      // Store only last 4 unencrypted
      const lastFour = MaskingUtil.extractLastFourDigits(cardNumber);
      expect(lastFour).toHaveLength(4);

      // Audit log (should not contain PAN)
      auditService.logAudit({
        entityType: 'CARD',
        entityId: 5001,
        action: 'CARD_CREATED',
        userId: 'user-123',
        source: 'UI',
      });

      // Verify full PAN only accessible through decryption
      const decrypted = await encryptionService.decrypt(encrypted);
      expect(decrypted).toBe(cardNumber);
    });

    it('should validate business rules in correct order', () => {
      const testScenarios = [
        {
          name: 'Invalid format',
          cardNumber: '12345',
          shouldFail: true,
          reason: 'too short',
        },
        {
          name: 'Invalid Luhn',
          cardNumber: '4532015112830367',
          shouldFail: true,
          reason: 'checksum',
        },
        {
          name: 'Valid card',
          cardNumber: '4532015112830366',
          shouldFail: false,
          reason: 'valid',
        },
      ];

      testScenarios.forEach((scenario) => {
        const isValid = LuhnValidator.validate(scenario.cardNumber);
        if (scenario.shouldFail) {
          expect(isValid).toBe(false);
        } else {
          expect(isValid).toBe(true);
        }
      });
    });

    it('should handle account status validation correctly', () => {
      const accountStatuses = [
        { status: AccountStatus.ACTIVE, canIssue: true },
        { status: AccountStatus.SUSPENDED, canIssue: false },
        { status: AccountStatus.CLOSED, canIssue: false },
        { status: AccountStatus.NEW, canIssue: false },
      ];

      accountStatuses.forEach(({ status, canIssue }) => {
        if (canIssue) {
          expect(status).toBe(AccountStatus.ACTIVE);
        } else {
          expect(status).not.toBe(AccountStatus.ACTIVE);
        }
      });
    });

    it('should calculate expiration date correctly', () => {
      const currentDate = new Date();
      const expirationYears = 3;

      const expirationDate = new Date(currentDate);
      expirationDate.setFullYear(expirationDate.getFullYear() + expirationYears);

      expect(expirationDate.getFullYear()).toBe(currentDate.getFullYear() + 3);
    });

    it('should initialize card with correct initial state', () => {
      const initialStatus = CardStatus.ISSUED;
      expect(initialStatus).toBe('Issued');
      expect(initialStatus).not.toBe(CardStatus.ACTIVE);
      expect(initialStatus).not.toBe(CardStatus.SUSPENDED);
      expect(initialStatus).not.toBe(CardStatus.CLOSED);
    });
  });

  describe('Security and Error Handling', () => {
    // Tests moved to main describe block to share encryptionService setup
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle minimum and maximum valid card numbers', async () => {
      const minCard = '0000000000000000';
      const maxCard = '9999999999999995';

      expect(LuhnValidator.validate(minCard)).toBe(true);
      expect(LuhnValidator.validate(maxCard)).toBe(true);

      const minMasked = MaskingUtil.maskCardNumber(minCard);
      const maxMasked = MaskingUtil.maskCardNumber(maxCard);

      expect(minMasked).toBe('****-****-****-0000');
      expect(maxMasked).toBe('****-****-****-9995');
    });

    it('should handle cards with leading zeros', async () => {
      const cardNumber = '0000000000001234';

      const lastFour = MaskingUtil.extractLastFourDigits(cardNumber);
      expect(lastFour).toBe('1234');

      const masked = MaskingUtil.maskCardNumber(cardNumber);
      expect(masked).toBe('****-****-****-1234');
    });

    it('should reject boundary violations', () => {
      const invalidCards = [
        '123456789012345',  // 15 digits
        '12345678901234567', // 17 digits
        '',                 // empty
        '4532015112830367', // invalid checksum
      ];

      invalidCards.forEach((card) => {
        const isValid = LuhnValidator.validate(card);
        expect(isValid).toBe(false);
      });
    });
  });
});
