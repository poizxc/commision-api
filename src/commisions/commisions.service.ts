import { CurrencyService } from './../currency/currency.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CommisionRulesService } from './commision-rules.service';
import { CommisionTurnoverService } from './commision-turnover.service';
import {
  CalculateCommisionDto,
  SupportedCurrencies,
} from './dto/calculate-commision.dto';

@Injectable()
export class CommisionsService {
  // in real world aplication this should come from DB, but for purposes of this recuritment task i will keep it as variable
  constructor(
    private commisionRulesService: CommisionRulesService,
    private commisionTurnoverService: CommisionTurnoverService,
    private currencyService: CurrencyService,
  ) {}

  private transformAmount(amount: string) {
    const amountAsNumber = parseFloat(amount);
    if (amountAsNumber <= 0) {
      throw new BadRequestException('Amount must be bigger than 0');
    }
    return amountAsNumber;
  }

  private transformCurrency(currency: string) {
    return SupportedCurrencies[currency];
  }

  private handleCalculateSuccess(
    commisionFee: number,
    dateStr: string,
    amountInEuro: number,
    client_id: number,
  ) {
    this.commisionTurnoverService.upsertMonthlyAmount(
      dateStr,
      amountInEuro,
      client_id,
    );
    return {
      amount: String(commisionFee.toFixed(2)),
      currency: 'EUR',
    };
  }

  async calculateCommision({
    amount,
    client_id,
    date,
    currency,
  }: CalculateCommisionDto) {
    const amountAsNumber = this.transformAmount(amount);
    const currencyAsSupportedCurrencies = this.transformCurrency(currency);
    const amountInEuro = await this.currencyService.calculateToEuro(
      amountAsNumber,
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
    console.log({ isTurnoverApplied });
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

    const percentageFee = amountInEuro * LowestPercentageAmount;

    return this.handleCalculateSuccess(
      percentageFee < lowestFeeAmount ? lowestFeeAmount : percentageFee,
      date,
      amountInEuro,
      client_id,
    );
  }
}
