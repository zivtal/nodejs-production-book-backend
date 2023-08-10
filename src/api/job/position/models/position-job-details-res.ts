import type { BaseJobPosition } from './base-job-position';
import type { DocumentConversation } from '../../conversation/models';
import type { DbResponse } from '../../../../shared/service/mongodb/models';
import type { BaseId, BaseOptions } from '../../../../shared/models';
import type { BasePostJob } from '../../post-job/models';

interface Conversation extends DbResponse {
  status: DocumentConversation['status'];
  agreement: DocumentConversation['agreement'];
  hasUpdated: boolean;
}

export interface PositionJobDetailsRes extends Omit<BasePostJob, 'title' | 'maxDistance'>, Omit<BaseJobPosition, 'type'>, DbResponse {
  _id: BaseId;
  title?: BasePostJob['title'];
  type: BaseOptions<string>;
  conversation?: Conversation;
}

export interface PositionSearchRes extends Omit<PositionJobDetailsRes, 'conversation'> {
  status?: Conversation['status'];
}
