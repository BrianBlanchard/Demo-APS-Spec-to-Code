export interface FeeAssessmentResponseDto {
  accountId: string;
  feeType: string;
  amount: number;
  transactionId: string;
  posted: boolean;
}
