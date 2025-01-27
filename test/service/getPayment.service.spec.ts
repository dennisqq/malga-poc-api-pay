import { TransactionsSupabaseRepository } from 'src/repository/transactions.supabase.repository';
import { BraintreeResponseAdapter } from 'src/adapters/braintree/paymentResponseAdapter';
import { StripeResponseAdapter } from 'src/adapters/stripe/paymentResponseAdapter';
import { BraintreeRepository } from 'src/repository/braintree.repository';
import { StripeRepository } from 'src/repository/stripe.repository';
import { GetPaymentService } from 'src/service/getPayment.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('GetPaymentService', () => {
  let service: GetPaymentService;
  let mockStripeRepository: StripeRepository;
  let mockBraintreeRepository: BraintreeRepository;
  let mockStripeResponseAdapter: StripeResponseAdapter;
  let mockBraintreeResponseAdapter: BraintreeResponseAdapter;
  let mockTransactionsSupabaseRepository: TransactionsSupabaseRepository;

  const mockGetTransactionStripe = jest.fn();
  const mockGetTransactionBraintree = jest.fn();
  const mockAdaptResponseStripe = jest.fn();
  const mockAdaptResponseBraintree = jest.fn();
  const mockGetTransactionOnSupaBase = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPaymentService,
        {
          provide: StripeRepository,
          useValue: { getTransaction: mockGetTransactionStripe },
        },
        {
          provide: BraintreeRepository,
          useValue: { getTransaction: mockGetTransactionBraintree },
        },
        {
          provide: StripeResponseAdapter,
          useValue: { adaptResponse: mockAdaptResponseStripe },
        },
        {
          provide: BraintreeResponseAdapter,
          useValue: { adaptResponse: mockAdaptResponseBraintree },
        },
        {
          provide: TransactionsSupabaseRepository,
          useValue: { getTransactionOnSupaBase: mockGetTransactionOnSupaBase },
        },
      ],
    }).compile();

    service = module.get<GetPaymentService>(GetPaymentService);
    mockStripeRepository = module.get<StripeRepository>(StripeRepository);
    mockBraintreeRepository = module.get<BraintreeRepository>(BraintreeRepository);
    mockStripeResponseAdapter = module.get<StripeResponseAdapter>(StripeResponseAdapter);
    mockBraintreeResponseAdapter = module.get<BraintreeResponseAdapter>(BraintreeResponseAdapter);
    mockTransactionsSupabaseRepository = module.get<TransactionsSupabaseRepository>(TransactionsSupabaseRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('runGetpayment', () => {
    it('should return stripe transaction response when provider is stripe', async () => {
      const mockTransactionId = 'stripe-transaction-id';
      const mockStripeTransaction = { id: mockTransactionId, amount: 100, status: 'success' };
      const mockStripeResponse = { id: mockTransactionId, amount: 100, status: 'success' };

      mockGetTransactionOnSupaBase.mockResolvedValueOnce({ provider: 'stripe' });
      mockGetTransactionStripe.mockResolvedValueOnce(mockStripeTransaction);
      mockAdaptResponseStripe.mockReturnValueOnce(mockStripeResponse);

      const result = await service.runGetpayment(mockTransactionId);

      expect(mockGetTransactionOnSupaBase).toHaveBeenCalledWith(mockTransactionId);
      expect(mockGetTransactionStripe).toHaveBeenCalledWith(mockTransactionId);
      expect(mockAdaptResponseStripe).toHaveBeenCalledWith(mockStripeTransaction);
      expect(result).toEqual(mockStripeResponse);
    });

    it('should return braintree transaction response when provider is braintree', async () => {
      const mockTransactionId = 'braintree-transaction-id';
      const mockBraintreeTransaction = { id: mockTransactionId, amount: 200, status: 'success' };
      const mockBraintreeResponse = { id: mockTransactionId, amount: 200, status: 'success' };

      mockGetTransactionOnSupaBase.mockResolvedValueOnce({ provider: 'braintree' });
      mockGetTransactionBraintree.mockResolvedValueOnce(mockBraintreeTransaction);
      mockAdaptResponseBraintree.mockReturnValueOnce(mockBraintreeResponse);

      const result = await service.runGetpayment(mockTransactionId);

      expect(mockGetTransactionOnSupaBase).toHaveBeenCalledWith(mockTransactionId);
      expect(mockGetTransactionBraintree).toHaveBeenCalledWith(mockTransactionId);
      expect(mockAdaptResponseBraintree).toHaveBeenCalledWith(mockBraintreeTransaction);
      expect(result).toEqual(mockBraintreeResponse);
    });
  });
});
