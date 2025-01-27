import { TransactionsSupabaseRepository } from 'src/repository/transactions.supabase.repository';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { UnifiedTransactionDto } from 'src/dto/uniTransaction.dto';
import { PaymentResponseDto } from 'src/dto/paymentReponse.dto';
import { CreatePaymentDto } from 'src/dto/createPayment.dto';
import { BraintreeService } from './braintree.service';
import { StripeService } from './stripe.service';
import * as CircuitBreaker from 'opossum';

@Injectable()
export class PaymentProcessingService {
  private readonly logger = new Logger(PaymentProcessingService.name);

  private readonly stripeBreaker: CircuitBreaker<[CreatePaymentDto], UnifiedTransactionDto>;
  private readonly braintreeBreaker: CircuitBreaker<[CreatePaymentDto], UnifiedTransactionDto>;

  constructor(
    private readonly stripeService: StripeService,
    private readonly braintreeService: BraintreeService,
    private readonly transactionsSupabaseRepository: TransactionsSupabaseRepository,
  ) {
    this.stripeBreaker = new CircuitBreaker<[CreatePaymentDto], UnifiedTransactionDto>((body) => this.stripeService.processPayment(body), {
      timeout: 5000,
      errorThresholdPercentage: 50,
      resetTimeout: 15000,
    });

    this.braintreeBreaker = new CircuitBreaker<[CreatePaymentDto], UnifiedTransactionDto>((body) => this.braintreeService.processPayment(body), {
      timeout: 5000,
      errorThresholdPercentage: 50,
      resetTimeout: 15000,
    });

    this.stripeBreaker.on('open', () => this.logger.error('Circuit Breaker para Stripe está ABERTO.'));
    this.stripeBreaker.on('close', () => this.logger.log('Circuit Breaker para Stripe está FECHADO.'));
    this.stripeBreaker.on('halfOpen', () => this.logger.error('Circuit Breaker para Stripe está SEMI-ABERTO.'));

    this.braintreeBreaker.on('open', () => this.logger.error('Circuit Breaker para Braintree está ABERTO.'));
    this.braintreeBreaker.on('close', () => this.logger.log('Circuit Breaker para Braintree está FECHADO.'));
    this.braintreeBreaker.on('halfOpen', () => this.logger.error('Circuit Breaker para Braintree está SEMI-ABERTO.'));
  }

  public async runProcessPayment(body: CreatePaymentDto): Promise<PaymentResponseDto> {
    this.logger.log('Iniciando o processamento de pagamento');
    let response: UnifiedTransactionDto;
    let lastStatusFailedResponse: UnifiedTransactionDto;

    try {
      response = await this.stripeBreaker.fire(body);
      await this.transactionsSupabaseRepository.createTransactionOnSupaBase(response);

      if (response.status === 'failed') {
        lastStatusFailedResponse = response;
        throw new BadRequestException(`Pagamento processado com status de falha pela Stripe`);
      }

      return this.mountReponse(response);
    } catch (error) {
      this.logger.error(`Falha ao processar com Stripe: ${error.message}`);
    }

    try {
      response = await this.braintreeBreaker.fire(body);
      await this.transactionsSupabaseRepository.createTransactionOnSupaBase(response);

      if (response.status === 'failed') {
        lastStatusFailedResponse = response;
        throw new BadRequestException(`Pagamento processado com status de falha pela Braintree`);
      }

      return this.mountReponse(response);
    } catch (error) {
      this.logger.error(`Falha ao processar com Braintree: ${error.message}`);
    }

    if (lastStatusFailedResponse) {
      this.logger.error('Chamada processada com status de falha');
      return this.mountReponse(lastStatusFailedResponse);
    }

    this.logger.error('Todos os provedores estão indisponíveis. Não foi possível processar o pagamento.');
    throw new BadRequestException('Não foi possível processar o pagamento. Todos os provedores estão indisponíveis.');
  }

  private mountReponse(response): PaymentResponseDto {
    const { id = '', status = '', provider = '', originalAmount = '', amount = '' } = response;
    return { id, status, provider, originalAmount, amount };
  }
}
