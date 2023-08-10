import type { BaseDate } from '../../models';
import type { Exchanges, ExchangeRate, GetExchangeRatesRes, ExchangeWithRate, ExchangeCalc } from './models';
import axios, { AxiosHeaders, type AxiosInstance, type HeadersDefaults, RawAxiosRequestHeaders } from 'axios';
import InternalError from '../../composables/middleware/errors/internal-error';

const DEFAULT_CURRENCY: ExchangeRate = {
  key: 'ILS',
  currentExchangeRate: 1,
  currentChange: 1,
  unit: 1,
  lastUpdate: Date.now().toLocaleString(),
};

export default class BoiService {
  private static readonly baseUrl: string = 'https://boi.org.il/PublicApi/GetExchangeRates?asJson=true';

  private static readonly headers: RawAxiosRequestHeaders | AxiosHeaders | Partial<HeadersDefaults> = {
    'User-Agent': 'Super Agent/0.0.1',
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  private static createAxios(url: string): AxiosInstance {
    return axios.create({ baseURL: url, headers: this.headers });
  }

  public static async getExchangeRates(): Promise<Exchanges> {
    const url = this.baseUrl;
    const client = this.createAxios(url);
    const { exchangeRates } = (await client.get<GetExchangeRatesRes>(``)).data;

    return exchangeRates.reduce(
      (
        sum: Exchanges,
        { key: to, currentExchangeRate: toRate, unit: toUnit, lastUpdate: toUpdate }: ExchangeRate,
        index: number,
        bulk: Array<ExchangeRate>
      ) => [
        ...sum,
        ...[DEFAULT_CURRENCY, ...bulk].reduce(
          (currencyBulk: Exchanges, { key: from, currentExchangeRate: fromRate, unit: fromUnit, lastUpdate: formUpdated }: ExchangeRate) => {
            if (to === from) {
              return currencyBulk;
            }

            const rate: number = fromRate / fromUnit / (toRate * toUnit);
            const updatedAt: BaseDate = Math.min(...[new Date(formUpdated).valueOf(), new Date(toUpdate).valueOf()].filter((value) => !!value));

            return [...currencyBulk, { from, to, rate, updatedAt }];
          },
          []
        ),
      ],
      exchangeRates.map(
        ({ key, currentExchangeRate, unit }: ExchangeRate): ExchangeWithRate => ({
          from: key,
          to: 'ILS',
          rate: currentExchangeRate * unit,
          updatedAt: Date.now(),
        })
      )
    );
  }

  public static async exchangeRate(fromCode: string, toCode: string, amount: number = 1): Promise<ExchangeCalc> {
    const url: string = this.baseUrl;

    try {
      const client: AxiosInstance = this.createAxios(url);
      const { exchangeRates } = (await client.get<GetExchangeRatesRes>(``)).data;

      const currencyFrom = [DEFAULT_CURRENCY, ...exchangeRates].find(({ key }: { key: string }): boolean => key === fromCode);
      const currencyTo = [DEFAULT_CURRENCY, ...exchangeRates].find(({ key }: { key: string }): boolean => key === toCode);

      if (!currencyFrom || !currencyTo) {
        throw new InternalError('VALIDATION.INVALID_CURRENCY_CODE');
      }

      const lastUpdates = [new Date(currencyTo.lastUpdate).valueOf(), new Date(currencyFrom.lastUpdate).valueOf()].filter((value) => !!value);

      return {
        from: fromCode,
        to: toCode,
        value: amount * ((currencyFrom.currentExchangeRate * currencyFrom.unit) / (currencyTo.currentExchangeRate / currencyTo.unit)),
        updatedAt: Math.min(...lastUpdates),
      };
    } catch (e) {
      throw e;
    }
  }
}
