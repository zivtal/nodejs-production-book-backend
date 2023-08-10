import type { BaseOptionsResponse } from '../../../shared/models';
import type { Specs } from './specs';
import type { GimbalSpecs } from './gimbal-specs';

export type ListGimbalsRes = BaseOptionsResponse<Specs<GimbalSpecs>>;
