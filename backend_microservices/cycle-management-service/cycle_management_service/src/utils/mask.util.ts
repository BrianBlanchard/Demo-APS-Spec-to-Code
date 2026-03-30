export const maskAccountNumber = (accountNumber: string): string => {
  if (accountNumber.length <= 4) {
    return '****';
  }
  return '****' + accountNumber.slice(-4);
};

export const maskSensitiveData = (data: Record<string, unknown>): Record<string, unknown> => {
  const masked = { ...data };

  if (masked.accountNumber) {
    masked.accountNumber = maskAccountNumber(String(masked.accountNumber));
  }

  if (masked.accountId) {
    masked.accountId = maskAccountNumber(String(masked.accountId));
  }

  return masked;
};
