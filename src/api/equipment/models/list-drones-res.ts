import type { BaseOptionsResponse } from '../../../shared/models';
import type { Specs } from './specs';
import type { DroneSpecs } from './drone-specs';

export type ListDronesRes = BaseOptionsResponse<Specs<DroneSpecs>>;
