import { TransactionsSupabaseRepository } from 'src/repository/transactions.supabase.repository';
import { supabase } from 'src/config/supabase.client';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FlagService } from 'src/modules/flag/service/flag.service';

@Injectable()
export class StripeMockService {
  constructor(
    private readonly transactionsSupabaseRepository: TransactionsSupabaseRepository,
    private readonly flagService: FlagService,
  ) {}

  async runMockCreatePayment(body) {
    const stripeAvailable = this.flagService.getState('stripe_response_status');

    return {
      id: uuidv4(),
      createdAt: new Date().toISOString().split('T')[0],
      status: stripeAvailable ? 'authorized' : 'failed',
      originalAmount: body.amount,
      currentAmount: body.amount,
      currency: body.currency,
      description: body.description,
      paymentMethod: 'card',
      cardId: uuidv4(),
    };
  }

  public async runMockRefundPayment(id, body) {
    const { data } = await supabase.from('transactions').select('*').eq('id', id).single();

    return {
      id: uuidv4(),
      createdAt: new Date().toISOString().split('T')[0],
      status: 'refunded',
      originalAmount: data.originalAmount,
      currentAmount: data.amount - body.amount,
      currency: 'BRL',
      description: 'Fluxo de estorno - Stripe',
      paymentMethod: 'card',
      cardId: uuidv4(),
    };
  }

  public async runMockGetTransaction(id) {
    const { createdAt, status, originalAmount, amount, currency, description, paymentMethod, cardId } = await this.transactionsSupabaseRepository.getTransactionOnSupaBase(id);

    return {
      id,
      createdAt,
      status,
      originalAmount: originalAmount,
      currentAmount: amount,
      currency: currency,
      description,
      paymentMethod,
      cardId,
    };

    // return {
    //   id,
    //   createdAt: new Date().toISOString().split('T')[0],
    //   status: 'authorized',
    //   originalAmount: 100,
    //   currentAmount: 100,
    //   currency: 'USD',
    //   description: 'Payment details',
    //   paymentMethod: 'card',
    //   cardId: 'uuid-mock-card1',
    // };
  }
}
