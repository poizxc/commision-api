import { Injectable } from '@nestjs/common';

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
  //this should came from the DB but for this task requirements I will keep it inmemory
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

  getLowestTurnover(clientRules: Rule[]) {
    return clientRules.reduce((lowest, rule) => {
      if (Number(rule.turnoverAmount) < lowest) {
        return Number(rule.turnoverAmount);
      }
      return lowest;
    }, Number.POSITIVE_INFINITY);
  }

  getLowestAmountByPercentage(clientRules: Rule[]) {
    return clientRules.reduce((lowest, rule) => {
      if (Number(rule.feePercentage) < lowest) {
        return Number(rule.feePercentage);
      }
      return lowest;
    }, Number.POSITIVE_INFINITY);
  }

  getLowestAmountByFee(clientRules: Rule[], isTurnoverApplied: boolean) {
    return clientRules.reduce((lowest, rule) => {
      const cheapestApplicableFeeForRule = Number(
        isTurnoverApplied &&
          Number(rule.minimalFeeAmountAfterTurnover) <
            Number(rule.minimalFeeAmount)
          ? rule.minimalFeeAmountAfterTurnover
          : rule.minimalFeeAmount,
      );

      if (cheapestApplicableFeeForRule < lowest) {
        return cheapestApplicableFeeForRule;
      }

      return lowest;
    }, Number.POSITIVE_INFINITY);
  }

  getIsFixedAmount(clientRules: Rule[]) {
    return Boolean(clientRules.find((rule: Rule) => rule.isFixedAmount));
  }

  getAllRulesApplicableForClient(client_id: number) {
    return this.rules.reduce((acc, rule) => {
      if (rule.client_id === client_id || rule.client_id === null) {
        acc.push(rule);
      }
      return acc;
    }, [] as Rule[]);
  }
}
