import { Test, TestingModule } from '@nestjs/testing';
import { StripeService } from 'src/service/stripe.service';
import { BraintreeService } from 'src/service/braintree.service';
import { TransactionsSupabaseRepository } from 'src/repository/transactions.supabase.repository';
import { BadRequestException } from '@nestjs/common';
import { PaymentProcessingService } from 'src/service/processPayment.service';

describe('PaymentProcessingService', () => {
  let service: PaymentProcessingService;
  let mockStripeService: StripeService;
  let mockBraintreeService: BraintreeService;
  let mockTransactionsSupabaseRepository: TransactionsSupabaseRepository;

  const mockCreateTransactionOnSupaBase = jest.fn();
  const mockProcessPaymentStripe = jest.fn();
  const mockProcessPaymentBraintree = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentProcessingService,
        {
          provide: StripeService,
          useValue: { processPayment: mockProcessPaymentStripe },
        },
        {
          provide: BraintreeService,
          useValue: { processPayment: mockProcessPaymentBraintree },
        },
        {
          provide: TransactionsSupabaseRepository,
          useValue: { createTransactionOnSupaBase: mockCreateTransactionOnSupaBase },
        },
      ],
    }).compile();

    service = module.get<PaymentProcessingService>(PaymentProcessingService);
    mockStripeService = module.get<StripeService>(StripeService);
    mockBraintreeService = module.get<BraintreeService>(BraintreeService);
    mockTransactionsSupabaseRepository = module.get<TransactionsSupabaseRepository>(TransactionsSupabaseRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('runProcessPayment', () => {
    const body = {
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

    it('should process payment successfully using Stripe', async () => {
      const mockResponse = { id: 'stripe-id', status: 'success', provider: 'stripe', originalAmount: 100, amount: 100 };

      mockProcessPaymentStripe.mockResolvedValueOnce(mockResponse);
      mockCreateTransactionOnSupaBase.mockResolvedValueOnce(undefined);

      const result = await service.runProcessPayment(body);

      expect(mockProcessPaymentStripe).toHaveBeenCalledWith(body);
      expect(mockCreateTransactionOnSupaBase).toHaveBeenCalledWith(mockResponse);
      expect(result).toEqual(mockResponse);
    });

    it('should fallback to Braintree if Stripe fails', async () => {
      const mockStripeError = new Error('Stripe error');
      const mockResponse = { id: 'braintree-id', status: 'success', provider: 'braintree', originalAmount: 100, amount: 100 };

      mockProcessPaymentStripe.mockRejectedValueOnce(mockStripeError);
      mockProcessPaymentBraintree.mockResolvedValueOnce(mockResponse);
      mockCreateTransactionOnSupaBase.mockResolvedValueOnce(undefined);

      const result = await service.runProcessPayment(body);

      expect(mockProcessPaymentStripe).toHaveBeenCalledWith(body);
      expect(mockProcessPaymentBraintree).toHaveBeenCalledWith(body);
      expect(mockCreateTransactionOnSupaBase).toHaveBeenCalledWith(mockResponse);
      expect(result).toEqual(mockResponse);
    });

    it('should throw BadRequestException if both providers fail', async () => {
      const mockStripeError = new Error('Stripe error');
      const mockBraintreeError = new Error('Braintree error');

      mockProcessPaymentStripe.mockRejectedValueOnce(mockStripeError);
      mockProcessPaymentBraintree.mockRejectedValueOnce(mockBraintreeError);

      await expect(service.runProcessPayment(body)).rejects.toThrow(BadRequestException);
      expect(mockProcessPaymentStripe).toHaveBeenCalledWith(body);
      expect(mockProcessPaymentBraintree).toHaveBeenCalledWith(body);
    });

    it('should return failure response if Stripe fails with a failed status', async () => {
      const mockFailedResponse = { id: 'stripe-id', status: 'failed', provider: 'stripe', originalAmount: 100, amount: 100 };

      mockProcessPaymentStripe.mockResolvedValueOnce(mockFailedResponse);
      mockCreateTransactionOnSupaBase.mockResolvedValueOnce(mockFailedResponse);

      const result = await service.runProcessPayment(body);

      expect(mockProcessPaymentStripe).toHaveBeenCalledWith(body);
      expect(mockCreateTransactionOnSupaBase).toHaveBeenCalledWith(mockFailedResponse);
      expect(result).toEqual(mockFailedResponse);
    });

    it('should process with Braintree if Circuit Breaker for Stripe is open', async () => {
      const mockResponse = { id: 'braintree-id', status: 'success', provider: 'braintree', originalAmount: 100, amount: 100 };

      mockProcessPaymentStripe.mockRejectedValueOnce(new Error('Circuit Breaker Open for Stripe'));
      mockProcessPaymentBraintree.mockResolvedValueOnce(mockResponse);
      mockCreateTransactionOnSupaBase.mockResolvedValueOnce(undefined);

      const result = await service.runProcessPayment(body);

      expect(mockProcessPaymentBraintree).toHaveBeenCalledWith(body);
      expect(result).toEqual(mockResponse);
    });
  });
});
