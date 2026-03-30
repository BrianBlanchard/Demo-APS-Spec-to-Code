export const AccountStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CLOSED: 'closed',
  SUSPENDED: 'suspended',
} as const;

export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];
