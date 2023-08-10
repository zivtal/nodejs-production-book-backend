import type { SendMessageReq } from './send-message-req';

export interface UpdateMessageReq extends Omit<SendMessageReq, 'participants'> {
  chatId: string;
  key: string;
}
