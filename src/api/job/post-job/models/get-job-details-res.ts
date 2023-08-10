import type { BaseJobPosition } from '../../position/models';
import type { DocumentConversation } from '../../conversation/models';
import type { DbResponse } from '../../../../shared/service/mongodb/models';
import type { BasePostJob } from './base-post-job';

interface Position extends BaseJobPosition, DbResponse {
  conversation?: Array<DocumentConversation>;
}

export interface GetJobDetailsRes extends BasePostJob, DbResponse {
  positions: Array<Position>;
}
