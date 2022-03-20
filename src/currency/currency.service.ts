import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';
import { SupportedCurrencies } from '../commisions/types';

@Injectable()
export class CurrencyService {
  constructor(private readonly http: HttpService) {}

  async getExchangeRates() {
    const rates = await lastValueFrom<Record<string, number>>(
      this.http.get('').pipe(map((response) => response.data.rates)),
    );

    const supportedRates = Object.fromEntries(
      Object.entries(rates).filter(([key]) => {
        return SupportedCurrencies[key];
      }),
    ) as Record<keyof typeof SupportedCurrencies, undefined | number>;

    return supportedRates;
  }

  async calculateToEuro(amount: number, currentCurrency: SupportedCurrencies) {
    if (currentCurrency === SupportedCurrencies.EUR) {
      return amount;
    }
    const exchangeRates = await this.getExchangeRates();

    const applicableExchangeRate = exchangeRates[currentCurrency];

    if (!applicableExchangeRate || applicableExchangeRate === 0) {
      throw new Error('cannot get exchange rate for given currency');
    }
    return amount / applicableExchangeRate;
  }
}
