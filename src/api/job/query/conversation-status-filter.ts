import type { BaseId } from '../../../shared/models';
import { ConversationStatusType } from '../conversation/constants';
import { $toObjectId } from '../../../shared/service/mongodb/helpers';

const filter = (status: keyof typeof ConversationStatusType, userId: BaseId): Record<string, any> => {
  switch (status) {
    case ConversationStatusType.CANCEL: {
      return {
        participants: $toObjectId(userId),
        $expr: { $eq: [{ $last: '$status.userId' }, $toObjectId(userId)] },
      };
    }

    case ConversationStatusType.CANCELLATION: {
      const inState = [ConversationStatusType.FREELANCER_ACCEPT];

      return {
        participants: $toObjectId(userId),
        $expr: { $in: [{ $last: '$status.type' }, inState] },
      };
    }

    case ConversationStatusType.CANCELLED: {
      const inState = [ConversationStatusType.CANCELLATION];

      return {
        participants: $toObjectId(userId),
        $and: [{ $expr: { $in: [{ $last: '$status.type' }, inState] } }, { $expr: { $ne: [{ $last: '$status.userId' }, $toObjectId(userId)] } }],
      };
    }

    // Freelancer
    case ConversationStatusType.FREELANCER_INTERESTING: {
      const inState = [ConversationStatusType.FREELANCER_LEFT];

      return {
        userId: { $ne: $toObjectId(userId) },
        participants: $toObjectId(userId),
        $expr: { $in: [{ $last: '$status.type' }, inState] },
      };
    }

    case ConversationStatusType.FREELANCER_LEFT: {
      const inState = [ConversationStatusType.FREELANCER_INTERESTING, ConversationStatusType.OWNER_ACCEPT];

      return {
        userId: { $ne: $toObjectId(userId) },
        participants: $toObjectId(userId),
        $expr: { $in: [{ $last: '$status.type' }, inState] },
      };
    }

    case ConversationStatusType.FREELANCER_REJECT:
    case ConversationStatusType.FREELANCER_ACCEPT: {
      const inState = [ConversationStatusType.OWNER_ACCEPT];

      return {
        userId: { $ne: $toObjectId(userId) },
        participants: $toObjectId(userId),
        $expr: { $in: [{ $last: '$status.type' }, inState] },
      };
    }

    // Owner
    case ConversationStatusType.OWNER_ACCEPT:
    case ConversationStatusType.OWNER_REJECT: {
      const inState = [ConversationStatusType.FREELANCER_INTERESTING];

      return {
        userId: { $eq: $toObjectId(userId) },
        $and: [{ $expr: { $in: [{ $last: '$status.type' }, inState] } }, { $expr: { $ne: [{ $last: '$status.userId' }, $toObjectId(userId)] } }],
      };
    }

    default:
      return {
        $or: [
          {
            userId: { $ne: $toObjectId(userId) },
            participants: $toObjectId(userId),
            status: ConversationStatusType.FREELANCER_LEFT,
          },
          {
            userId: $toObjectId(userId),
            status: { $ne: ConversationStatusType.FREELANCER_LEFT },
          },
        ],
      };
  }
};

export const conversationStatusFilter = (status: keyof typeof ConversationStatusType, userId: BaseId): { filter: Record<string, any> } => {
  return { filter: filter(status, userId) };
};
