import type { CameraSpecs } from './camera-specs';
import type { LensSpecs } from './lens-specs';
import type { DroneSpecs } from './drone-specs';
import type { GimbalSpecs } from './gimbal-specs';
import type { BaseResponse } from '../../../shared/models';

export type GetEquipmentSpecsRes = (CameraSpecs | LensSpecs | DroneSpecs | GimbalSpecs) & BaseResponse;
