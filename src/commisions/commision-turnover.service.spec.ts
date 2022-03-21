import { Test, TestingModule } from '@nestjs/testing';
import BigNumber from 'bignumber.js';
import { CommisionTurnoverService } from './commision-turnover.service';

describe('commision-turnover service with empty transactionsAmountMonthly', () => {
  let service: CommisionTurnoverService;
  let serviceWithValue: CommisionTurnoverService;

  const key = '2222-12-06_1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [],
      imports: [],
      providers: [CommisionTurnoverService],
    }).compile();

    const moduleWithValue: TestingModule = await Test.createTestingModule({
      controllers: [],
      imports: [],
      providers: [
        CommisionTurnoverService,
        {
          provide: 'TRANSACTION_AMOUNT_MONTHLY',
          useValue: { [key]: 123 },
        },
      ],
    }).compile();

    serviceWithValue = moduleWithValue.get<CommisionTurnoverService>(
      CommisionTurnoverService,
    );

    service = module.get<CommisionTurnoverService>(CommisionTurnoverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMonthlyKeyForClient method', () => {
    it('should return proper key containing month and client_id', () => {
      const expected = '2222-12_1222';
      expect(service.getMonthlyKeyForClient('2222-12-06', 1222)).toBe(expected);
    });
  });

  describe('getTransactionAmountByKey method', () => {
    it('should return value for defined keys', async () => {
      const expected = new BigNumber(123);
      expect(serviceWithValue.getTransactionAmountByKey(key)).toEqual(expected);
    });

    it('should return 0 for not defined keys', () => {
      const expected = new BigNumber(0);
      expect(service.getTransactionAmountByKey('2222-12-06_1')).toEqual(
        expected,
      );
    });
  });

  describe('isTurnoverApplied method', () => {
    it('should return false if turnover is less than monthly amount', () => {
      const monthlyAmount = new BigNumber(1000);
      const turnoverValue = new BigNumber(10000);

      jest
        .spyOn(service, 'getTransactionAmountByKey')
        .mockImplementationOnce(() => monthlyAmount);

      expect(service.isTurnoverApplied('smth', turnoverValue, 1)).toBe(false);
    });

    it('should return true if turnover is equal to monthly amount', () => {
      const monthlyAmount = new BigNumber(1000);
      const turnoverValue = new BigNumber(1000);

      jest
        .spyOn(service, 'getTransactionAmountByKey')
        .mockImplementationOnce(() => monthlyAmount);

      expect(service.isTurnoverApplied('smth', turnoverValue, 1)).toBe(true);
    });

    it('should return true if turnover biger than monthly amount', () => {
      const monthlyAmount = new BigNumber(10000);
      const turnoverValue = new BigNumber(1000);

      jest
        .spyOn(service, 'getTransactionAmountByKey')
        .mockImplementationOnce(() => monthlyAmount);

      expect(service.isTurnoverApplied('smth', turnoverValue, 1)).toBe(true);
    });
  });
});
