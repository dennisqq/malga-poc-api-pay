export class GetPaymentResponseDto {
  id: string;
  createdAt: string;
  status: 'failed' | 'authorized' | 'refunded';
  amount: number;
  originalAmount: number;
  currency: string;
  description: string;
  paymentMethod: 'card';
  cardId: string;
  provider: string;
}
