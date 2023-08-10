import { ConversationStatusType } from '../constants';

export interface UpdateConversationStatusReq {
  id: string;
  status: keyof typeof ConversationStatusType;
}
