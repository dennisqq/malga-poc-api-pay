export class PaymentResponseDto {
  id: string;
  provider: string;
  status: string;
  originalAmount: number;
  amount: number;
}
