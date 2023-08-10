import type { LensSpecs } from './lens-specs';

export interface ListLensesReq {
  value?: string;
  brand?: LensSpecs['brand'];
  tStop?: [number, number?];
  maximumAperture?: [number, number?];
  minimumAperture?: number;
  lensMount?: LensSpecs['lensMount'];
  minFocusDistance?: LensSpecs['minFocusDistance'];
  hasStabilization?: LensSpecs['hasStabilization'];
}
