import { TransactionsSupabaseRepository } from 'src/repository/transactions.supabase.repository';
import { BraintreeResponseAdapter } from 'src/adapters/braintree/paymentResponseAdapter';
import { StripeResponseAdapter } from 'src/adapters/stripe/paymentResponseAdapter';
import { BraintreeRepository } from 'src/repository/braintree.repository';
import { GetPaymentResponseDto } from 'src/dto/getPaymentResponse.dto';
import { StripeRepository } from 'src/repository/stripe.repository';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GetPaymentService {
  private readonly logger = new Logger(GetPaymentService.name);

  constructor(
    private readonly stripeRepository: StripeRepository,
    private readonly braintreeRepository: BraintreeRepository,
    private readonly stripeResponseAdapter: StripeResponseAdapter,
    private readonly braintreeResponseAdapter: BraintreeResponseAdapter,
    private readonly transactionsSupabaseRepository: TransactionsSupabaseRepository,
  ) {}

  public async runGetpayment(id): Promise<GetPaymentResponseDto> {
    let response;

    const { provider } = await this.transactionsSupabaseRepository.getTransactionOnSupaBase(id);

    if (provider === 'stripe') {
      this.logger.log('Buscando transação com Provedor: Stripe');
      const stripeResponse = await this.stripeRepository.getTransaction(id);
      response = this.stripeResponseAdapter.adaptResponse(stripeResponse);
    }

    if (provider === 'braintree') {
      this.logger.log('Buscando transação com Provedor: Braintree');
      const braintreeResponse = await this.braintreeRepository.getTransaction(id);
      response = this.braintreeResponseAdapter.adaptResponse(braintreeResponse);
    }

    return response;
  }
}
