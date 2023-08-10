import type { UserLocation } from '../../../user/models';
import type { UpdateJobPositionReq } from '../../position/models';
import type { DbResponse } from '../../../../shared/service/mongodb/models';
import type { BaseDate, BaseId } from '../../../../shared/models';

export interface UpdatePostJobReq extends DbResponse {
  _id: BaseId;
  title?: string;
  jobType?: string;
  description?: string;
  dateFrom?: BaseDate;
  dateTo?: BaseDate;
  location?: UserLocation;
  maxDistance?: number;
  positions?: Array<UpdateJobPositionReq>;
  deleted?: Array<string>;
}
