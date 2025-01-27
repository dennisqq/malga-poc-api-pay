import { Module } from '@nestjs/common';
import { FlagService } from './service/flag.service';
import { FlagController } from './controller/flag.controller';

@Module({
  imports: [],
  controllers: [FlagController],
  providers: [FlagService],
  exports: [FlagService],
})
export class FlagModule {}
