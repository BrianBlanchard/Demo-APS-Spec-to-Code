export enum AccountStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
}

export const VALID_STATUS_TRANSITIONS: Record<AccountStatus, AccountStatus[]> = {
  [AccountStatus.ACTIVE]: [AccountStatus.SUSPENDED, AccountStatus.INACTIVE],
  [AccountStatus.SUSPENDED]: [AccountStatus.ACTIVE, AccountStatus.INACTIVE],
  [AccountStatus.INACTIVE]: [], // Cannot transition from inactive
};

export function isValidTransition(
  currentStatus: AccountStatus,
  newStatus: AccountStatus
): boolean {
  return VALID_STATUS_TRANSITIONS[currentStatus].includes(newStatus);
}
