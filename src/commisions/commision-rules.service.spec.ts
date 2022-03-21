import { Test, TestingModule } from '@nestjs/testing';
import BigNumber from 'bignumber.js';
import { CommisionRulesService, Rule } from './commision-rules.service';

describe('commision-rules service', () => {
  let service: CommisionRulesService;
  const testRules: Rule[] = [
    {
      client_id: null,
      turnoverAmount: 1000.0,
      isFixedAmount: false,
      feePercentage: 0.005,
      minimalFeeAmount: 0.05,
      minimalFeeAmountAfterTurnover: 0.03,
    },
    {
      client_id: 1,
      isFixedAmount: true,
    },
    {
      client_id: 2,
      isFixedAmount: true,
    },
    {
      client_id: 1,
      minimalFeeAmountAfterTurnover: 2,
    },
  ];
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [],
      imports: [],
      providers: [
        CommisionRulesService,
        {
          provide: 'RULES',
          useValue: testRules,
        },
      ],
    }).compile();

    service = module.get<CommisionRulesService>(CommisionRulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllRulesApplicableForClient method', () => {
    it('should return all client specific rules and default one', () => {
      const expected = [
        {
          client_id: null,
          turnoverAmount: 1000.0,
          isFixedAmount: false,
          feePercentage: 0.005,
          minimalFeeAmount: 0.05,
          minimalFeeAmountAfterTurnover: 0.03,
        },
        {
          client_id: 1,
          isFixedAmount: true,
        },
        {
          client_id: 1,
          minimalFeeAmountAfterTurnover: 2,
        },
      ];

      expect(service.getAllRulesApplicableForClient(1)).toEqual(expected);
    });

    it('should return default rule if no client specific rules', () => {
      const expected = [
        {
          client_id: null,
          turnoverAmount: 1000.0,
          isFixedAmount: false,
          feePercentage: 0.005,
          minimalFeeAmount: 0.05,
          minimalFeeAmountAfterTurnover: 0.03,
        },
      ];
      expect(service.getAllRulesApplicableForClient(88888888)).toEqual(
        expected,
      );
    });
  });

  describe('getLowestTurnover method', () => {
    it('should return lowest Turnover', () => {
      const rules: Rule[] = [
        {
          client_id: null,
          turnoverAmount: 1000.0,
          isFixedAmount: false,
          feePercentage: 0.005,
          minimalFeeAmount: 0.05,
          minimalFeeAmountAfterTurnover: 0.03,
        },
        { client_id: 3, turnoverAmount: 10 },
      ];
      jest
        .spyOn(service, 'getAllRulesApplicableForClient')
        .mockImplementationOnce(() => rules);

      const expected = new BigNumber(10);
      expect(service.getLowestTurnover(3)).toEqual(expected);
    });

    it('should return default turnover for default rule', () => {
      const rules: Rule[] = [
        {
          client_id: null,
          turnoverAmount: 1000.0,
          isFixedAmount: false,
          feePercentage: 0.005,
          minimalFeeAmount: 0.05,
          minimalFeeAmountAfterTurnover: 0.03,
        },
      ];

      jest
        .spyOn(service, 'getAllRulesApplicableForClient')
        .mockImplementationOnce(() => rules);

      const expected = new BigNumber(1000);
      expect(service.getLowestTurnover(22)).toEqual(expected);
    });
  });

  describe('getLowestAmountByPercentage method', () => {
    it('should return Lowest Amount By Percentage', () => {
      const rules: Rule[] = [
        {
          client_id: null,
          turnoverAmount: 1000.0,
          isFixedAmount: false,
          feePercentage: 1,
          minimalFeeAmount: 1,
          minimalFeeAmountAfterTurnover: 0.03,
        },
        { client_id: 3, feePercentage: 0.5 },
        { client_id: 3, feePercentage: 0.2 },
      ];
      jest
        .spyOn(service, 'getAllRulesApplicableForClient')
        .mockImplementationOnce(() => rules);

      const expected = new BigNumber(0.2);
      expect(service.getLowestAmountByPercentage(3)).toEqual(expected);
    });

    it('should return default Amount for only default', () => {
      const rules: Rule[] = [
        {
          client_id: null,
          turnoverAmount: 1000.0,
          isFixedAmount: false,
          feePercentage: 222,
          minimalFeeAmount: 0.05,
          minimalFeeAmountAfterTurnover: 0.03,
        },
      ];

      jest
        .spyOn(service, 'getAllRulesApplicableForClient')
        .mockImplementationOnce(() => rules);

      const expected = new BigNumber(222);
      expect(service.getLowestAmountByPercentage(333333)).toEqual(expected);
    });
  });

  describe('getLowestAmountByFee method', () => {
    it('should return Lowest Amount By fee', () => {
      const rules: Rule[] = [
        {
          client_id: null,
          turnoverAmount: 1000.0,
          isFixedAmount: false,
          feePercentage: 1,
          minimalFeeAmount: 1,
          minimalFeeAmountAfterTurnover: 0.03,
        },
        { client_id: 3, minimalFeeAmount: 0.5 },
        { client_id: 3, minimalFeeAmount: 0.2 },
      ];
      jest
        .spyOn(service, 'getAllRulesApplicableForClient')
        .mockImplementationOnce(() => rules);

      const expected = new BigNumber(0.2);
      expect(service.getLowestAmountByFee(3, false)).toEqual(expected);
    });

    it('should return lowest Amount by fee if turnover is on', () => {
      const rules: Rule[] = [
        {
          client_id: null,
          turnoverAmount: 1000.0,
          isFixedAmount: false,
          feePercentage: 1,
          minimalFeeAmount: 1,
          minimalFeeAmountAfterTurnover: 0.03,
        },
        { client_id: 3, minimalFeeAmount: 0.5 },
        { client_id: 3, minimalFeeAmount: 0.2 },
      ];
      jest
        .spyOn(service, 'getAllRulesApplicableForClient')
        .mockImplementationOnce(() => rules);

      const expected = new BigNumber(0.03);
      expect(service.getLowestAmountByFee(3, true)).toEqual(expected);
    });

    it('should return default Amount for only default', () => {
      const rules: Rule[] = [
        {
          client_id: null,
          turnoverAmount: 1000.0,
          isFixedAmount: false,
          feePercentage: 222,
          minimalFeeAmount: 3123,
          minimalFeeAmountAfterTurnover: 0.03,
        },
      ];

      jest
        .spyOn(service, 'getAllRulesApplicableForClient')
        .mockImplementationOnce(() => rules);

      const expected = new BigNumber(3123);
      expect(service.getLowestAmountByFee(333333, false)).toEqual(expected);
    });
  });
  describe('getIsFixedAmount method', () => {
    it('should return true if any client rule have isFixedAmount set to true', () => {
      const rules: Rule[] = [
        {
          client_id: null,
          turnoverAmount: 1000.0,
          isFixedAmount: false,
          feePercentage: 222,
          minimalFeeAmount: 3123,
          minimalFeeAmountAfterTurnover: 0.03,
        },
        { client_id: 3, isFixedAmount: true },
        { client_id: 3, isFixedAmount: false },
      ];

      jest
        .spyOn(service, 'getAllRulesApplicableForClient')
        .mockImplementationOnce(() => rules);

      expect(service.getIsFixedAmount(1)).toBe(true);
    });
  });
});
