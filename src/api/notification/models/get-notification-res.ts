import type { DbResponse } from '../../../shared/service/mongodb/models';
import type { ConversationAgreement } from '../../job/conversation/models';
import type { ProfileBaseDetails } from '../../employee/models';
import { NotificationType } from '../constants';
import { ConversationStatusType } from '../../job/conversation/constants';
import { BaseRecords } from '../../../shared/models';

export interface NewConversationNotify extends DbResponse {
  type: keyof typeof NotificationType;
  conversationId: string;
  from: ProfileBaseDetails;
}

export interface StatusConversation {
  type: keyof typeof NotificationType;
  conversationStatus: keyof typeof ConversationStatusType;
  conversationId: string;
}

export interface ConversationMessageNotify extends DbResponse {
  jobId: string;
  positionId: string;
  conversationId: string;
  jobType: string;
  dateFrom: number;
  dateTo: number;
  maxDistance: number;
  type: keyof typeof NotificationType;
  agreement: ConversationAgreement;
  from: ProfileBaseDetails;
}

export type GetNotificationRes = BaseRecords<NewConversationNotify & StatusConversation & ConversationMessageNotify>;
