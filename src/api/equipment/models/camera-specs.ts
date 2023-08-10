import type { BaseSpecs } from './base-specs';
import type { InternalLensSpecs, LensMount } from './lens-specs';

interface Gain {
  min: number;
  max: number;
  expanded?: { min?: number; max?: number };
}

type RecordingFormat =
  | 'DV'
  | 'AVI'
  | 'MOV'
  | 'MXF'
  | 'RAW'
  | `H.26${4 | 5}`
  | `MPEG-${2 | 4 | 'HD' | 'HD422'}${string}`
  | 'AVCHD'
  | 'CinemaDNG RAW'
  | 'CinemaRAW Light'
  | 'REDCODE RAW'
  | 'Blackmagic RAW'
  | 'Apple ProRes'
  | `Avid ${'DNxHR' | 'DNxHD'}`
  | `XAVC${string}`
  | 'XF-AVC'
  | 'AVC-Intra'
  | 'V-RAW'
  | `DVCPRO${'' | ' HD' | 25 | 50}`;

interface VideoSpecs {
  fps: Array<number>;
  resolution: Array<string>;
  recordingFormats: Array<RecordingFormat>;
  audioInputs: Array<string>;
  videoOutputs: Array<string>;
  otherInputs?: Array<string>;
  otherOutputs?: Array<string>;
  dynamicRangeStops?: number;
  bitDepth: number;
  internalRecording: Array<string>;
  externalRecording: Array<string>;
  maxRecordTime: string;
  gain: Partial<Gain>;
  slowMotionSupport?: boolean;
  audioRecording?: Array<string>;
}

interface ImageSpecs {
  autoFocus: Array<string>;
  manualFocus: boolean;
  maxResolution: string;
  otherResolutions: Array<string>;
  uncompressedFormat: Array<string>;
  aspectRatio?: Array<string>;
  colorSpace?: Array<string>;
}

interface ISO {
  low: number;
  high: number;
  native?: number;
  extended?: { low?: number; high?: number };
}

interface StabilizationSpecs {
  integrated: boolean;
  system?: string;
}

interface FocusSpecs {
  system?: string;
  numberOfPoints: number;
  crossTypeFocusPoints: number;
}

interface SensorSpecs {
  sensorSize: string;
  sensorType: string;
  effectivePixels?: number;
  processor?: string;
}

interface ViewfinderSpecs {
  viewfinderType: string;
  viewfinderCoverage: number; // viewfinder coverage percents
  viewfinderMagnification: number;
  viewfinderResolution: number;
}

interface MonitorSpecs {
  articulated: string;
  screenSize: number;
  screenDots: string;
  touchScreen: boolean;
  liveView: boolean;
}

interface PowerSpecs {
  compatibleBatteryType: Array<string>;
  batteryLifeTime: string;
  externalPowerSource?: string;
}

interface Exposure {
  metering: string;
  modes: Array<string>;
}

interface StorageMedia {
  storageType: Array<MediaType>;
  numberOfSlots: number;
  dualSlotRecordingSupport: boolean;
}

interface Shutter {
  shutterSpeed: { min: string; max: string };
}

type MediaType =
  | 'CF'
  | 'CFast'
  | 'CFast 2.0'
  | 'CFexpress'
  | 'CFexpress Type B'
  | 'CF/UDMA'
  | 'External USB-C Drives'
  | 'xD-Picture Card'
  | 'XQD'
  | 'SD'
  | 'SDHC'
  | 'SDXC'
  | 'SD/UHS-II'
  | 'SDXC/UHS-II'
  | 'microSD'
  | 'microSDHC'
  | 'microSDXC'
  | 'SSD'
  | 'M.2 SSD'
  | 'CineSSD'
  | 'P2'
  | 'microP2'
  | 'REDMAG'
  | 'RED MINI-MAG'
  | 'SxS'
  | 'Memory Stick Duo'
  | 'Memory Stick Pro Duo'
  | 'Memory Stick Pro-HG Duo';

export interface CameraSpecs extends BaseSpecs {
  megaPixels?: number;
  bodyType?: string;
  sensor: SensorSpecs;
  integratedLens?: InternalLensSpecs;
  lensMount?: Array<LensMount>;
  iso?: ISO;
  focus?: Partial<FocusSpecs>;
  stabilization?: StabilizationSpecs;
  shutter?: Partial<Shutter>;
  lcd?: Partial<MonitorSpecs>;
  viewfinder?: Partial<ViewfinderSpecs>;
  exposure?: Partial<Exposure>;
  storageMedia: Partial<StorageMedia>;
  power?: Partial<PowerSpecs>;
  photo?: Partial<ImageSpecs>;
  video?: Partial<VideoSpecs>;
  additionalFeatures?: Array<string>;
}
