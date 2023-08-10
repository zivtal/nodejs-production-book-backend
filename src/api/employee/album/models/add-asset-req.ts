import type { Asset } from './asset';
import type { BaseId } from '../../../../shared/models';

export interface AddAssetReq {
  albumId: BaseId;
  assets: Array<Omit<Asset, 'key'>>;
}
