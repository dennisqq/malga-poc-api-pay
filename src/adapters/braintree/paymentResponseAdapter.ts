import { Injectable } from '@nestjs/common';
import { UnifiedTransactionDto } from 'src/dto/uniTransaction.dto';

@Injectable()
export class BraintreeResponseAdapter {
  adaptResponse(response: any): UnifiedTransactionDto {
    return {
      id: response.id,
      createdAt: new Date(response.date).toISOString(),
      status: response.status,
      amount: response.amount,
      originalAmount: response.originalAmount,
      currency: response.currency,
      description: response.statementDescriptor || '',
      paymentMethod: response.paymentType,
      cardId: response.cardId,
      provider: 'braintree',
    };
  }
}
