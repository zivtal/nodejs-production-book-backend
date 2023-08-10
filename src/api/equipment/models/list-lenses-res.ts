import type { BaseOptionsResponse } from '../../../shared/models';
import type { Specs } from './specs';
import type { LensSpecs } from './lens-specs';

export type ListLensesRes = BaseOptionsResponse<Specs<LensSpecs>>;
