export enum TransactionType {
  PURCHASE = '01',
  PAYMENT = '02',
  CASH_ADVANCE = '03',
  FEE = '04',
  INTEREST = '05',
  ADJUSTMENT = '06',
}

export enum TransactionSource {
  POS = 'POS',
  ONLINE = 'online',
  ATM = 'ATM',
}

export const TransactionTypeNames: Record<TransactionType, string> = {
  [TransactionType.PURCHASE]: 'purchase',
  [TransactionType.PAYMENT]: 'payment',
  [TransactionType.CASH_ADVANCE]: 'cash_advance',
  [TransactionType.FEE]: 'fee',
  [TransactionType.INTEREST]: 'interest',
  [TransactionType.ADJUSTMENT]: 'adjustment',
} as const;
