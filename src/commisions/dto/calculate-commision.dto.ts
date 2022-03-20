import {
  IsInt,
  IsISO8601,
  Min,
  IsNumberString,
  IsString,
  IsEnum,
} from 'class-validator';
import { SupportedCurrencies } from '../types';

export class CalculateCommisionDto {
  @IsISO8601()
  date: string;

  @IsNumberString()
  amount: string;

  @IsString()
  @IsEnum(SupportedCurrencies)
  currency: string;

  @IsInt()
  @Min(1)
  client_id: number;
}
