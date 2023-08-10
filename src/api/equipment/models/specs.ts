import type { CameraSpecs } from './camera-specs';
import type { DroneSpecs } from './drone-specs';
import type { GimbalSpecs } from './gimbal-specs';
import type { LensSpecs } from './lens-specs';

export interface Specs<T = CameraSpecs | DroneSpecs | GimbalSpecs | LensSpecs> {
  title: string;
  specs: T;
}
