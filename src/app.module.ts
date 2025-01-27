// Modules;
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MockModule } from './modules/mock/mock.module';
import { FlagModule } from './modules/flag/flag.module';

// Controllers;
import { PaymentsController } from './controller/payments.controller';
import { RefundsController } from './controller/refunds.controller';

// Services;
import { RefundsService } from './service/refunds.service';
import { PaymentProcessingService } from './service/processPayment.service';
import { StripeService } from './service/stripe.service';
import { BraintreeService } from './service/braintree.service';
import { GetPaymentService } from './service/getPayment.service';

// Repositories;
import { StripeRepository } from './repository/stripe.repository';
import { BraintreeRepository } from './repository/braintree.repository';
import { TransactionsSupabaseRepository } from './repository/transactions.supabase.repository';

// Adapters;
import { StripeAdapter } from './adapters/stripe/paymentRequestAdapter';
import { BraintreeAdapter } from './adapters/braintree/paymentRequestAdapter';
import { BraintreeResponseAdapter } from './adapters/braintree/paymentResponseAdapter';
import { StripeResponseAdapter } from './adapters/stripe/paymentResponseAdapter';

@Module({
  imports: [MockModule, ConfigModule.forRoot(), FlagModule],
  controllers: [PaymentsController, RefundsController],
  providers: [
    PaymentProcessingService,
    GetPaymentService,
    RefundsService,
    BraintreeService,
    StripeService,
    StripeRepository,
    BraintreeRepository,
    StripeAdapter,
    BraintreeAdapter,
    StripeResponseAdapter,
    BraintreeResponseAdapter,
    TransactionsSupabaseRepository,
  ],
})
export class AppModule {}
