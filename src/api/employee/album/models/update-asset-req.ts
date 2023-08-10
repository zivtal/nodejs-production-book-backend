import type { Asset } from './asset';
import type { BaseId } from '../../../../shared/models';

export interface UpdateAssetReq {
  albumId: BaseId;
  key: Asset['key'];
  title?: Asset['title'];
  description?: Asset['description'];
}
