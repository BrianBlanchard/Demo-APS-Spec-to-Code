export const ReplacementReason = {
  LOST_OR_STOLEN: 'lost_or_stolen',
  DAMAGED: 'damaged',
  EXPIRING_SOON: 'expiring_soon',
  FRAUD_PREVENTION: 'fraud_prevention',
} as const;

export type ReplacementReasonType = typeof ReplacementReason[keyof typeof ReplacementReason];

export const CardStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  REPLACED: 'replaced',
} as const;

export type CardStatusType = typeof CardStatus[keyof typeof CardStatus];

export const ShippingMethod = {
  STANDARD: 'standard',
  EXPEDITED: 'expedited',
} as const;

export type ShippingMethodType = typeof ShippingMethod[keyof typeof ShippingMethod];
