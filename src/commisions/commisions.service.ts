import { BigNumber } from 'bignumber.js';
import { CurrencyService } from './../currency/currency.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CommisionRulesService } from './commision-rules.service';
import { CommisionTurnoverService } from './commision-turnover.service';
import { CalculateCommisionDto } from './dto/calculate-commision.dto';
import { SupportedCurrencies } from './types';

@Injectable()
export class CommisionsService {
  constructor(
    private commisionRulesService: CommisionRulesService,
    private commisionTurnoverService: CommisionTurnoverService,
    private currencyService: CurrencyService,
  ) {}

  transformAmount(amount: string) {
    const amountAsBigNumber = new BigNumber(amount);
    if (amountAsBigNumber.isLessThanOrEqualTo(0)) {
      throw new BadRequestException('Amount must be bigger than 0');
    }
    return amountAsBigNumber;
  }

  handleCalculateSuccess(
    commisionFee: BigNumber,
    dateStr: string,
    amountInEuro: BigNumber,
    client_id: number,
  ) {
    this.commisionTurnoverService.upsertMonthlyAmount(
      dateStr,
      amountInEuro,
      client_id,
    );
    return {
      amount: commisionFee.toFixed(2),
      currency: 'EUR',
    };
  }

  async calculateCommision({
    amount,
    client_id,
    date,
    currency,
  }: CalculateCommisionDto) {
    const amountAsBigNumber = this.transformAmount(amount);
    const currencyAsSupportedCurrencies = currency as SupportedCurrencies;

    const amountInEuro = await this.currencyService.calculateToEuro(
      amountAsBigNumber,
      currencyAsSupportedCurrencies,
    );

    const lowestTurnoverAmount =
      this.commisionRulesService.getLowestTurnover(client_id);

    const isTurnoverApplied = this.commisionTurnoverService.isTurnoverApplied(
      date,
      lowestTurnoverAmount,
      client_id,
    );

    const lowestFeeAmount = this.commisionRulesService.getLowestAmountByFee(
      client_id,
      isTurnoverApplied,
    );

    const isFixedAmount =
      this.commisionRulesService.getIsFixedAmount(client_id);

    if (isFixedAmount) {
      return this.handleCalculateSuccess(
        lowestFeeAmount,
        date,
        amountInEuro,
        client_id,
      );
    }

    const LowestPercentageAmount =
      this.commisionRulesService.getLowestAmountByPercentage(client_id);

    const percentageFee = amountInEuro.multipliedBy(LowestPercentageAmount);

    return this.handleCalculateSuccess(
      percentageFee.isLessThan(lowestFeeAmount)
        ? lowestFeeAmount
        : percentageFee,
      date,
      amountInEuro,
      client_id,
    );
  }
}
