import type { BaseResponse } from '../../../shared/models';
import type { Exchanges } from '../../../shared/service/bank-of-israel/models';

export interface GetExchangeRatesRes extends BaseResponse {
  exchangeRates: Exchanges;
  createdAt: number;
}
