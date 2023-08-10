import type { ObjectId } from 'mongodb';
import type { BaseDate, BaseId } from '../../../../shared/models';
import { ConversationStatusType } from '../constants';

export interface ConversationStatus {
  id: BaseId;
  type: keyof typeof ConversationStatusType;
  userId: BaseId | ObjectId;
  createdAt: BaseDate;
}
