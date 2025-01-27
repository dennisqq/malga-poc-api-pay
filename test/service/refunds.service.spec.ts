import { Test, TestingModule } from '@nestjs/testing';
import { RefundsService } from 'src/service/refunds.service';
import { TransactionsSupabaseRepository } from 'src/repository/transactions.supabase.repository';
import { StripeService } from 'src/service/stripe.service';
import { BraintreeService } from 'src/service/braintree.service';
import { BadRequestException } from '@nestjs/common';

describe('RefundsService', () => {
  let service: RefundsService;
  let mockStripeService: StripeService;
  let mockBraintreeService: BraintreeService;
  let mockTransactionsSupabaseRepository: TransactionsSupabaseRepository;

  const mockGetTransactionOnSupaBase = jest.fn();
  const mockCreateRefund = jest.fn();
  const mockCreateRefoundTransactionOnSupaBase = jest.fn();
  const mockUpdateAmountTransactionOnSupaBase = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefundsService,
        {
          provide: StripeService,
          useValue: { createRefund: mockCreateRefund },
        },
        {
          provide: BraintreeService,
          useValue: { createRefund: mockCreateRefund },
        },
        {
          provide: TransactionsSupabaseRepository,
          useValue: {
            getTransactionOnSupaBase: mockGetTransactionOnSupaBase,
            createRefoundTransactionOnSupaBase: mockCreateRefoundTransactionOnSupaBase,
            updateAmountTransactionOnSupaBase: mockUpdateAmountTransactionOnSupaBase,
          },
        },
      ],
    }).compile();

    service = module.get<RefundsService>(RefundsService);
    mockStripeService = module.get<StripeService>(StripeService);
    mockBraintreeService = module.get<BraintreeService>(BraintreeService);
    mockTransactionsSupabaseRepository = module.get<TransactionsSupabaseRepository>(TransactionsSupabaseRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('runRefunds', () => {
    it('should process refund for Stripe provider', async () => {
      const body = { id: 'stripe-transaction-id', amount: 100 };
      const mockTransaction = { id: 'stripe-transaction-id', provider: 'stripe', status: 'paid', amount: 150 };
      const mockRefundResponse = { id: 'refund-id', amount: 100, status: 'success', provider: 'stripe', originalAmount: 150 };

      mockGetTransactionOnSupaBase.mockResolvedValueOnce(mockTransaction);
      mockCreateRefund.mockResolvedValueOnce(mockRefundResponse);
      mockCreateRefoundTransactionOnSupaBase.mockResolvedValueOnce(undefined);
      mockUpdateAmountTransactionOnSupaBase.mockResolvedValueOnce(undefined);

      const result = await service.runRefunds(body);

      expect(mockGetTransactionOnSupaBase).toHaveBeenCalledWith(body.id);
      expect(mockCreateRefund).toHaveBeenCalledWith(mockTransaction.id, body.amount);
      expect(mockCreateRefoundTransactionOnSupaBase).toHaveBeenCalledWith(expect.objectContaining({ id: 'refund-id' }));
      expect(mockUpdateAmountTransactionOnSupaBase).toHaveBeenCalledWith(mockTransaction.id, mockRefundResponse.amount);
      expect(result).toEqual({
        id: 'refund-id',
        parentTransactionId: mockTransaction.id,
        status: mockRefundResponse.status,
        provider: mockRefundResponse.provider,
        originalAmount: mockRefundResponse.originalAmount,
        amount: mockRefundResponse.amount,
      });
    });

    it('should process refund for Braintree provider', async () => {
      const body = { id: 'braintree-transaction-id', amount: 50 };
      const mockTransaction = { id: 'braintree-transaction-id', provider: 'braintree', status: 'paid', amount: 100 };
      const mockRefundResponse = { id: 'refund-id', amount: 50, status: 'success', provider: 'braintree', originalAmount: 100 };

      mockGetTransactionOnSupaBase.mockResolvedValueOnce(mockTransaction);
      mockCreateRefund.mockResolvedValueOnce(mockRefundResponse);
      mockCreateRefoundTransactionOnSupaBase.mockResolvedValueOnce(undefined);
      mockUpdateAmountTransactionOnSupaBase.mockResolvedValueOnce(undefined);

      const result = await service.runRefunds(body);

      expect(mockGetTransactionOnSupaBase).toHaveBeenCalledWith(body.id);
      expect(mockCreateRefund).toHaveBeenCalledWith(mockTransaction.id, body.amount);
      expect(mockCreateRefoundTransactionOnSupaBase).toHaveBeenCalledWith(expect.objectContaining({ id: 'refund-id' }));
      expect(mockUpdateAmountTransactionOnSupaBase).toHaveBeenCalledWith(mockTransaction.id, mockRefundResponse.amount);
      expect(result).toEqual({
        id: 'refund-id',
        parentTransactionId: mockTransaction.id,
        status: mockRefundResponse.status,
        provider: mockRefundResponse.provider,
        originalAmount: mockRefundResponse.originalAmount,
        amount: mockRefundResponse.amount,
      });
    });

    it('should throw BadRequestException if provider is unsupported', async () => {
      const body = { id: 'unsupported-transaction-id', amount: 50 };
      const mockTransaction = { id: 'unsupported-transaction-id', provider: 'unsupported', status: 'paid', amount: 100 };

      mockGetTransactionOnSupaBase.mockResolvedValueOnce(mockTransaction);

      await expect(service.runRefunds(body)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if refund amount exceeds the original amount', async () => {
      const body = { id: 'stripe-transaction-id', amount: 200 };
      const mockTransaction = { id: 'stripe-transaction-id', provider: 'stripe', status: 'paid', amount: 150 };

      mockGetTransactionOnSupaBase.mockResolvedValueOnce(mockTransaction);

      await expect(service.runRefunds(body)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if transaction status is not valid for refund', async () => {
      const body = { id: 'stripe-transaction-id', amount: 100 };
      const mockTransaction = { id: 'stripe-transaction-id', provider: 'stripe', status: 'failed', amount: 150 };

      mockGetTransactionOnSupaBase.mockResolvedValueOnce(mockTransaction);

      await expect(service.runRefunds(body)).rejects.toThrow(BadRequestException);
    });
  });
});
