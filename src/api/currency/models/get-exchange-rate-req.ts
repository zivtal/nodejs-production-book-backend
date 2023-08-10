export interface GetExchangeRateReq {
  fromCurrency: string;
  toCurrency?: string;
  amount?: number;
}
