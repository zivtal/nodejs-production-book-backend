import type { BaseResponse } from '../../../shared/models';
import type { Exchange } from '../../../shared/service/bank-of-israel/models';

export type GetExchangeRateRes = Exchange & { value: number } & BaseResponse;
