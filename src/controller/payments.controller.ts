import { PaymentProcessingService } from 'src/service/processPayment.service';
import { GetPaymentResponseDto } from 'src/dto/getPaymentResponse.dto';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GetPaymentService } from 'src/service/getPayment.service';
import { PaymentResponseDto } from 'src/dto/paymentReponse.dto';
import { CreatePaymentDto } from 'src/dto/createPayment.dto';
import { GetPaymentDto } from 'src/dto/getPayment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentProcessingService: PaymentProcessingService,
    private readonly getPaymentService: GetPaymentService,
  ) {}

  @Post()
  async processPayment(@Body() body: CreatePaymentDto): Promise<PaymentResponseDto> {
    return this.paymentProcessingService.runProcessPayment(body);
  }

  @Get(':id')
  async getTransactions(@Param() { id }: GetPaymentDto): Promise<GetPaymentResponseDto> {
    return this.getPaymentService.runGetpayment(id);
  }
}
