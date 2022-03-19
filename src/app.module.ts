import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommisionsModule } from './commisions/commisions.module';
import { CurrencyModule } from './currency/currency.module';

@Module({
  imports: [CommisionsModule, CurrencyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
