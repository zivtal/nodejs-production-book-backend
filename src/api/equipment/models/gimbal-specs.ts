import type { BaseSpecs } from './base-specs';

interface Battery {
  compatibleBatteryType: Array<string>;
  batteryRuntime: string;
  batteryChargingTime: string;
  batteryCapacity: { mAh?: number; Wh?: number };
  batteryChemistry: string;
  batteryVoltage: number;
}

interface Wireless {
  hasWireless: boolean;
  wirelessFrequency: string;
  wirelessProtocol: string;
  mobileAppCompatible: Array<string>;
}

export interface GimbalSpecs extends BaseSpecs {
  stabilizationType: string;
  rotationRange?: { yaw?: string; pitch?: string; roll?: string };
  compatibleCameraModels?: Array<string>;
  controlOptions?: Array<string>;
  shootingModes?: Array<string>;
  features?: Array<string>;
  battery?: Partial<Battery>;
  mountingOptions?: Array<string>;
  maxCameraWeightSupport?: { g?: number; oz?: number };
  followSpeed?: { pan?: string; tilt?: string; roll?: string };
  inputs?: Array<string>;
  outputs?: Array<string>;
  wireless?: Partial<Wireless>;
}
