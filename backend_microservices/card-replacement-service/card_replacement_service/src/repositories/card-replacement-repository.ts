import { Knex } from 'knex';
import { CardReplacementHistory } from '../types/entities';
import { DeliveryAddress } from '../types/dtos';
import { ReplacementReasonType } from '../types/enums';

export interface ICardReplacementRepository {
  create(replacement: CreateReplacementParams): Promise<CardReplacementHistory>;
  findByOriginalCard(originalCardNumber: string): Promise<CardReplacementHistory | null>;
}

export interface CreateReplacementParams {
  originalCardNumber: string;
  replacementCardNumber: string;
  replacementReason: ReplacementReasonType;
  requestedBy: string;
  expeditedShipping: boolean;
  estimatedDelivery: Date;
  deliveryAddress: DeliveryAddress;
}

export class CardReplacementRepository implements ICardReplacementRepository {
  constructor(private readonly db: Knex) {}

  async create(replacement: CreateReplacementParams): Promise<CardReplacementHistory> {
    const [row] = await this.db('card_replacement_history')
      .insert({
        original_card_number: replacement.originalCardNumber,
        replacement_card_number: replacement.replacementCardNumber,
        replacement_reason: replacement.replacementReason,
        requested_by: replacement.requestedBy,
        expedited_shipping: replacement.expeditedShipping,
        estimated_delivery: replacement.estimatedDelivery,
        delivery_line1: replacement.deliveryAddress.line1,
        delivery_line2: replacement.deliveryAddress.line2,
        delivery_city: replacement.deliveryAddress.city,
        delivery_state: replacement.deliveryAddress.state,
        delivery_zip_code: replacement.deliveryAddress.zipCode,
      })
      .returning('*');

    return this.mapRowToReplacementHistory(row);
  }

  async findByOriginalCard(originalCardNumber: string): Promise<CardReplacementHistory | null> {
    const row = await this.db('card_replacement_history')
      .where({ original_card_number: originalCardNumber })
      .orderBy('requested_at', 'desc')
      .first();

    if (!row) {
      return null;
    }

    return this.mapRowToReplacementHistory(row);
  }

  private mapRowToReplacementHistory(row: Record<string, unknown>): CardReplacementHistory {
    return {
      replacementId: row.replacement_id as string,
      originalCardNumber: row.original_card_number as string,
      replacementCardNumber: row.replacement_card_number as string,
      replacementReason: row.replacement_reason as ReplacementReasonType,
      requestedBy: row.requested_by as string,
      requestedAt: new Date(row.requested_at as string),
      expeditedShipping: row.expedited_shipping as boolean,
      estimatedDelivery: new Date(row.estimated_delivery as string),
      deliveryLine1: row.delivery_line1 as string,
      deliveryLine2: row.delivery_line2 as string | undefined,
      deliveryCity: row.delivery_city as string,
      deliveryState: row.delivery_state as string,
      deliveryZipCode: row.delivery_zip_code as string,
    };
  }
}
