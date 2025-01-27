import { CreatePaymentDto } from 'src/dto/createPayment.dto';
import { RefundResponseDto } from 'src/dto/refundResponse.dto';
import { UnifiedTransactionDto } from 'src/dto/uniTransaction.dto';

export const processPaymentRequestMock = {
  amount: 50,
  currency: 'BRL',
  description: 'Fluxo de compra iniciado - Stripe',
  paymentMethod: {
    type: 'card',
    card: {
      number: '4111111111111111',
      holderName: 'José Silva',
      cvv: '123',
      expirationDate: '12/2025',
      installments: 3,
    },
  },
};

export const refundRequestMock = {
  id: 'b3585160-594d-4c01-8ec7-6aaa906a1b2a',
  amount: 50,
};

export const refundResponseMock: RefundResponseDto = {
  id: 'b3585160-594d-4c01-8ec7-6aaa906a1b2a',
  parentTransactionId: '78282a9c-349a-46e7-a0af-b63ac8c48f0b',
  status: 'refunded',
  provider: 'stripe',
  originalAmount: 50,
  amount: 49,
};

export const getTransactionsResponseMock = {
  id: '6aab8acb-6670-4c1f-8dca-79634b4b156b',
  createdAt: '2025-01-26T03:00:00.000Z',
  status: 'paid',
  amount: 50,
  originalAmount: 50,
  currency: 'BRL',
  description: 'Fluxo de compra iniciado - Stripe',
  paymentMethod: 'card',
  cardId: 'bcb710a5-3eec-43d9-8177-fd7ec76d3cd5',
  provider: 'braintree',
};

export const createPaymentDto: CreatePaymentDto = {
  amount: 100,
  currency: 'BRL',
  description: 'Pagamento via Braintree',
  paymentMethod: {
    type: 'card',
    card: {
      number: '4111111111111111',
      holderName: 'José Silva',
      cvv: '123',
      expirationDate: '12/2025',
      installments: 3,
    },
  },
};

export const unifiedTransactionMock: UnifiedTransactionDto = {
  id: '6aab8acb-6670-4c1f-8dca-79634b4b156b',
  createdAt: '2025-01-26T03:00:00.000Z',
  status: 'paid',
  amount: 50,
  originalAmount: 50,
  currency: 'BRL',
  description: 'Fluxo de compra iniciado - Stripe',
  paymentMethod: 'card',
  cardId: 'bcb710a5-3eec-43d9-8177-fd7ec76d3cd5',
  provider: 'braintree',
};
