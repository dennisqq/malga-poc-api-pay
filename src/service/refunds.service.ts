import { TransactionsSupabaseRepository } from 'src/repository/transactions.supabase.repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { RefundResponseDto } from 'src/dto/refundResponse.dto';
import { BraintreeService } from './braintree.service';
import { StripeService } from './stripe.service';

@Injectable()
export class RefundsService {
  constructor(
    private readonly stripeService: StripeService,
    private readonly braintreeService: BraintreeService,
    private readonly transactionsSupabaseRepository: TransactionsSupabaseRepository,
  ) {}

  async runRefunds(body: any): Promise<any> {
    const originalTransaction = await this.transactionsSupabaseRepository.getTransactionOnSupaBase(body.id);

    this.validateRefund(originalTransaction, body.amount);

    const refundResponse = await this.processProviderRefund(originalTransaction, body.amount);
    const refund = {
      ...refundResponse,
      parentTransactionId: originalTransaction.id,
    };

    await this.transactionsSupabaseRepository.createRefoundTransactionOnSupaBase(refund);
    await this.transactionsSupabaseRepository.updateAmountTransactionOnSupaBase(originalTransaction.id, refundResponse.amount);

    return this.mountResponse(refund);
  }

  private async processProviderRefund(transaction: any, amount: number): Promise<any> {
    if (transaction.provider === 'stripe') {
      return this.stripeService.createRefund(transaction.id, amount);
    }

    if (transaction.provider === 'braintree') {
      return this.braintreeService.createRefund(transaction.id, amount);
    }

    throw new BadRequestException('Provedor não suportado.');
  }

  private validateRefund(originalTransaction: any, amount: number): void {
    if (originalTransaction.status !== 'paid' && originalTransaction.status !== 'authorized') {
      throw new BadRequestException(`Estorno não permitido para transações com status: ${originalTransaction.status}`);
    }

    if (amount > originalTransaction.amount) {
      throw new BadRequestException(`Valor do estorno (${amount}) excede o valor disponível (${originalTransaction.amount})`);
    }
  }

  private mountResponse(refund: any): RefundResponseDto {
    const { id, parentTransactionId, status, provider, originalAmount, amount } = refund;
    return { id, parentTransactionId, status, provider, originalAmount, amount };
  }
}
