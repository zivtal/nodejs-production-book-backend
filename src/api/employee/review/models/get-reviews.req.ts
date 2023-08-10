import type { BasePagination } from '../../../../shared/models';
import type { BaseId } from '../../../../shared/models';

export interface GetReviewsReq {
  userId: BaseId;
  fromId?: BaseId;
  page?: BasePagination;
}
