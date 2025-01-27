import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { UnifiedTransactionDto } from 'src/dto/uniTransaction.dto';
import { supabase } from 'src/config/supabase.client';

@Injectable()
export class TransactionsSupabaseRepository {
  private readonly logger = new Logger(TransactionsSupabaseRepository.name);

  async createTransactionOnSupaBase(transactionDto: UnifiedTransactionDto) {
    const { data, error } = await supabase.from('transactions').insert([transactionDto]);

    if (error) {
      this.logger.error(`Erro ao inserir transação: ${error.message}`);
      throw new BadRequestException(`Erro ao inserir transação`);
    }

    this.logger.log(`Transação inserida com sucesso.`);
    return data;
  }

  async createRefoundTransactionOnSupaBase(refoundTransactionDto: UnifiedTransactionDto) {
    const { data, error } = await supabase.from('transactions').insert([refoundTransactionDto]);

    if (error) {
      throw new Error(`Erro ao inserir transação: ${error.message}`);
    }

    return data;
  }

  async getTransactionOnSupaBase(id: string) {
    const { data, error } = await supabase.from('transactions').select('*').eq('id', id);

    if (error) {
      this.logger.error(`Erro ao buscar transação: ${error.message}`);
      throw new InternalServerErrorException(`Erro ao buscar transação`);
    }

    if (!data || data.length === 0) {
      this.logger.error('Transação não encontrada.');
      throw new NotFoundException('Transação não encontrada.');
    }

    this.logger.log(`Transação encontrada`);
    return data[0];
  }

  async updateAmountTransactionOnSupaBase(id: string, amount) {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        amount,
      })
      .eq('id', id);

    if (error) {
      this.logger.error(`Erro ao atualizar a transação: ${error.message}`);
      throw new InternalServerErrorException(`Erro ao atualizar a transação`);
    }
  }
}
