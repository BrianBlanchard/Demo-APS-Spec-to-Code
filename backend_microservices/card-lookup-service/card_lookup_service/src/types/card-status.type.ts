export const CardStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
  EXPIRED: 'expired',
} as const;

export type CardStatus = (typeof CardStatus)[keyof typeof CardStatus];
