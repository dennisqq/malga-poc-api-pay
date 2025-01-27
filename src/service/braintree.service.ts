import { BraintreeResponseAdapter } from 'src/adapters/braintree/paymentResponseAdapter';
import { BraintreeAdapter } from 'src/adapters/braintree/paymentRequestAdapter';
import { BraintreeRepository } from 'src/repository/braintree.repository';
import { UnifiedTransactionDto } from 'src/dto/uniTransaction.dto';
import { CreatePaymentDto } from 'src/dto/createPayment.dto';
import { Injectable, Logger } from '@nestjs/common';
import { FlagService } from '../modules/flag/service/flag.service';

@Injectable()
export class BraintreeService {
  private readonly logger = new Logger(BraintreeService.name);

  constructor(
    private readonly braintreeAdapter: BraintreeAdapter,
    private readonly braintreeResponseAdapter: BraintreeResponseAdapter,
    private readonly braintreeRepository: BraintreeRepository,
    private readonly flagService: FlagService,
  ) {}

  public async processPayment(body: CreatePaymentDto): Promise<UnifiedTransactionDto> {
    this.logger.log('Iniciando processamento com Provedor: Braintree');

    if (!this.flagService.getState('braintree')) {
      this.logger.error('Braintree provedor desativado');
      throw new Error('Braintree provedor desativado');
    }

    const adaptBraintreeRequest = await this.braintreeAdapter.transactionAdaptRequest(body);
    const braintreeResponse = await this.braintreeRepository.createBraintreePayment(adaptBraintreeRequest);
    return this.braintreeResponseAdapter.adaptResponse(braintreeResponse);
  }

  public async createRefund(transactionId: string, amount: number): Promise<UnifiedTransactionDto> {
    const response = await this.braintreeRepository.createRefund(transactionId, amount);
    return this.braintreeResponseAdapter.adaptResponse(response);
  }
}
