import { Module } from '@nestjs/common';
import { StripeMockController } from './controller/stripe.mock.controller';
import { BraintreeMockController } from './controller/braintree.mock.controller';
import { BraintreeMockService } from './service/braintree.mock.service';
import { StripeMockService } from './service/stripe.mock.service';
// import { FlagService } from 'src/modules/flag/service/flag.service';
import { TransactionsSupabaseRepository } from 'src/repository/transactions.supabase.repository';
import { FlagModule } from '../flag/flag.module';

@Module({
  imports: [FlagModule],
  controllers: [StripeMockController, BraintreeMockController],
  providers: [BraintreeMockService, StripeMockService, TransactionsSupabaseRepository],
  exports: [],
})
export class MockModule {}
