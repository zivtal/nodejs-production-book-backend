import { AssetType } from '../../../../shared/constants';

export interface Asset {
  type: keyof typeof AssetType;
  key: string;
  title: string;
  description?: string;
  url: string;
  thumb?: string;
  fileName?: string;
}
