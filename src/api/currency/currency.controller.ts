import type { Response } from 'express';
import type { BaseRequest } from '../../shared/models';
import type { GetExchangeRateRes, GetExchangeRatesRes, GetExchangeRateReq } from './models';
import { GET_EXCHANGE_RATE, GET_EXCHANGE_RATES } from './currency.maps';
import currencyService from './currency.service';
import RecordValidator from '../../shared/service/record-validator';

const currencyController = {
  [GET_EXCHANGE_RATE]: async (req: BaseRequest<GetExchangeRateReq>, res: Response<GetExchangeRateRes>): Promise<void> => {
    const { fromCurrency, toCurrency = req.currency, amount } = req.body;
    new RecordValidator<GetExchangeRateReq>({ fromCurrency, toCurrency, amount }, [[['fromCurrency', 'toCurrency'], { required: [true] }]]);

    res.send(await currencyService[GET_EXCHANGE_RATE](fromCurrency, toCurrency!, amount || 1));
  },

  [GET_EXCHANGE_RATES]: async (req: BaseRequest, res: Response<GetExchangeRatesRes>): Promise<void> => {
    res.send(await currencyService[GET_EXCHANGE_RATES]());
  },
};

export default currencyController;
