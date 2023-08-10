import type { ObjectId } from 'mongodb';
import type { BaseDate, BaseId } from '../../../shared/models';

export interface ChatMessage {
  key: string;
  fromId: BaseId | ObjectId;
  message: string;
  updatedAt: BaseDate;
  isDeleted?: boolean;
  history?: Array<History>;
}
