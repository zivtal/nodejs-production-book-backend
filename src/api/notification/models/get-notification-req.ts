import type { BasePagination } from '../../../shared/models';

export interface GetNotificationReq {
  specialization: Array<string>;
  skills: Array<string>;
  page?: BasePagination;
}
