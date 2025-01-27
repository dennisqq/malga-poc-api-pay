import axios, { AxiosInstance } from 'axios';
import { HttpException, Logger } from '@nestjs/common';
import { StripeRepository } from 'src/repository/stripe.repository';

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

describe('StripeRepository', () => {
  let stripeRepository: StripeRepository;
  let mockAxiosInstance: jest.Mocked<AxiosInstance>;
  let mockLogger: ReturnType<typeof createMockLogger>;

  beforeEach(() => {
    jest.clearAllMocks();

    (axios.create as jest.Mock).mockReturnValue({
      post: jest.fn(),
      get: jest.fn(),
    });

    mockAxiosInstance = axios.create() as jest.Mocked<AxiosInstance>;

    stripeRepository = new StripeRepository();
    mockLogger = createMockLogger();

    (stripeRepository as any).logger = mockLogger;
    (stripeRepository as any).httpClient = mockAxiosInstance;
  });

  describe('createPayment', () => {
    it('should create a payment successfully', async () => {
      const mockRequest = { amount: 1000, currency: 'usd' };
      const mockResponse = { id: 'ch_123', status: 'succeeded' };

      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

      const result = await stripeRepository.createPayment(mockRequest);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/charges', mockRequest);
      expect(mockLogger.log).toHaveBeenCalledWith('Criação de pagamento realizada com sucesso', mockResponse);
      expect(result).toEqual(mockResponse);
    });

    it('should throw HttpException on payment creation failure', async () => {
      const mockRequest = { amount: 1000, currency: 'usd' };
      const mockError = new Error('Payment failed');

      mockAxiosInstance.post.mockRejectedValue(mockError);

      await expect(stripeRepository.createPayment(mockRequest)).rejects.toThrow(HttpException);
      expect(mockLogger.error).toHaveBeenCalledWith('Stripe error', mockError);
    });
  });

  describe('createRefund', () => {
    it('should create a refund successfully', async () => {
      const mockId = 'ch_123';
      const mockAmount = 500;
      const mockResponse = { id: 'ref_123', status: 'succeeded' };

      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

      const result = await stripeRepository.createRefund(mockId, mockAmount);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(`/refund/${mockId}`, { amount: mockAmount });
      expect(result).toEqual(mockResponse);
    });

    it('should handle refund creation error', async () => {
      const mockId = 'ch_123';
      const mockAmount = 500;
      const mockError = new Error('Refund failed');

      mockAxiosInstance.post.mockRejectedValue(mockError);

      const result = await stripeRepository.createRefund(mockId, mockAmount);

      expect(result).toBeUndefined();
      expect(mockLogger.error).toHaveBeenCalledWith('error', mockError);
    });
  });

  describe('getTransaction', () => {
    it('should fetch transaction successfully', async () => {
      const mockId = 'ch_123';
      const mockResponse = { id: mockId, amount: 1000, status: 'succeeded' };

      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

      const result = await stripeRepository.getTransaction(mockId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/charges/${mockId}`);
      expect(result).toEqual(mockResponse);
    });

    it('should handle transaction fetch error', async () => {
      const mockId = 'ch_123';
      const mockError = new Error('Transaction not found');

      mockAxiosInstance.get.mockRejectedValue(mockError);

      const result = await stripeRepository.getTransaction(mockId);

      expect(result).toBeUndefined();
      expect(mockLogger.error).toHaveBeenCalledWith('error', mockError);
    });
  });
});
