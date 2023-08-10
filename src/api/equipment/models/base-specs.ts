import { EquipmentTypeEnum } from '../constants/equipment-type.enum';

export interface BaseSpecs {
  brand: string;
  model: string;
  releaseYear?: number;
  type: keyof EquipmentTypeEnum;
  dimensions?: Partial<{ inch: string; mm: string }>;
  weight?: Partial<{ oz: number; g: number }>;
}
