import { HttpModule, HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import { SupportedCurrencies } from '../commisions/types';
import { CurrencyService } from './currency.service';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let http: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [CurrencyService],
    }).compile();

    service = module.get<CurrencyService>(CurrencyService);

    http = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('CalculateToEuro method', () => {
    it('should return same value if currency is Euro', async () => {
      const amountAsEuro = 222;
      const result = await service.calculateToEuro(
        amountAsEuro,
        SupportedCurrencies.EUR,
      );

      expect(result).toEqual(amountAsEuro);
    });

    it('should call getExchangeRates if currency is not Euro', async () => {
      const amount = 4;
      const expectedValue = 1;
      const mockedExchangeRate = { PLN: 4 } as Record<
        'EUR' | 'USD' | 'PLN',
        number
      >;

      jest
        .spyOn(service, 'getExchangeRates')
        .mockResolvedValueOnce(mockedExchangeRate);

      const result = await service.calculateToEuro(
        amount,
        SupportedCurrencies.PLN,
      );

      expect(service.getExchangeRates).toBeCalledTimes(1);

      expect(result).toEqual(expectedValue);
    });

    it('should throw if wll not get correct exchange rate', async () => {
      const amount = 4;
      const mockedFailedExchangeRate = {} as Record<
        'EUR' | 'USD' | 'PLN',
        number
      >;

      jest
        .spyOn(service, 'getExchangeRates')
        .mockResolvedValueOnce(mockedFailedExchangeRate);

      expect(
        service.calculateToEuro(amount, SupportedCurrencies.PLN),
      ).rejects.toThrowError();
    });

    it('should throw if exchange rate is 0', async () => {
      const amount = 4;
      const mockedFailedExchangeRate = { PLN: 0 } as Record<
        'EUR' | 'USD' | 'PLN',
        number
      >;

      jest
        .spyOn(service, 'getExchangeRates')
        .mockResolvedValueOnce(mockedFailedExchangeRate);

      expect(
        service.calculateToEuro(amount, SupportedCurrencies.PLN),
      ).rejects.toThrowError();
    });
  });

  describe('getExchangeRates Method', () => {
    it('should return currencies filtered only to supported ones', async () => {
      const mockedExternalExchangeratesApiCall: AxiosResponse = {
        data: { rates: { EUR: 1, USD: 2, PLN: 3, CHF: 0.1 } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };
      const expectedValue = { EUR: 1, USD: 2, PLN: 3 };

      jest
        .spyOn(http, 'get')
        .mockImplementationOnce(() => of(mockedExternalExchangeratesApiCall));

      const result = await service.getExchangeRates();

      expect(result).toEqual(expectedValue);
    });
  });
});
