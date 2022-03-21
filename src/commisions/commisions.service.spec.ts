import { Test, TestingModule } from '@nestjs/testing';
import BigNumber from 'bignumber.js';
import { CurrencyModule } from '../currency/currency.module';
import { CommisionRulesService } from './commision-rules.service';
import { CommisionTurnoverService } from './commision-turnover.service';
import { CommisionsController } from './commisions.controller';
import { CommisionsService } from './commisions.service';

describe('CommisionsService', () => {
  let service: CommisionsService;
  let commisionTurnoverService: CommisionTurnoverService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommisionsController],
      imports: [CurrencyModule],
      providers: [
        CommisionsService,
        CommisionRulesService,
        CommisionTurnoverService,
      ],
    }).compile();

    service = module.get<CommisionsService>(CommisionsService);
    commisionTurnoverService = module.get<CommisionTurnoverService>(
      CommisionTurnoverService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('transformAmount method', () => {
    it('should throw if number is smaller than 0', () => {
      expect(() => {
        service.transformAmount('-10');
      }).toThrow();
    });

    it('should throw if number is 0', () => {
      expect(() => {
        service.transformAmount('0');
      }).toThrow();
    });

    it('should return a number for positive value', () => {
      expect(service.transformAmount('1')).toEqual(new BigNumber(1));
    });
  });

  describe('handleCalculateSuccess method', () => {
    it('should return amount as string representation of fixed number', () => {
      const args = {
        commisionFee: new BigNumber(0.036),
        dateStr: 'string',
        amountInEuro: new BigNumber(1),
        client_id: 1,
      };

      const expectedValue = {
        amount: '0.04',
        currency: 'EUR',
      };

      expect(
        service.handleCalculateSuccess(
          args.commisionFee,
          args.dateStr,
          args.amountInEuro,
          args.client_id,
        ),
      ).toStrictEqual(expectedValue);
    });

    it('should call upsertMonthlyAmount on commisionTurnoverService with correct Params', () => {
      const args = {
        commisionFee: new BigNumber(0.036),
        date: 'string',
        amountInEuro: new BigNumber(1),
        client_id: 1,
      };

      jest.spyOn(commisionTurnoverService, 'upsertMonthlyAmount');

      service.handleCalculateSuccess(
        args.commisionFee,
        args.date,
        args.amountInEuro,
        args.client_id,
      );

      expect(commisionTurnoverService.upsertMonthlyAmount).toBeCalledTimes(1);
      expect(commisionTurnoverService.upsertMonthlyAmount).toBeCalledWith(
        args.date,
        args.amountInEuro,
        args.client_id,
      );
    });
  });

  describe('calculateCommision method', () => {
    it('should give minimal for small transactions', async () => {
      const dto = {
        amount: '1',
        client_id: 2,
        date: '2022-03-22',
        currency: 'EUR',
      };
      const expectedResult = {
        amount: '0.05',
        currency: 'EUR',
      };

      const result = await service.calculateCommision(dto);
      expect(result).toEqual(expectedResult);
    });

    it('should calculate using percentages when bigger amount', async () => {
      const dto = {
        amount: '1000',
        client_id: 2,
        date: '2022-03-22',
        currency: 'EUR',
      };
      const expectedResult = {
        amount: '5.00',
        currency: 'EUR',
      };

      const result = await service.calculateCommision(dto);
      expect(result).toEqual(expectedResult);
    });

    it('should give discount for small transactions', async () => {
      const dto1 = {
        amount: '19000',
        client_id: 2,
        date: '2022-03-22',
        currency: 'EUR',
      };
      const dto2 = {
        amount: '1',
        client_id: 2,
        date: '2022-03-22',
        currency: 'EUR',
      };

      const expectedResult = {
        amount: '0.03',
        currency: 'EUR',
      };
      await service.calculateCommision(dto1);
      const result = await service.calculateCommision(dto2);
      expect(result).toEqual(expectedResult);
    });
  });
});
