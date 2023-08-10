import type { DocumentConversation } from '../../../../shared/models';

export type CreateConversation = Omit<DocumentConversation, '_id' | 'lastSeenAt'>;
