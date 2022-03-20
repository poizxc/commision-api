import { Module } from '@nestjs/common';
import { CommisionsModule } from './commisions/commisions.module';
import { CurrencyModule } from './currency/currency.module';

@Module({
  imports: [CommisionsModule, CurrencyModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
