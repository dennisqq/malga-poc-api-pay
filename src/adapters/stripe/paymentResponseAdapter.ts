import { UnifiedTransactionDto } from 'src/dto/uniTransaction.dto';

export class StripeResponseAdapter {
  adaptResponse(response: any): UnifiedTransactionDto {
    return {
      id: response.id || '',
      createdAt: response.createdAt || new Date(response.createdAt).toISOString(),
      status: response.status || 'unknown',
      amount: response.currentAmount || 0,
      originalAmount: response.originalAmount || 0,
      currency: response.currency || 'USD',
      description: response.description || '',
      paymentMethod: response.paymentMethod || 'unknown',
      cardId: response.cardId || '',
      provider: 'stripe',
    };
  }
}
