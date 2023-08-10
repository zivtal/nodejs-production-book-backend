export interface ExchangeRate {
  key: string;
  currentExchangeRate: number;
  currentChange: number;
  unit: number;
  lastUpdate: string;
}

export interface GetExchangeRatesRes {
  exchangeRates: Array<ExchangeRate>;
}
