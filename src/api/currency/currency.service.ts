import type { GetExchangeRateRes, GetExchangeRatesRes } from './models';
import { GET_EXCHANGE_RATE, GET_EXCHANGE_RATES } from './currency.maps';
import InternalError from '../../shared/composables/middleware/errors/internal-error';
import BoiService from '../../shared/service/bank-of-israel/boi.service';

const currencyService = {
  [GET_EXCHANGE_RATE]: async (fromCode: string, toCode: string, amount: number): Promise<GetExchangeRateRes> => {
    try {
      return {
        returnCode: 0,
        ...(await BoiService.exchangeRate(fromCode, toCode, amount)),
      };
    } catch (err) {
      throw new InternalError(err);
    }
  },

  [GET_EXCHANGE_RATES]: async (): Promise<GetExchangeRatesRes> => {
    try {
      const exchangeRates = await BoiService.getExchangeRates();

      return { returnCode: 0, exchangeRates, createdAt: new Date().valueOf() };
    } catch (err) {
      throw new InternalError(err);
    }
  },
};

export default currencyService;
