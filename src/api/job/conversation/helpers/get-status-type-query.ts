import { ConversationStatusType } from '../constants';

export const getStatusTypeQuery = (statuses: Array<ConversationStatusType>, statusPath: string = 'status.type'): Record<string, any> => ({
  $or: statuses.map((status) => ({ [statusPath]: status })),
});
