import { Body, Controller, Post } from '@nestjs/common';
import { FlagService } from 'src/modules/flag/service/flag.service';

@Controller('flag')
export class FlagController {
  constructor(private readonly flagService: FlagService) {}

  @Post('state')
  toggleState(@Body() { key, value }: { key: string; value: boolean }): string {
    this.flagService.setState(key, value);
    return `State of ${key} is now ${value ? 'active' : 'inactive'}`;
  }
}
