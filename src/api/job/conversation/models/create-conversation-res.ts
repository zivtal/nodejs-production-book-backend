import type { BaseId, BaseResponse } from '../../../../shared/models';

export type CreateConversationRes = BaseResponse & { conversationId?: BaseId };
