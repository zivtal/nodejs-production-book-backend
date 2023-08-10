import type { CreatePostJobReq } from '../models';
import type { ValidatorScheme } from '../../../../shared/service/record-validator';

export const CREATE_POST_JOB_SCHEME: ValidatorScheme<CreatePostJobReq> = {
  createdAt: 0,
  updatedAt: 0,
  title: 1,
  jobType: 1,
  description: 1,
  dateFrom: 1,
  dateTo: 1,
  location: 1,
  maxDistance: 1,
  positions: 1,
};
