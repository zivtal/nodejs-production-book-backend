import type { SendConversationReq } from './send-conversation-req';

export interface UpdateConversationReq extends SendConversationReq {
  key: string;
}
