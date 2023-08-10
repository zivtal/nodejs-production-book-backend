import type { BasePagination } from '../../../shared/models';
import type { UserLocation } from '../../user/models';

export interface EmployeeSearchReq {
  search?: string;
  page?: BasePagination;
  skills?: Array<string>;
  specialization?: Array<string>;
  coordinates?: UserLocation['coordinates'];
  maxDistance?: number;
}
