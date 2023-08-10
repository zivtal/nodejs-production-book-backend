import type { BaseDate, BaseId, DocumentConversation } from '../../../../shared/models';
import type { ProfileBaseDetails } from '../../../employee/models';
import type { DbResponse } from '../../../../shared/service/mongodb/models';
import type { ConversationStatus } from './conversation-status';

export interface GetConversationRes extends DbResponse {
  positionId: BaseId;
  participants: Array<ProfileBaseDetails>;
  messages: Array<DocumentConversation['messages']>;
  status: ConversationStatus;
  agreement: DocumentConversation['agreement'];
  lastSeenAt: BaseDate;
  hasUpdated: boolean;
}
