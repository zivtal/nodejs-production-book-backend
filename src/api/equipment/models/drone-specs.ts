import type { BaseSpecs } from './base-specs';
import type { CameraSpecs } from './camera-specs';

export interface DroneSpecs extends BaseSpecs {
  diagonalSize?: { mm?: number; inch?: number };
  maxFlightTime?: { minutes?: number; hours?: number };
  maxSpeed?: { mph?: number; kmh?: number; inMode?: string };
  maxAscentSpeed?: { mph?: number; kmh?: number };
  maxDescentSpeed?: { mph?: number; kmh?: number };
  operatingTemperatureRange?: [number, number];
  camera?: Partial<Omit<CameraSpecs, 'type'>>;
}
