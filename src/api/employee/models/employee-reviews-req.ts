import type { BaseId, BasePagination } from '../../../shared/models';

export interface EmployeeReviewsReq {
  userId: BaseId;
  page?: BasePagination;
}
