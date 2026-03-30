import { CardStatusType, ReplacementReasonType } from './enums';

export interface Card {
  cardNumber: string;
  accountId: string;
  customerId: string;
  embossedName: string;
  cvv: string;
  expirationDate: Date;
  issuedDate: Date;
  status: CardStatusType;
  createdAt: Date;
  updatedAt: Date;
}

export interface CardReplacementHistory {
  replacementId: string;
  originalCardNumber: string;
  replacementCardNumber: string;
  replacementReason: ReplacementReasonType;
  requestedBy: string;
  requestedAt: Date;
  expeditedShipping: boolean;
  estimatedDelivery: Date;
  deliveryLine1: string;
  deliveryLine2?: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZipCode: string;
}

export interface AuditLog {
  id: string;
  eventType: string;
  entityType: string;
  entityId: string;
  userId: string;
  traceId: string;
  eventData: Record<string, unknown>;
  timestamp: Date;
}
