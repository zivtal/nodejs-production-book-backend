import type { ValidatorScheme } from '../../../shared/service/record-validator';
import type { ListLensesReq } from '../models';

export const LIST_LENSES_SCHEME: ValidatorScheme<ListLensesReq> = {
  value: 1,
  brand: 1,
  tStop: 1,
  maximumAperture: 1,
  minimumAperture: 1,
  lensMount: 1,
  minFocusDistance: 1,
  hasStabilization: 1,
};
