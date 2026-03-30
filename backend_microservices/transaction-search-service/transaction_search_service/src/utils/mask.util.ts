export function maskCardNumber(cardNumber: string): string {
  if (!cardNumber || cardNumber.length !== 16) {
    return cardNumber;
  }
  return `************${cardNumber.slice(-4)}`;
}

export function maskAccountId(accountId: string): string {
  if (!accountId || accountId.length < 4) {
    return accountId;
  }
  return `*******${accountId.slice(-4)}`;
}
