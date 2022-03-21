import { BigNumber } from 'bignumber.js';
import { CurrencyService } from './../currency/currency.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CommisionRulesService } from './commision-rules.service';
import { CommisionTurnoverService } from './commision-turnover.service';
import { CalculateCommisionDto } from './dto/calculate-commision.dto';
import { SupportedCurrencies } from './types';

@Injectable()
export class CommisionsService {
  // in real world aplication this should come from DB, but for purposes of this recuritment task i will keep it as variable
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

    const clientRules =
      this.commisionRulesService.getAllRulesApplicableForClient(client_id);

    const lowestTurnoverAmount =
      this.commisionRulesService.getLowestTurnover(clientRules);

    const isTurnoverApplied = this.commisionTurnoverService.isTurnoverApplied(
      date,
      lowestTurnoverAmount,
      client_id,
    );

    const lowestFeeAmount = this.commisionRulesService.getLowestAmountByFee(
      clientRules,
      isTurnoverApplied,
    );

    const isFixedAmount =
      this.commisionRulesService.getIsFixedAmount(clientRules);

    if (isFixedAmount) {
      return this.handleCalculateSuccess(
        lowestFeeAmount,
        date,
        amountInEuro,
        client_id,
      );
    }

    const LowestPercentageAmount =
      this.commisionRulesService.getLowestAmountByPercentage(clientRules);

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
