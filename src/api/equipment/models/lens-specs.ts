import type { BaseSpecs } from './base-specs';

interface CinemaLens {
  tStop?: number | [number, number?];
}

interface StandardLens {
  maximumAperture?: [number, number?]; // for maximum aperture
  minimumAperture?: number; // for minimum aperture
}

export type LensMount =
  | 'Fujifilm X'
  | 'Fujifilm G'
  | 'KineMOUNT'
  | 'Nikon F'
  | 'Nikon Z'
  | 'Micro Four Thirds'
  | 'Canon EF'
  | 'Canon RF'
  | 'Canon EF-S'
  | 'Canon EF-M'
  | 'Leica L'
  | 'Leica M'
  | 'PL'
  | 'B4'
  | 'Sony A'
  | 'Sony E'
  | 'Sony FZ'
  | 'Sony 1/2-inch'
  | 'Sony 2/3-inch'
  | 'Pentax K'
  | 'Samsung NX'
  | 'Sigma SA';

export interface BaseLens {
  lensMount: Array<LensMount>;
  focalLength: [number, number?];
  lensConstruction?: { elements: number; groups: number }; // for lens construction
  angleDegrees?: [number, number?]; // parse int lens angle degrees
  minFocusDistance?: number; // in cm
  maximumMagnification?: number;
  hasStabilization?: boolean; // for stabilization
  filterSize?: number; // in mm
}

export type LensSpecs = BaseLens & (CinemaLens | StandardLens) & BaseSpecs;

export interface InternalLensSpecs extends Omit<BaseLens, 'lensMount'>, StandardLens {
  opticalZoomRatio?: number;
  maxDigitalZoom?: number;
  controlRings?: Array<string>;
}
