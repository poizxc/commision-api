import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';
import { SupportedCurrencies } from '@src/commisions/dto/calculate-commision.dto';

@Injectable()
export class CurrencyService {
  constructor(private readonly http: HttpService) {}

  private async getExchangeRates() {
    const rates = await lastValueFrom<Record<string, number>>(
      this.http.get('').pipe(map((response) => response.data.rates)),
    );
    const supportedRates = Object.fromEntries(
      Object.entries(rates).filter(([key]) => {
        return SupportedCurrencies[key];
      }),
    ) as Record<keyof typeof SupportedCurrencies, number>;

    return supportedRates;
  }

  async calculateToEuro(amount: number, currentCurrency: SupportedCurrencies) {
    if (currentCurrency === SupportedCurrencies.EUR) {
      return amount;
    }
    const exchangeRates = await this.getExchangeRates();

    const applicableExchangeRate = exchangeRates[currentCurrency];

    return amount / applicableExchangeRate;
  }
}
