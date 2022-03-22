import { BigNumber } from 'bignumber.js';
import { Inject, Injectable, Optional } from '@nestjs/common';

@Injectable()
export class CommisionTurnoverService {
  //this should come from the DB but for this task requirements I will keep it inmemory
  private transactionsAmountMonthly: Record<string, BigNumber | undefined> = {};

  constructor(
    @Optional()
    @Inject('TRANSACTION_AMOUNT_MONTHLY')
    transactionsAmountMonthly?: Record<string, BigNumber | undefined>,
  ) {
    if (transactionsAmountMonthly) {
      this.transactionsAmountMonthly = transactionsAmountMonthly;
    }
  }

  getMonthlyKeyForClient(dateStr: string, client_id: number) {
    return `${dateStr.slice(0, 7)}_${client_id}`;
  }

  getTransactionAmountByKey(key) {
    return new BigNumber(this.transactionsAmountMonthly[key] || 0);
  }

  isTurnoverApplied(
    dateStr: string,
    turnoverValue: BigNumber,
    client_id: number,
  ) {
    const key = this.getMonthlyKeyForClient(dateStr, client_id);
    const amountBeforeTakingFee = this.getTransactionAmountByKey(key);

    return turnoverValue.isLessThanOrEqualTo(amountBeforeTakingFee);
  }

  upsertMonthlyAmount(
    dateStr: string,
    transactionAmount: BigNumber,
    client_id: number,
  ) {
    const key = this.getMonthlyKeyForClient(dateStr, client_id);
    const amountBeforeTakingFee = this.getTransactionAmountByKey(key);
    const newMonthlyAmount = amountBeforeTakingFee.plus(transactionAmount);

    this.transactionsAmountMonthly[key] = newMonthlyAmount;

    return newMonthlyAmount;
  }
}
