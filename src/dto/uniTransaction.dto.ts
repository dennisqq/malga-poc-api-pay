export class UnifiedTransactionDto {
  id: string;
  createdAt: string;
  status: string;
  amount: number;
  originalAmount: number;
  currency: string;
  description: string;
  paymentMethod: string;
  cardId: string;
  provider: string;
}
