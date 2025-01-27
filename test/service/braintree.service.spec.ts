import { BraintreeResponseAdapter } from 'src/adapters/braintree/paymentResponseAdapter';
import { BraintreeAdapter } from 'src/adapters/braintree/paymentRequestAdapter';
import { BraintreeRepository } from 'src/repository/braintree.repository';
import { createPaymentDto, unifiedTransactionMock } from 'test/mocks/mocks';
import { FlagService } from 'src/modules/flag/service/flag.service';
import { BraintreeService } from 'src/service/braintree.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('BraintreeService', () => {
  let service: BraintreeService;
  let braintreeAdapter: BraintreeAdapter;
  let braintreeResponseAdapter: BraintreeResponseAdapter;
  let braintreeRepository: BraintreeRepository;
  let flagService: FlagService;

  const mockBraintreeAdapter = {
    transactionAdaptRequest: jest.fn(),
  };

  const mockBraintreeResponseAdapter = {
    adaptResponse: jest.fn(),
  };

  const mockBraintreeRepository = {
    createBraintreePayment: jest.fn(),
    createRefund: jest.fn(),
  };

  const mockFlagService = {
    getState: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BraintreeService,
        { provide: BraintreeAdapter, useValue: mockBraintreeAdapter },
        { provide: BraintreeResponseAdapter, useValue: mockBraintreeResponseAdapter },
        { provide: BraintreeRepository, useValue: mockBraintreeRepository },
        { provide: FlagService, useValue: mockFlagService },
      ],
    }).compile();

    service = module.get<BraintreeService>(BraintreeService);
    braintreeAdapter = module.get<BraintreeAdapter>(BraintreeAdapter);
    braintreeResponseAdapter = module.get<BraintreeResponseAdapter>(BraintreeResponseAdapter);
    braintreeRepository = module.get<BraintreeRepository>(BraintreeRepository);
    flagService = module.get<FlagService>(FlagService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processPayment', () => {
    it('should call BraintreeAdapter, BraintreeRepository, and BraintreeResponseAdapter in processPayment', async () => {
      mockFlagService.getState.mockReturnValue(true);
      mockBraintreeAdapter.transactionAdaptRequest.mockResolvedValue(createPaymentDto);
      mockBraintreeRepository.createBraintreePayment.mockResolvedValue(unifiedTransactionMock);
      mockBraintreeResponseAdapter.adaptResponse.mockReturnValue(unifiedTransactionMock);

      const result = await service.processPayment(createPaymentDto);

      expect(mockFlagService.getState).toHaveBeenCalledWith('braintree');
      expect(mockBraintreeAdapter.transactionAdaptRequest).toHaveBeenCalledWith(createPaymentDto);
      expect(mockBraintreeRepository.createBraintreePayment).toHaveBeenCalledWith(createPaymentDto);
      expect(mockBraintreeResponseAdapter.adaptResponse).toHaveBeenCalledWith(unifiedTransactionMock);
      expect(result).toEqual(unifiedTransactionMock);
    });

    it('should throw an error if Braintree provider is disabled', async () => {
      mockFlagService.getState.mockReturnValue(false);

      await expect(service.processPayment(createPaymentDto)).rejects.toThrow('Braintree provedor desativado');
    });

    it('should throw an error if BraintreeRepository fails', async () => {
      mockFlagService.getState.mockReturnValue(true);
      mockBraintreeAdapter.transactionAdaptRequest.mockResolvedValue(createPaymentDto);
      mockBraintreeRepository.createBraintreePayment.mockRejectedValue(new Error('Payment processing failed'));

      await expect(service.processPayment(createPaymentDto)).rejects.toThrow('Payment processing failed');
    });
  });

  describe('createRefund', () => {
    it('should call BraintreeRepository to create a refund and return the adapted response', async () => {
      const transactionId = 'transaction-id';
      const amount = 50;
      mockBraintreeRepository.createRefund.mockResolvedValue(unifiedTransactionMock);
      mockBraintreeResponseAdapter.adaptResponse.mockReturnValue(unifiedTransactionMock);

      const result = await service.createRefund(transactionId, amount);

      expect(mockBraintreeRepository.createRefund).toHaveBeenCalledWith(transactionId, amount);
      expect(mockBraintreeResponseAdapter.adaptResponse).toHaveBeenCalledWith(unifiedTransactionMock);
      expect(result).toEqual(unifiedTransactionMock);
    });

    it('should throw an error if BraintreeRepository fails to create refund', async () => {
      const transactionId = 'transaction-id';
      const amount = 50;
      mockBraintreeRepository.createRefund.mockRejectedValue(new Error('Refund creation failed'));

      await expect(service.createRefund(transactionId, amount)).rejects.toThrow('Refund creation failed');
    });
  });
});
