import type { BasePagination } from '../../../../shared/models';
import type { DocumentUser, UserLocation } from '../../../user/models';
import type { ConversationStatusType } from '../../conversation/constants';
import type { BaseDate } from '../../../../shared/models';

export interface SearchPositionReq {
  jobType?: DocumentUser['specialization'];
  dateFrom?: BaseDate;
  dateTo?: BaseDate;
  skills?: DocumentUser['skills'];
  status?: keyof typeof ConversationStatusType;
  inConversation?: boolean;
  page?: BasePagination;
  location?: UserLocation | null;
  maxDistance?: number;
}
