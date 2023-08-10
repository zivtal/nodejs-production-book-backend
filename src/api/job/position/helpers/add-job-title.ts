import { ConversationStatusType } from '../../conversation/constants';

const STATUSES = [ConversationStatusType.OWNER_ACCEPT, ConversationStatusType.FREELANCER_ACCEPT, ConversationStatusType.CANCELLATION];

export const addJobTitle = (field: string = 'status.type') => ({
  $cond: [{ $or: STATUSES.map((status) => ({ $eq: [`$${field}`, status] })) }, '$title', '$$REMOVE'],
});
