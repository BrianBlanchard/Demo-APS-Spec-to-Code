import { ICardRepository } from '../repositories/card-repository';
import { ICardReplacementRepository } from '../repositories/card-replacement-repository';
import { IAuditService } from './audit-service';
import { CardReplacementRequest, CardReplacementResponse } from '../types/dtos';
import { CardStatus, ShippingMethod } from '../types/enums';
import {
  NotFoundError,
  UnprocessableEntityError,
  InternalServerError,
} from '../types/errors';
import {
  generateCardNumber,
  generateCVV,
  maskCardNumber,
  calculateExpirationDate,
  formatExpirationDate,
  calculateEstimatedDelivery,
} from '../utils/card-generator';
import { formatDate } from '../utils/date-formatter';
import { getUserId } from '../utils/trace-context';

export interface ICardReplacementService {
  replaceCard(
    originalCardNumber: string,
    request: CardReplacementRequest,
  ): Promise<CardReplacementResponse>;
}

export class CardReplacementService implements ICardReplacementService {
  constructor(
    private readonly cardRepository: ICardRepository,
    private readonly replacementRepository: ICardReplacementRepository,
    private readonly auditService: IAuditService,
  ) {}

  async replaceCard(
    originalCardNumber: string,
    request: CardReplacementRequest,
  ): Promise<CardReplacementResponse> {
    // Validate original card exists
    const originalCard = await this.cardRepository.findByCardNumber(originalCardNumber);
    if (!originalCard) {
      throw new NotFoundError('Original card not found');
    }

    // Validate original card status (must be active or suspended)
    if (
      originalCard.status !== CardStatus.ACTIVE &&
      originalCard.status !== CardStatus.SUSPENDED
    ) {
      throw new UnprocessableEntityError(
        `Card cannot be replaced. Current status: ${originalCard.status}`,
      );
    }

    // Check for recent replacement (within last 24 hours)
    const recentReplacementCardNumber = await this.cardRepository.checkRecentReplacement(
      originalCardNumber,
      24,
    );
    if (recentReplacementCardNumber) {
      const recentReplacementCard = await this.cardRepository.findByCardNumber(
        recentReplacementCardNumber,
      );
      if (recentReplacementCard) {
        return this.buildResponse(originalCard, recentReplacementCard, request.expeditedShipping);
      }
    }

    // Generate new card details
    const newCardNumber = generateCardNumber();
    const newCVV = generateCVV();
    const expirationDate = calculateExpirationDate(3);
    const issuedDate = new Date();
    const estimatedDelivery = calculateEstimatedDelivery(request.expeditedShipping || false);

    // Create new card record
    let newCard;
    try {
      newCard = await this.cardRepository.create({
        cardNumber: newCardNumber,
        accountId: originalCard.accountId,
        customerId: originalCard.customerId,
        embossedName: originalCard.embossedName,
        cvv: newCVV,
        expirationDate,
        issuedDate,
        status: CardStatus.ACTIVE,
      });
    } catch (error) {
      throw new InternalServerError('Failed to generate replacement card');
    }

    // Update original card status to inactive
    await this.cardRepository.updateStatus(originalCardNumber, CardStatus.INACTIVE);

    // Log status change
    await this.auditService.logCardStatusChange(
      originalCardNumber,
      originalCard.status,
      CardStatus.INACTIVE,
      request.replacementReason,
    );

    // Create replacement history record
    const userId = getUserId() || 'system';
    await this.replacementRepository.create({
      originalCardNumber,
      replacementCardNumber: newCardNumber,
      replacementReason: request.replacementReason,
      requestedBy: userId,
      expeditedShipping: request.expeditedShipping || false,
      estimatedDelivery,
      deliveryAddress: request.deliveryAddress,
    });

    // Log successful replacement
    await this.auditService.logCardReplacement(
      originalCardNumber,
      newCardNumber,
      request.replacementReason,
      'success',
      {
        expeditedShipping: request.expeditedShipping,
        estimatedDelivery: formatDate(estimatedDelivery),
      },
    );

    // TODO: Publish CardReplaced event to Kafka (not implemented in this version)
    // TODO: Trigger card production and shipping workflow (not implemented)
    // TODO: Send notification to customer if requested (not implemented)

    return this.buildResponse(originalCard, newCard, request.expeditedShipping);
  }

  private buildResponse(
    originalCard: { cardNumber: string; status: string; accountId: string; customerId: string; embossedName: string },
    newCard: { cardNumber: string; status: string; expirationDate: Date; issuedDate: Date },
    expeditedShipping?: boolean,
  ): CardReplacementResponse {
    const estimatedDelivery = calculateEstimatedDelivery(expeditedShipping || false);

    return {
      originalCardNumber: maskCardNumber(originalCard.cardNumber),
      originalCardStatus: CardStatus.INACTIVE,
      replacementCardNumber: maskCardNumber(newCard.cardNumber),
      replacementCardStatus: newCard.status as typeof CardStatus.ACTIVE,
      accountId: originalCard.accountId,
      customerId: originalCard.customerId,
      embossedName: originalCard.embossedName,
      expirationDate: formatExpirationDate(newCard.expirationDate),
      issuedDate: formatDate(newCard.issuedDate),
      estimatedDelivery: formatDate(estimatedDelivery),
      shippingMethod: expeditedShipping ? ShippingMethod.EXPEDITED : ShippingMethod.STANDARD,
      activationRequired: true,
    };
  }
}
