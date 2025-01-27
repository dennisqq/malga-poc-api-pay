import axios, { AxiosInstance } from 'axios';
import { Logger } from '@nestjs/common';
import { BraintreeRepository } from 'src/repository/braintree.repository';

const createMockLogger = () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
});

jest.mock('axios');
jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  Logger: jest.fn(() => createMockLogger()),
}));

describe('BraintreeRepository', () => {
  let braintreeRepository: BraintreeRepository;
  let mockAxiosInstance: jest.Mocked<AxiosInstance>;
  let mockLogger: ReturnType<typeof createMockLogger>;

  beforeEach(() => {
    jest.clearAllMocks();

    (axios.create as jest.Mock).mockReturnValue({
      post: jest.fn(),
      get: jest.fn(),
    });

    mockAxiosInstance = axios.create() as jest.Mocked<AxiosInstance>;

    braintreeRepository = new BraintreeRepository();
    mockLogger = createMockLogger();

    (braintreeRepository as any).logger = mockLogger;
    (braintreeRepository as any).httpClient = mockAxiosInstance;
  });

  describe('createBraintreePayment', () => {
    it('should create a payment successfully', async () => {
      const mockRequest = { amount: 1000, currency: 'usd' };
      const mockResponse = { id: 'bt_123', status: 'succeeded' };

      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

      const result = await braintreeRepository.createBraintreePayment(mockRequest);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/transactions', mockRequest);
      expect(mockLogger.log).toHaveBeenCalledWith('Criação de pagamento realizada com sucesso', mockResponse);
      expect(result).toEqual(mockResponse);
    });

    it('should handle payment creation error', async () => {
      const mockRequest = { amount: 1000, currency: 'usd' };
      const mockError = new Error('Payment failed');

      mockAxiosInstance.post.mockRejectedValue(mockError);

      const result = await braintreeRepository.createBraintreePayment(mockRequest);

      expect(result).toBeUndefined();
      expect(mockLogger.error).toHaveBeenCalledWith('error', mockError);
    });
  });

  describe('createRefund', () => {
    it('should create a refund successfully', async () => {
      const mockId = 'bt_123';
      const mockAmount = 500;
      const mockResponse = { id: 'ref_123', status: 'voided' };

      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

      const result = await braintreeRepository.createRefund(mockId, mockAmount);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(`/void/${mockId}`, { amount: mockAmount });
      expect(result).toEqual(mockResponse);
    });

    it('should handle refund creation error', async () => {
      const mockId = 'bt_123';
      const mockAmount = 500;
      const mockError = new Error('Refund failed');

      mockAxiosInstance.post.mockRejectedValue(mockError);

      const result = await braintreeRepository.createRefund(mockId, mockAmount);

      expect(result).toBeUndefined();
      expect(mockLogger.error).toHaveBeenCalledWith('error', mockError);
    });
  });

  describe('getTransaction', () => {
    it('should fetch transaction successfully', async () => {
      const mockId = 'bt_123';
      const mockResponse = { id: mockId, amount: 1000, status: 'succeeded' };

      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

      const result = await braintreeRepository.getTransaction(mockId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/transactions/${mockId}`);
      expect(result).toEqual(mockResponse);
    });

    it('should handle transaction fetch error', async () => {
      const mockId = 'bt_123';
      const mockError = new Error('Transaction not found');

      mockAxiosInstance.get.mockRejectedValue(mockError);

      const result = await braintreeRepository.getTransaction(mockId);

      expect(result).toBeUndefined();
      expect(mockLogger.error).toHaveBeenCalledWith('error', mockError);
    });
  });
});
