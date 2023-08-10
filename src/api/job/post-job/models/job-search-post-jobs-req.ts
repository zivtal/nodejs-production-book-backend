import type { BasePagination } from '../../../../shared/models';
import type { BaseDate } from '../../../../shared/models';

export interface JobSearchPostJobsReq {
  value?: string;
  dateFrom?: BaseDate;
  dateTo?: BaseDate;
  jobType?: Array<string>;
  page?: BasePagination;
}
