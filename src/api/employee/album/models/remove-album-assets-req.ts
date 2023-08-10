import type { BaseId } from '../../../../shared/models';
import { AssetType } from '../../../../shared/constants';

export interface RemoveAlbumAssetsReq {
  albumId: BaseId;
  assets: Array<{ key: string; type: keyof typeof AssetType }>;
}
