import type { BaseDate, BaseId } from '../../../../shared/models';

export interface GetAlbumReq {
  albumId: BaseId;
  updatedAt?: BaseDate;
}
