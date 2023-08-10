import type { BasePostJob } from './base-post-job';
import type { DbResponse } from '../../../../shared/service/mongodb/models';
import type { BaseJobPosition } from '../../position/models';
import type { ConversationStatusType } from '../../conversation/constants';
import type { ProfileBaseDetails } from '../../../employee/models';

interface ExtendParticipant extends ProfileBaseDetails {
  status: keyof typeof ConversationStatusType;
  hasUpdated: boolean;
}

interface Position extends BaseJobPosition, DbResponse {
  participants: Array<ExtendParticipant>;
}

export interface SearchPostJobRes extends BasePostJob, DbResponse {
  positions: Array<Position>;
}
