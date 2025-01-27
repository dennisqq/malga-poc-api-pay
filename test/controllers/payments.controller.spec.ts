import { getTransactionsResponseMock, processPaymentRequestMock } from 'test/mocks/mocks';
import { PaymentProcessingService } from 'src/service/processPayment.service';
import { PaymentsController } from 'src/controller/payments.controller';
import { GetPaymentService } from 'src/service/getPayment.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let paymentProcessingService: PaymentProcessingService;
  let getPaymentService: GetPaymentService;

  const mockPaymentProcessingService = {
    runProcessPayment: jest.fn(),
  };

  const mockGetPaymentService = {
    runGetpayment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        { provide: PaymentProcessingService, useValue: mockPaymentProcessingService },
        { provide: GetPaymentService, useValue: mockGetPaymentService },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    paymentProcessingService = module.get<PaymentProcessingService>(PaymentProcessingService);
    getPaymentService = module.get<GetPaymentService>(GetPaymentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processPayment', () => {
    it('should call PaymentProcessingService to process payment', async () => {
      const paymentResponse = { status: 'success', transactionId: '12345' };
      mockPaymentProcessingService.runProcessPayment.mockResolvedValue(paymentResponse);
      const result = await controller.processPayment(processPaymentRequestMock);

      expect(mockPaymentProcessingService.runProcessPayment).toHaveBeenCalledWith(processPaymentRequestMock);
      expect(result).toEqual(paymentResponse);
    });

    it('should throw an error if PaymentProcessingService fails', async () => {
      mockPaymentProcessingService.runProcessPayment.mockRejectedValue(new Error('Payment processing failed'));
      await expect(controller.processPayment(processPaymentRequestMock)).rejects.toThrow('Payment processing failed');
    });
  });

  describe('getTransactions', () => {
    it('should call GetPaymentService to retrieve payment transaction', async () => {
      const getPaymentDto = { id: '12345' };
      mockGetPaymentService.runGetpayment.mockResolvedValue(getTransactionsResponseMock);
      const result = await controller.getTransactions(getPaymentDto);

      expect(mockGetPaymentService.runGetpayment).toHaveBeenCalledWith(getPaymentDto.id);
      expect(result).toEqual(getTransactionsResponseMock);
    });

    it('should throw an error if GetPaymentService fails', async () => {
      mockGetPaymentService.runGetpayment.mockRejectedValue(new Error('Transaction not found'));
      await expect(controller.getTransactions({ id: '12345' })).rejects.toThrow('Transaction not found');
    });
  });
});
