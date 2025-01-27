import { StripeResponseAdapter } from 'src/adapters/stripe/paymentResponseAdapter';
import { StripeAdapter } from 'src/adapters/stripe/paymentRequestAdapter';
import { UnifiedTransactionDto } from 'src/dto/uniTransaction.dto';
import { StripeRepository } from 'src/repository/stripe.repository';
import { CreatePaymentDto } from 'src/dto/createPayment.dto';
import { Injectable, Logger } from '@nestjs/common';
import { FlagService } from '../modules/flag/service/flag.service';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  constructor(
    private readonly stripeAdapter: StripeAdapter,
    private readonly stripeResponseAdapter: StripeResponseAdapter,
    private readonly stripeRepository: StripeRepository,
    private readonly flagService: FlagService,
  ) {}

  public async processPayment(body: CreatePaymentDto): Promise<UnifiedTransactionDto> {
    this.logger.log('Iniciando processamento com Provedor: Stripe');

    if (!this.flagService.getState('stripe')) {
      this.logger.error('Stripe provedor desativado');
      throw new Error('Stripe provedor desativado');
    }

    const adaptStripeRequest = await this.stripeAdapter.chargesAdaptRequest(body);
    const stripeResponse = await this.stripeRepository.createPayment(adaptStripeRequest);
    return this.stripeResponseAdapter.adaptResponse(stripeResponse);
  }

  public async createRefund(transactionId: string, amount: number): Promise<UnifiedTransactionDto> {
    const response = await this.stripeRepository.createRefund(transactionId, amount);
    return this.stripeResponseAdapter.adaptResponse(response);
  }
}
