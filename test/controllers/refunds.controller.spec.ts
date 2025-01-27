import { RefundsController } from 'src/controller/refunds.controller';
import { refundResponseMock, refundRequestMock } from 'test/mocks/mocks';
import { RefundsService } from 'src/service/refunds.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('RefundsController', () => {
  let controller: RefundsController;
  let refundsService: RefundsService;

  const mockRefundsService = {
    runRefunds: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefundsController],
      providers: [{ provide: RefundsService, useValue: mockRefundsService }],
    }).compile();

    controller = module.get<RefundsController>(RefundsController);
    refundsService = module.get<RefundsService>(RefundsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRefunds', () => {
    it('should call RefundsService to process refund', async () => {
      mockRefundsService.runRefunds.mockResolvedValue(refundResponseMock);
      const result = await controller.createRefunds(refundRequestMock);
      expect(mockRefundsService.runRefunds).toHaveBeenCalledWith(refundRequestMock);
      expect(result).toEqual(refundResponseMock);
    });

    it('should throw an error if RefundsService fails', async () => {
      mockRefundsService.runRefunds.mockRejectedValue(new Error('Refund processing failed'));
      await expect(controller.createRefunds(refundRequestMock)).rejects.toThrow('Refund processing failed');
    });
  });
});
