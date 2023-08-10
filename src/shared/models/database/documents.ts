import type { ObjectId } from 'mongodb';
import type { ValueOf } from '../index';
import type { BaseId, BaseDate, BaseFileData } from '../base';
import type { ConversationAgreement, ConversationStatus } from '../../../api/job/conversation/models';
import type { DbResponse } from '../../service/mongodb/models';
import type { ChatMessage } from '../../../api/chat/models';
import type { UserConfiguration, UserLocation } from '../../../api/user/models';
import type { ProfileFullDetails } from '../../../api/employee/models';
import type { BaseJobPosition } from '../../../api/job/position/models';
import type { BasePostJob } from '../../../api/job/post-job/models';
import type { Specs } from '../../../api/equipment/models';
import { NotificationType } from '../../../api/notification/constants';
import { ConversationStatusType } from '../../../api/job/conversation/constants';
import { AvailableLanguage } from '../../constants';
import { USER_CONFIGURATION } from '../../../api/user/user.constants';

export interface DocumentOption {
  _id: ObjectId;
  title: Record<ValueOf<typeof AvailableLanguage>, string>;
  value: string;
}

export interface DocumentSkills extends DocumentOption {
  group: Array<string>;
}

export interface DocumentJob extends BasePostJob, DbResponse {
  userId: BaseId | ObjectId;
}

export interface DocumentPosition extends BaseJobPosition, DbResponse {
  jobId: BaseId | ObjectId;
}

export interface DocumentConversation extends DocumentChat {
  positionId: BaseId | ObjectId;
  userId?: BaseId | ObjectId;
  status: Array<ConversationStatus>;
  agreement: ConversationAgreement;
}

export interface DocumentChat extends DbResponse {
  participants: Array<BaseId | ObjectId>;
  messages: Array<ChatMessage>;
  lastSeenAt: Record<string, BaseDate>;
}

export interface DocumentNotification {
  _id: BaseId | ObjectId;
  type: keyof typeof NotificationType;
  createdAt: BaseDate;
  fromId?: BaseId | ObjectId;
  userId?: Array<BaseId | ObjectId>;
  jobId?: BaseId | ObjectId;
  positionId?: BaseId | ObjectId;
  conversationId?: BaseId | ObjectId;
  conversationStatus?: keyof typeof ConversationStatusType;
}

export interface DocumentUser extends Omit<ProfileFullDetails, 'specialization' | 'skills' | 'cover'>, DbResponse {
  skills?: Array<string>;
  specialization?: Array<string>;
  cover?: BaseFileData;
  address: UserLocation;
  [USER_CONFIGURATION]: UserConfiguration;
}

export interface DocumentReview extends DbResponse {
  userId: BaseId | ObjectId;
  fromId: BaseId | ObjectId;
  comment?: string;
  attitude: number;
  reliability: number;
  craftsmanship: number;
  communication: number;
  average: number;
}

export interface DocumentEquipment extends Specs {
  _id: ObjectId;
}
