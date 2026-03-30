import { ReplacementReasonType, CardStatusType, ShippingMethodType } from './enums';

export interface DeliveryAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface CardReplacementRequest {
  replacementReason: ReplacementReasonType;
  deliveryAddress: DeliveryAddress;
  expeditedShipping?: boolean;
  notifyCustomer: boolean;
}

export interface CardReplacementResponse {
  originalCardNumber: string;
  originalCardStatus: CardStatusType;
  replacementCardNumber: string;
  replacementCardStatus: CardStatusType;
  accountId: string;
  customerId: string;
  embossedName: string;
  expirationDate: string;
  issuedDate: string;
  estimatedDelivery: string;
  shippingMethod: ShippingMethodType;
  activationRequired: boolean;
}

export interface ErrorResponse {
  errorCode: string;
  message: string;
  timestamp: string;
  traceId: string;
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  database?: {
    connected: boolean;
  };
}
