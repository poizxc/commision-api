import { CurrencyModule } from './../currency/currency.module';
import { CommisionTurnoverService } from './commision-turnover.service';
import { Module } from '@nestjs/common';
import { CommisionsService } from './commisions.service';
import { CommisionsController } from './commisions.controller';
import { CommisionRulesService } from './commision-rules.service';

@Module({
  controllers: [CommisionsController],
  imports: [CurrencyModule],
  providers: [
    CommisionsService,
    CommisionRulesService,
    CommisionTurnoverService,
  ],
})
export class CommisionsModule {}
