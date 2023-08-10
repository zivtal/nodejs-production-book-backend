import type { BaseRecords } from '../../../shared/models';
import type { GetMessagesRes } from './get-messages-res';

export type ListChatsRes = BaseRecords<Pick<GetMessagesRes, 'participants' | 'hasUpdated'>>;
