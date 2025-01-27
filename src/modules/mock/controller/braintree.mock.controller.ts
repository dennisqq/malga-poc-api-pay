import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { BraintreeMockService } from '../service/braintree.mock.service';

@Controller('')
export class BraintreeMockController {
  constructor(private readonly braintreeMockService: BraintreeMockService) {}

  @Post('transactions')
  async transactions(@Body() body: any) {
    return this.braintreeMockService.runMockTransactions(body);
  }

  @Post('/void/:id')
  async refundPayment(@Param('id') id: string, @Body() body: any) {
    return this.braintreeMockService.runMockRefunds(id, body);
  }

  @Get('transactions/:id')
  getPaymentDetails(@Param('id') id: string) {
    return this.braintreeMockService.runMockGetTransactions(id);
  }
}
