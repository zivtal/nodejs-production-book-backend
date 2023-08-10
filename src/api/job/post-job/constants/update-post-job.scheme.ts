import type { UpdatePostJobReq } from '../models';
import type { ValidatorScheme } from '../../../../shared/service/record-validator';

export const UPDATE_POST_JOB_SCHEME: ValidatorScheme<UpdatePostJobReq> = {
  _id: 0,
  createdAt: 0,
  updatedAt: 0,
  deleted: 1,
  positions: 1,
  title: 1,
  jobType: 1,
  description: 1,
  dateFrom: 1,
  dateTo: 1,
  location: 1,
  maxDistance: 1,
};
