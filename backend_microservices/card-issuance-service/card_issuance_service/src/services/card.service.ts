import { CreateCardDto } from '../dto/create-card.dto';
import { CardResponseDto } from '../dto/card-response.dto';
import { ICardRepository } from '../repositories/card.repository';
import { IAccountRepository } from '../repositories/account.repository';
import { IEncryptionService } from './encryption.service';
import { IAuditService } from './audit.service';
import { LuhnValidator } from '../utils/luhn.validator';
import { MaskingUtil } from '../utils/masking.util';
import { CardStatus } from '../types/card-status.enum';
import { AccountStatus } from '../types/account-status.enum';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
} from '../types/error-response';

export interface ICardService {
  issueCard(dto: CreateCardDto, userId: string): Promise<CardResponseDto>;
}

export class CardService implements ICardService {
  constructor(
    private cardRepository: ICardRepository,
    private accountRepository: IAccountRepository,
    private encryptionService: IEncryptionService,
    private auditService: IAuditService,
  ) {}

  async issueCard(dto: CreateCardDto, userId: string): Promise<CardResponseDto> {
    // Validate card number format (16 digits)
    if (!/^\d{16}$/.test(dto.cardNumber)) {
      throw new ValidationError('Card number must be exactly 16 digits');
    }

    // Validate Luhn checksum
    if (!LuhnValidator.validate(dto.cardNumber)) {
      throw new ValidationError('Invalid card number format (failed checksum validation)');
    }

    // Validate account exists
    const account = await this.accountRepository.findByAccountId(dto.accountId);
    if (!account) {
      throw new NotFoundError(`Account ${dto.accountId} does not exist`);
    }

    // Validate account is Active
    if (account.status !== AccountStatus.ACTIVE) {
      if (account.status === AccountStatus.CLOSED) {
        throw new UnprocessableEntityError('Cannot issue cards for closed accounts');
      }
      if (account.status === AccountStatus.SUSPENDED) {
        throw new UnprocessableEntityError(
          'Cannot issue cards for suspended accounts. Reinstate account first.',
        );
      }
      throw new UnprocessableEntityError(
        `Can only issue cards for Active accounts. Current status: ${account.status}`,
      );
    }

    // Encrypt card number
    const encryptedCardNumber = await this.encryptionService.encrypt(dto.cardNumber);

    // Check for duplicate card number (encrypted comparison)
    const existingCard = await this.cardRepository.findByEncryptedCardNumber(encryptedCardNumber);
    if (existingCard) {
      throw new ConflictError('Card number already exists');
    }

    // Extract last 4 digits
    const lastFourDigits = MaskingUtil.extractLastFourDigits(dto.cardNumber);

    // Calculate expiration date
    const expirationYears = dto.expirationYears || 3;
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + expirationYears);

    // Create card entity
    const cardEntity = await this.cardRepository.create({
      card_number: encryptedCardNumber,
      last_four_digits: lastFourDigits,
      account_id: dto.accountId,
      status: CardStatus.ISSUED,
      expiration_date: expirationDate,
      embossed_name: dto.embossedName,
    });

    // Log PCI audit entry
    this.auditService.logAudit({
      entityType: 'CARD',
      entityId: cardEntity.id,
      action: 'CARD_CREATED',
      userId,
      source: 'UI',
    });

    // Return masked response
    return this.mapToResponseDto(cardEntity);
  }

  private mapToResponseDto(entity: CardEntity): CardResponseDto {
    return {
      id: entity.id,
      cardNumber: MaskingUtil.maskCardNumber(entity.last_four_digits.padStart(16, '0')),
      lastFourDigits: entity.last_four_digits,
      accountId: entity.account_id,
      status: entity.status,
      expirationDate: entity.expiration_date.toISOString().split('T')[0],
      embossedName: entity.embossed_name,
      createdAt: entity.created_at.toISOString(),
      updatedAt: entity.updated_at.toISOString(),
    };
  }
}

// Import CardEntity for type usage
import { CardEntity } from '../entities/card.entity';
