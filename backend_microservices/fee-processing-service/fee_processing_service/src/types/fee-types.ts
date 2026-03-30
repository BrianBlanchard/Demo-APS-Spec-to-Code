export enum FeeType {
  LATE_PAYMENT = 'late_payment',
  ANNUAL_FEE = 'annual_fee',
  OVER_LIMIT = 'over_limit',
  CASH_ADVANCE = 'cash_advance',
  RETURNED_PAYMENT = 'returned_payment',
}

export const FeeTypeDescriptions: Record<FeeType, string> = {
  [FeeType.LATE_PAYMENT]: 'Late payment fee',
  [FeeType.ANNUAL_FEE]: 'Annual account fee',
  [FeeType.OVER_LIMIT]: 'Over credit limit fee',
  [FeeType.CASH_ADVANCE]: 'Cash advance fee',
  [FeeType.RETURNED_PAYMENT]: 'Returned payment fee',
} as const;

export const TRANSACTION_TYPE_FEE = '04' as const;
