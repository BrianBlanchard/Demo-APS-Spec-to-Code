export function maskAccountId(accountId: string): string {
  if (accountId.length <= 4) {
    return '***';
  }
  return '***' + accountId.slice(-4);
}

export function maskSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
  const masked = { ...data };

  if (masked.accountId && typeof masked.accountId === 'string') {
    masked.accountId = maskAccountId(masked.accountId);
  }

  return masked;
}
