import type { BasePostJob } from './base-post-job';
import type { BaseJobPosition } from '../../position/models';
import type { BaseDate } from '../../../../shared/models';

export interface CreatePostJobReq extends BasePostJob {
  positions: Array<BaseJobPosition>;
  createdAt?: BaseDate;
  updatedAt?: BaseDate;
}
