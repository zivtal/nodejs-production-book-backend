import type { ProfileBaseDetails } from '../../employee/models';
import type { BaseDate, DocumentChat } from '../../../shared/models';

export interface GetMessagesRes extends Omit<DocumentChat, 'participants' | 'lastSeenAt'> {
  hasUpdated: boolean;
  participants: Array<ProfileBaseDetails>;
  lastSeenAt: BaseDate;
}
