import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from 'src/config/supabase.client';
import { TransactionsSupabaseRepository } from 'src/repository/transactions.supabase.repository';
import { FlagService } from 'src/modules/flag/service/flag.service';

@Injectable()
export class BraintreeMockService {
  constructor(
    private readonly transactionsSupabaseRepository: TransactionsSupabaseRepository,
    private readonly flagService: FlagService,
  ) {}

  async runMockTransactions(body) {
    const braintreeStatus = this.flagService.getState('braintree_response_status');

    body.id = uuidv4();
    body.status = braintreeStatus ? 'paid' : 'failed';

    return {
      id: body.id,
      date: new Date().toISOString().split('T')[0],
      status: braintreeStatus ? 'paid' : 'failed',
      amount: body.amount,
      originalAmount: body.amount,
      currency: body.currency,
      statementDescriptor: body.statementDescriptor,
      paymentType: 'card',
      cardId: uuidv4(),
    };
  }

  public async runMockRefunds(id, body) {
    const { data } = await supabase.from('transactions').select('*').eq('id', id).single();
    return {
      id: uuidv4(),
      date: new Date().toISOString().split('T')[0],
      status: 'voided',
      amount: data.amount - body.amount,
      originalAmount: data.originalAmount,
      currency: 'BRL',
      statementDescriptor: 'Fluxo de estorno - Braintree',
      paymentType: 'card',
      cardId: uuidv4(),
    };
  }

  public async runMockGetTransactions(id) {
    const { createdAt, status, amount, originalAmount, currency, description, paymentMethod, cardId } = await this.transactionsSupabaseRepository.getTransactionOnSupaBase(id);

    return {
      id,
      date: createdAt,
      status: status,
      amount: amount,
      originalAmount: originalAmount,
      currency: currency,
      statementDescriptor: description,
      paymentType: paymentMethod,
      cardId: cardId,
    };
    // export class UnifiedTransactionDto {
    //   id: string;
    //   createdAt: string;
    //   status: string;
    //   amount: number;
    //   originalAmount: number;
    //   currency: string;
    //   description: string;
    //   paymentMethod: string;
    //   cardId: string;
    //   provider: string;
    // }
    // return {
    //   id,
    //   date: new Date().toISOString().split('T')[0],
    //   status: 'paid',
    //   amount: 100,
    //   originalAmount: 100,
    //   currency: 'USD',
    //   statementDescriptor: 'Transaction details',
    //   paymentType: 'card',
    //   cardId: 'uuid-mock-card2',
    // };
  }
}
