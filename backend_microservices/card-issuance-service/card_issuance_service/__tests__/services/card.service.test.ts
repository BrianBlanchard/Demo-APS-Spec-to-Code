import { CardService } from '../../src/services/card.service';
import { ICardRepository } from '../../src/repositories/card.repository';
import { IAccountRepository, AccountEntity } from '../../src/repositories/account.repository';
import { IEncryptionService } from '../../src/services/encryption.service';
import { IAuditService } from '../../src/services/audit.service';
import { AccountStatus } from '../../src/types/account-status.enum';
import { CardStatus } from '../../src/types/card-status.enum';
import { CardEntity } from '../../src/entities/card.entity';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
} from '../../src/types/error-response';

describe('CardService', () => {
  let cardService: CardService;
  let mockCardRepository: jest.Mocked<ICardRepository>;
  let mockAccountRepository: jest.Mocked<IAccountRepository>;
  let mockEncryptionService: jest.Mocked<IEncryptionService>;
  let mockAuditService: jest.Mocked<IAuditService>;

  beforeEach(() => {
    mockCardRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEncryptedCardNumber: jest.fn(),
      findByLastFourDigits: jest.fn(),
      findByAccountId: jest.fn(),
    };

    mockAccountRepository = {
      findByAccountId: jest.fn(),
    };

    mockEncryptionService = {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
    };

    mockAuditService = {
      logAudit: jest.fn(),
    };

    cardService = new CardService(
      mockCardRepository,
      mockAccountRepository,
      mockEncryptionService,
      mockAuditService,
    );
  });

  describe('issueCard', () => {
    const validRequest = {
      cardNumber: '4532015112830366',
      accountId: '12345678901',
      embossedName: 'JOHN SMITH',
      expirationYears: 3,
    };

    const mockAccount: AccountEntity = {
      id: 1,
      account_id: '12345678901',
      status: AccountStatus.ACTIVE,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockCardEntity: CardEntity = {
      id: 5001,
      card_number: 'encrypted-card-number',
      last_four_digits: '0366',
      account_id: '12345678901',
      status: CardStatus.ISSUED,
      expiration_date: new Date('2029-03-31'),
      embossed_name: 'JOHN SMITH',
      created_at: new Date('2026-03-13T18:00:00Z'),
      updated_at: new Date('2026-03-13T18:00:00Z'),
    };

    it('should successfully issue a card with valid data', async () => {
      mockAccountRepository.findByAccountId.mockResolvedValue(mockAccount);
      mockEncryptionService.encrypt.mockResolvedValue('encrypted-card-number');
      mockCardRepository.findByEncryptedCardNumber.mockResolvedValue(null);
      mockCardRepository.create.mockResolvedValue(mockCardEntity);

      const result = await cardService.issueCard(validRequest, 'user-123');

      expect(result).toMatchObject({
        id: 5001,
        lastFourDigits: '0366',
        accountId: '12345678901',
        status: CardStatus.ISSUED,
        embossedName: 'JOHN SMITH',
      });
      expect(result.cardNumber).toMatch(/^\*{4}-\*{4}-\*{4}-\d{4}$/);
      expect(mockAuditService.logAudit).toHaveBeenCalledWith({
        entityType: 'CARD',
        entityId: 5001,
        action: 'CARD_CREATED',
        userId: 'user-123',
        source: 'UI',
      });
    });

    it('should reject card number with invalid format', async () => {
      const invalidRequest = { ...validRequest, cardNumber: '12345' };

      await expect(cardService.issueCard(invalidRequest, 'user-123')).rejects.toThrow(
        ValidationError,
      );
      await expect(cardService.issueCard(invalidRequest, 'user-123')).rejects.toThrow(
        'Card number must be exactly 16 digits',
      );
    });

    it('should reject card number failing Luhn validation', async () => {
      const invalidRequest = { ...validRequest, cardNumber: '4532015112830367' };

      await expect(cardService.issueCard(invalidRequest, 'user-123')).rejects.toThrow(
        ValidationError,
      );
      await expect(cardService.issueCard(invalidRequest, 'user-123')).rejects.toThrow(
        'Invalid card number format (failed checksum validation)',
      );
    });

    it('should reject when account does not exist', async () => {
      mockAccountRepository.findByAccountId.mockResolvedValue(null);

      await expect(cardService.issueCard(validRequest, 'user-123')).rejects.toThrow(
        NotFoundError,
      );
      await expect(cardService.issueCard(validRequest, 'user-123')).rejects.toThrow(
        'Account 12345678901 does not exist',
      );
    });

    it('should reject when account is closed', async () => {
      const closedAccount = { ...mockAccount, status: AccountStatus.CLOSED };
      mockAccountRepository.findByAccountId.mockResolvedValue(closedAccount);

      await expect(cardService.issueCard(validRequest, 'user-123')).rejects.toThrow(
        UnprocessableEntityError,
      );
      await expect(cardService.issueCard(validRequest, 'user-123')).rejects.toThrow(
        'Cannot issue cards for closed accounts',
      );
    });

    it('should reject when account is suspended', async () => {
      const suspendedAccount = { ...mockAccount, status: AccountStatus.SUSPENDED };
      mockAccountRepository.findByAccountId.mockResolvedValue(suspendedAccount);

      await expect(cardService.issueCard(validRequest, 'user-123')).rejects.toThrow(
        UnprocessableEntityError,
      );
      await expect(cardService.issueCard(validRequest, 'user-123')).rejects.toThrow(
        'Cannot issue cards for suspended accounts',
      );
    });

    it('should reject when account is not active', async () => {
      const newAccount = { ...mockAccount, status: AccountStatus.NEW };
      mockAccountRepository.findByAccountId.mockResolvedValue(newAccount);

      await expect(cardService.issueCard(validRequest, 'user-123')).rejects.toThrow(
        UnprocessableEntityError,
      );
      await expect(cardService.issueCard(validRequest, 'user-123')).rejects.toThrow(
        'Can only issue cards for Active accounts. Current status: New',
      );
    });

    it('should reject duplicate card number', async () => {
      mockAccountRepository.findByAccountId.mockResolvedValue(mockAccount);
      mockEncryptionService.encrypt.mockResolvedValue('encrypted-card-number');
      mockCardRepository.findByEncryptedCardNumber.mockResolvedValue(mockCardEntity);

      await expect(cardService.issueCard(validRequest, 'user-123')).rejects.toThrow(
        ConflictError,
      );
      await expect(cardService.issueCard(validRequest, 'user-123')).rejects.toThrow(
        'Card number already exists',
      );
    });

    it('should use default expiration years when not provided', async () => {
      const requestWithoutExpiration = {
        cardNumber: '4532015112830366',
        accountId: '12345678901',
        expirationYears: 3,
      };

      mockAccountRepository.findByAccountId.mockResolvedValue(mockAccount);
      mockEncryptionService.encrypt.mockResolvedValue('encrypted-card-number');
      mockCardRepository.findByEncryptedCardNumber.mockResolvedValue(null);
      mockCardRepository.create.mockResolvedValue(mockCardEntity);

      await cardService.issueCard(requestWithoutExpiration, 'user-123');

      expect(mockCardRepository.create).toHaveBeenCalled();
      const createCall = mockCardRepository.create.mock.calls[0][0];
      expect(createCall.expiration_date.getFullYear()).toBeGreaterThanOrEqual(
        new Date().getFullYear() + 3,
      );
    });

    it('should extract and store last 4 digits', async () => {
      mockAccountRepository.findByAccountId.mockResolvedValue(mockAccount);
      mockEncryptionService.encrypt.mockResolvedValue('encrypted-card-number');
      mockCardRepository.findByEncryptedCardNumber.mockResolvedValue(null);
      mockCardRepository.create.mockResolvedValue(mockCardEntity);

      await cardService.issueCard(validRequest, 'user-123');

      expect(mockCardRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          last_four_digits: '0366',
        }),
      );
    });

    it('should encrypt card number before storage', async () => {
      mockAccountRepository.findByAccountId.mockResolvedValue(mockAccount);
      mockEncryptionService.encrypt.mockResolvedValue('encrypted-card-number');
      mockCardRepository.findByEncryptedCardNumber.mockResolvedValue(null);
      mockCardRepository.create.mockResolvedValue(mockCardEntity);

      await cardService.issueCard(validRequest, 'user-123');

      expect(mockEncryptionService.encrypt).toHaveBeenCalledWith('4532015112830366');
      expect(mockCardRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          card_number: 'encrypted-card-number',
        }),
      );
    });

    it('should set initial status to ISSUED', async () => {
      mockAccountRepository.findByAccountId.mockResolvedValue(mockAccount);
      mockEncryptionService.encrypt.mockResolvedValue('encrypted-card-number');
      mockCardRepository.findByEncryptedCardNumber.mockResolvedValue(null);
      mockCardRepository.create.mockResolvedValue(mockCardEntity);

      await cardService.issueCard(validRequest, 'user-123');

      expect(mockCardRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: CardStatus.ISSUED,
        }),
      );
    });

    it('should handle embossed name correctly', async () => {
      mockAccountRepository.findByAccountId.mockResolvedValue(mockAccount);
      mockEncryptionService.encrypt.mockResolvedValue('encrypted-card-number');
      mockCardRepository.findByEncryptedCardNumber.mockResolvedValue(null);
      mockCardRepository.create.mockResolvedValue(mockCardEntity);

      await cardService.issueCard(validRequest, 'user-123');

      expect(mockCardRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          embossed_name: 'JOHN SMITH',
        }),
      );
    });

    it('should mask card number in response', async () => {
      mockAccountRepository.findByAccountId.mockResolvedValue(mockAccount);
      mockEncryptionService.encrypt.mockResolvedValue('encrypted-card-number');
      mockCardRepository.findByEncryptedCardNumber.mockResolvedValue(null);
      mockCardRepository.create.mockResolvedValue(mockCardEntity);

      const result = await cardService.issueCard(validRequest, 'user-123');

      expect(result.cardNumber).not.toContain('4532015112830366');
      expect(result.cardNumber).toMatch(/^\*{4}-\*{4}-\*{4}-0366$/);
    });
  });
});
