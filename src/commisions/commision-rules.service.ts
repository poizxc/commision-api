import { BigNumber } from 'bignumber.js';
import { Inject, Injectable, Optional } from '@nestjs/common';

export type Rule = {
  client_id: number | null;
  isFixedAmount?: boolean;
  feePercentage?: number;
  turnoverAmount?: number;
  minimalFeeAmount?: number;
  minimalFeeAmountAfterTurnover?: number;
};

@Injectable()
export class CommisionRulesService {
  //this should come from the DB but for this task requirements I will keep it in memory
  private readonly rules: Rule[] = [
    //applicable to  all clients
    {
      client_id: null,
      turnoverAmount: 1000.0,
      isFixedAmount: false,
      feePercentage: 0.005,
      minimalFeeAmount: 0.05,
      minimalFeeAmountAfterTurnover: 0.03,
    },
    //specific for client 42
    {
      client_id: 42,
      isFixedAmount: true,
    },
  ];

  constructor(
    @Optional()
    @Inject('RULES')
    rules?: Rule[],
  ) {
    if (rules) {
      this.rules = rules;
    }
  }

  getAllRulesApplicableForClient(client_id: number) {
    return this.rules.reduce((acc, rule) => {
      if (rule.client_id === client_id || rule.client_id === null) {
        acc.push(rule);
      }
      return acc;
    }, [] as Rule[]);
  }

  getLowestTurnover(clientId: number) {
    const clientRules = this.getAllRulesApplicableForClient(clientId);

    return clientRules.reduce((lowest, rule) => {
      const turnoverAmount = new BigNumber(rule.turnoverAmount || Infinity);
      if (turnoverAmount.isLessThan(lowest)) {
        return turnoverAmount;
      }
      return lowest;
    }, new BigNumber(Infinity));
  }

  getLowestAmountByPercentage(clientId: number) {
    const clientRules = this.getAllRulesApplicableForClient(clientId);

    return clientRules.reduce((lowest, rule) => {
      const feePercentage = new BigNumber(rule.feePercentage || Infinity);
      if (feePercentage.isLessThan(lowest)) {
        return feePercentage;
      }
      return lowest;
    }, new BigNumber(Infinity));
  }

  getLowestAmountByFee(clientId: number, isTurnoverApplied: boolean) {
    const clientRules = this.getAllRulesApplicableForClient(clientId);

    return clientRules.reduce((lowest, rule) => {
      const minimalFeeAmountAfterTurnover = new BigNumber(
        rule.minimalFeeAmountAfterTurnover || Infinity,
      );
      const minimalFeeAmount = new BigNumber(rule.minimalFeeAmount || Infinity);
      const cheapestApplicableFeeForRule =
        isTurnoverApplied &&
        minimalFeeAmountAfterTurnover.isLessThan(minimalFeeAmount)
          ? minimalFeeAmountAfterTurnover
          : minimalFeeAmount;

      if (cheapestApplicableFeeForRule < lowest) {
        return cheapestApplicableFeeForRule;
      }

      return lowest;
    }, new BigNumber(Infinity));
  }

  getIsFixedAmount(clientId: number) {
    const clientRules = this.getAllRulesApplicableForClient(clientId);
    return Boolean(clientRules.find((rule: Rule) => rule.isFixedAmount));
  }
}
