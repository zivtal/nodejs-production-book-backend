import type { BaseId, BasePagination } from '../../../../shared/models';

export interface GetAlbumsReq {
  userId: BaseId;
  page?: BasePagination;
}
