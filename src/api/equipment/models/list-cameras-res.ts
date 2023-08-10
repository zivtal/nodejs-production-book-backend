import type { BaseOptionsResponse } from '../../../shared/models';
import type { Specs } from './specs';
import type { CameraSpecs } from './camera-specs';

export type ListCamerasRes = BaseOptionsResponse<Specs<CameraSpecs>>;
