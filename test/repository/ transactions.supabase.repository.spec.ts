import { supabase } from 'src/config/supabase.client';
import { UnifiedTransactionDto } from 'src/dto/uniTransaction.dto';
import { BadRequestException, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import { TransactionsSupabaseRepository } from 'src/repository/transactions.supabase.repository';

const createMockLogger = () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
});

jest.mock('src/config/supabase.client', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  Logger: jest.fn(() => createMockLogger()),
}));

describe('TransactionsSupabaseRepository', () => {
  let repository: TransactionsSupabaseRepository;
  let mockLogger: ReturnType<typeof createMockLogger>;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new TransactionsSupabaseRepository();
    mockLogger = createMockLogger();
    (repository as any).logger = mockLogger;
  });

  describe('createTransactionOnSupaBase', () => {
    it('should create transaction successfully', async () => {
      const mockTransaction: UnifiedTransactionDto = {
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
      const mockSupabaseResponse = {
        data: [mockTransaction],
        error: null,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockResolvedValue(mockSupabaseResponse),
      });

      const result = await repository.createTransactionOnSupaBase(mockTransaction);

      expect(supabase.from).toHaveBeenCalledWith('transactions');
      expect(mockLogger.log).toHaveBeenCalledWith('Transação inserida com sucesso.');
      expect(result).toEqual([mockTransaction]);
    });

    it('should throw BadRequestException on insertion error', async () => {
      const mockTransaction: UnifiedTransactionDto = {
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
      const mockError = { message: 'Insertion failed' };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      });

      await expect(repository.createTransactionOnSupaBase(mockTransaction)).rejects.toThrow(BadRequestException);
      expect(mockLogger.error).toHaveBeenCalledWith(`Erro ao inserir transação: ${mockError.message}`);
    });
  });

  describe('createRefoundTransactionOnSupaBase', () => {
    it('should create refund transaction successfully', async () => {
      const mockTransaction: UnifiedTransactionDto = {
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
      const mockSupabaseResponse = {
        data: [mockTransaction],
        error: null,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockResolvedValue(mockSupabaseResponse),
      });

      const result = await repository.createRefoundTransactionOnSupaBase(mockTransaction);

      expect(supabase.from).toHaveBeenCalledWith('transactions');
      expect(result).toEqual([mockTransaction]);
    });

    it('should throw error on refund insertion failure', async () => {
      const mockTransaction: UnifiedTransactionDto = {
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
      const mockError = { message: 'Refund insertion failed' };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      });

      await expect(repository.createRefoundTransactionOnSupaBase(mockTransaction)).rejects.toThrow(`Erro ao inserir transação: ${mockError.message}`);
    });
  });

  describe('getTransactionOnSupaBase', () => {
    it('should retrieve transaction successfully', async () => {
      const mockTransaction = {
        id: '123',
        amount: 100,
      };
      const mockSupabaseResponse = {
        data: [mockTransaction],
        error: null,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue(mockSupabaseResponse),
        }),
      });

      const result = await repository.getTransactionOnSupaBase('123');

      expect(supabase.from).toHaveBeenCalledWith('transactions');
      expect(mockLogger.log).toHaveBeenCalledWith(`Transação encontrada`);
      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException when transaction not found', async () => {
      const mockSupabaseResponse = {
        data: [],
        error: null,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue(mockSupabaseResponse),
        }),
      });

      await expect(repository.getTransactionOnSupaBase('123')).rejects.toThrow(NotFoundException);
      expect(mockLogger.error).toHaveBeenCalledWith('Transação não encontrada.');
    });

    it('should throw InternalServerErrorException on query error', async () => {
      const mockError = { message: 'Query failed' };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      });

      await expect(repository.getTransactionOnSupaBase('123')).rejects.toThrow(InternalServerErrorException);
      expect(mockLogger.error).toHaveBeenCalledWith(`Erro ao buscar transação: ${mockError.message}`);
    });
  });

  describe('updateAmountTransactionOnSupaBase', () => {
    it('should update transaction amount successfully', async () => {
      const mockSupabaseResponse = {
        data: [{ id: '123', amount: 200 }],
        error: null,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue(mockSupabaseResponse),
        }),
      });

      await repository.updateAmountTransactionOnSupaBase('123', 200);

      expect(supabase.from).toHaveBeenCalledWith('transactions');
    });

    it('should throw InternalServerErrorException on update failure', async () => {
      const mockError = { message: 'Update failed' };

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      });

      await expect(repository.updateAmountTransactionOnSupaBase('123', 200)).rejects.toThrow(InternalServerErrorException);
      expect(mockLogger.error).toHaveBeenCalledWith(`Erro ao atualizar a transação: ${mockError.message}`);
    });
  });
});
