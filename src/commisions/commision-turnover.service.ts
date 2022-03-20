import { Injectable } from '@nestjs/common';

@Injectable()
export class CommisionTurnoverService {
  //this should came from the DB but for this task requirements I will keep it inmemory
  private readonly transactionsAmountMonthly: Record<
    string,
    number | undefined
  > = {};

  getMonthlyKeyForClient(dateStr: string, client_id: number) {
    return `${dateStr.slice(0, 7)}_${client_id}`;
  }
  getTransactionAmountByKey(key) {
    return this.transactionsAmountMonthly[key] || 0;
  }

  isTurnoverApplied(dateStr: string, turnoverValue: number, client_id: number) {
    const key = this.getMonthlyKeyForClient(dateStr, client_id);
    const amountBeforeTakingFee = this.getTransactionAmountByKey(key);

    return turnoverValue <= amountBeforeTakingFee;
  }

  upsertMonthlyAmount(
    dateStr: string,
    transactionAmount: number,
    client_id: number,
  ) {
    const key = this.getMonthlyKeyForClient(dateStr, client_id);
    const amountBeforeTakingFee = this.getTransactionAmountByKey(key);
    const newMonthlyAmount = amountBeforeTakingFee + transactionAmount;

    this.transactionsAmountMonthly[key] =
      amountBeforeTakingFee + transactionAmount;

    return newMonthlyAmount;
  }
}
