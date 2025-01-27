import { Test, TestingModule } from '@nestjs/testing';
import { StripeService } from 'src/service/stripe.service';
import { StripeAdapter } from 'src/adapters/stripe/paymentRequestAdapter';
import { StripeResponseAdapter } from 'src/adapters/stripe/paymentResponseAdapter';
import { StripeRepository } from 'src/repository/stripe.repository';
import { FlagService } from 'src/modules/flag/service/flag.service';
import { CreatePaymentDto } from 'src/dto/createPayment.dto';
import { UnifiedTransactionDto } from 'src/dto/uniTransaction.dto';

describe('StripeService', () => {
  let service: StripeService;
  let stripeAdapter: StripeAdapter;
  let stripeResponseAdapter: StripeResponseAdapter;
  let stripeRepository: StripeRepository;
  let flagService: FlagService;

  // Mocks dos serviços
  const mockStripeAdapter = {
    chargesAdaptRequest: jest.fn(),
  };

  const mockStripeResponseAdapter = {
    adaptResponse: jest.fn(),
  };

  const mockStripeRepository = {
    createPayment: jest.fn(),
    createRefund: jest.fn(),
  };

  const mockFlagService = {
    getState: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        { provide: StripeAdapter, useValue: mockStripeAdapter },
        { provide: StripeResponseAdapter, useValue: mockStripeResponseAdapter },
        { provide: StripeRepository, useValue: mockStripeRepository },
        { provide: FlagService, useValue: mockFlagService },
      ],
    }).compile();

    service = module.get<StripeService>(StripeService);
    stripeAdapter = module.get<StripeAdapter>(StripeAdapter);
    stripeResponseAdapter = module.get<StripeResponseAdapter>(StripeResponseAdapter);
    stripeRepository = module.get<StripeRepository>(StripeRepository);
    flagService = module.get<FlagService>(FlagService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createPaymentDto: CreatePaymentDto = {
    amount: 100,
    currency: 'BRL',
    description: 'Pagamento via Stripe',
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

  const unifiedTransactionDto: UnifiedTransactionDto = {
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
  describe('processPayment', () => {
    it('should call StripeAdapter, StripeRepository, and StripeResponseAdapter in processPayment', async () => {
      mockFlagService.getState.mockReturnValue(true);
      mockStripeAdapter.chargesAdaptRequest.mockResolvedValue(createPaymentDto);
      mockStripeRepository.createPayment.mockResolvedValue(unifiedTransactionDto);
      mockStripeResponseAdapter.adaptResponse.mockReturnValue(unifiedTransactionDto);

      const result = await service.processPayment(createPaymentDto);

      expect(mockFlagService.getState).toHaveBeenCalledWith('stripe');
      expect(mockStripeAdapter.chargesAdaptRequest).toHaveBeenCalledWith(createPaymentDto);
      expect(mockStripeRepository.createPayment).toHaveBeenCalledWith(createPaymentDto);
      expect(mockStripeResponseAdapter.adaptResponse).toHaveBeenCalledWith(unifiedTransactionDto);
      expect(result).toEqual(unifiedTransactionDto);
    });

    it('should throw an error if Stripe provider is disabled', async () => {
      mockFlagService.getState.mockReturnValue(false);

      await expect(service.processPayment(createPaymentDto)).rejects.toThrow('Stripe provedor desativado');
    });

    it('should throw an error if StripeRepository fails', async () => {
      mockFlagService.getState.mockReturnValue(true);
      mockStripeAdapter.chargesAdaptRequest.mockResolvedValue(createPaymentDto);
      mockStripeRepository.createPayment.mockRejectedValue(new Error('Payment processing failed'));

      await expect(service.processPayment(createPaymentDto)).rejects.toThrow('Payment processing failed');
    });
  });

  describe('createRefund', () => {
    it('should call StripeRepository to create a refund and return the adapted response', async () => {
      const transactionId = 'transaction-id';
      const amount = 50;
      mockStripeRepository.createRefund.mockResolvedValue(unifiedTransactionDto);
      mockStripeResponseAdapter.adaptResponse.mockReturnValue(unifiedTransactionDto);

      const result = await service.createRefund(transactionId, amount);

      expect(mockStripeRepository.createRefund).toHaveBeenCalledWith(transactionId, amount);
      expect(mockStripeResponseAdapter.adaptResponse).toHaveBeenCalledWith(unifiedTransactionDto);
      expect(result).toEqual(unifiedTransactionDto);
    });

    it('should throw an error if StripeRepository fails to create refund', async () => {
      const transactionId = 'transaction-id';
      const amount = 50;
      mockStripeRepository.createRefund.mockRejectedValue(new Error('Refund creation failed'));

      await expect(service.createRefund(transactionId, amount)).rejects.toThrow('Refund creation failed');
    });
  });
});
