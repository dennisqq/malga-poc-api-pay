import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { StripeMockService } from '../service/stripe.mock.service';

@Controller('')
export class StripeMockController {
  constructor(private readonly stripeMockService: StripeMockService) {}

  @Post('charges')
  async createPayment(@Body() body: any) {
    return this.stripeMockService.runMockCreatePayment(body);
  }

  @Post('/refund/:id')
  async refundPayment(@Param('id') id: string, @Body() body: any) {
    return this.stripeMockService.runMockRefundPayment(id, body);
  }

  @Get('charges/:id')
  getPaymentDetails(@Param('id') id: string) {
    return this.stripeMockService.runMockGetTransaction(id);
  }
}
