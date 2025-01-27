import { RefundResponseDto } from 'src/dto/refundResponse.dto';
import { RefundsService } from 'src/service/refunds.service';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post('')
  createRefunds(@Body() body): Promise<RefundResponseDto> {
    return this.refundsService.runRefunds(body);
  }
}
