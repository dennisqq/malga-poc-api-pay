export class RefundResponseDto {
  id: string;
  parentTransactionId: string;
  provider: string;
  status: string;
  originalAmount: number;
  amount: number;
}
