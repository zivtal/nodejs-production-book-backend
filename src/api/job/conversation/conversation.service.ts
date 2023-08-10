import type { BaseId, BaseResponse } from '../../../shared/models';
import type {
  ConversationAgreement,
  CreateConversationReq,
  CreateConversationRes,
  GetConversationRes,
  ConversationStatus,
  DocumentConversation,
  CreateConversation,
  SendConversationReq,
  UpdateConversationReq,
  UpdateConversationStatusReq,
} from './models';
import type { ChatMessage } from '../../chat/models';
import {
  CREATE_CONVERSATION,
  DELETE_CONVERSATION_MESSAGE,
  GET_CONVERSATION,
  LEAVE_CONVERSATION,
  SEND_CONVERSATION_MESSAGE,
  UPDATE_CONVERSATION_AGREEMENTS,
  UPDATE_CONVERSATION_MESSAGE,
  UPDATE_CONVERSATION_STATUS,
} from '../job.map';
import { DbCollection, DbMessages } from '../../../shared/service/mongodb/constants';
import { ConversationStatusType } from './constants';
import ValidationError from '../../../shared/composables/middleware/errors/validation-error';
import RecordValidator, { mongoIdValidator } from '../../../shared/service/record-validator';
import { uniqueKey, generateId } from '../../../shared/helpers';
import { conversationStatusFilter } from '../query';
import mongoDbService from '../../../shared/service/mongodb/mongo-db.service';
import conversationQuery from './conversation.query';
import { $lookup, $match, $mergeToRoot, $project, $toObjectId } from '../../../shared/service/mongodb/helpers';

const conversationService = {
  [GET_CONVERSATION]: async (conversationId: BaseId, userId: BaseId): Promise<GetConversationRes> => {
    const conversation = await mongoDbService.fineOne<GetConversationRes>(
      DbCollection.CONVERSATIONS,
      conversationQuery.getConversations(conversationId, userId)
    );

    if (!conversation) {
      throw new ValidationError(DbMessages.QUERY_FAILED);
    }

    conversationService[LEAVE_CONVERSATION](conversationId, userId);

    return conversation;
  },

  [LEAVE_CONVERSATION]: async (conversationId: BaseId, userId: BaseId): Promise<BaseResponse> => {
    const userField = `lastSeenAt.${userId}`;
    await mongoDbService.updateOne(
      DbCollection.CONVERSATIONS,
      { _id: $toObjectId(conversationId) },
      { $set: { [userField]: Date.now() } },
      { upsert: true }
    );

    return { returnCode: 0 };
  },

  [CREATE_CONVERSATION]: async (payload: CreateConversationReq, userId: BaseId): Promise<CreateConversationRes & { ownerId?: string }> => {
    const { positionId, ...agreement } = payload;

    const exists = await mongoDbService.fineOne<DocumentConversation>(DbCollection.CONVERSATIONS, [
      $match({ positionId: $toObjectId(positionId), participants: $toObjectId(userId) }),
    ]);

    if (exists?._id) {
      return { returnCode: 1, conversationId: exists._id.toString() };
    }

    const conversation: CreateConversation = {
      positionId: $toObjectId(positionId),
      participants: [$toObjectId(userId)],
      messages: [],
      status: [
        {
          id: uniqueKey(),
          createdAt: Date.now(),
          type: ConversationStatusType.FREELANCER_INTERESTING,
          userId: $toObjectId(userId),
        },
      ],
      agreement,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const { userId: ownerId } = await mongoDbService.fineOne<{ userId: BaseId }>(
      DbCollection.POSITIONS,
      [
        $match({ _id: $toObjectId(positionId) }),
        $lookup({ from: DbCollection.JOBS, localField: 'jobId' }),
        $mergeToRoot({ $arrayElemAt: [`$${DbCollection.JOBS}`, 0] }),
        $project({ userId: 1, _id: 0 }),
      ],
      true
    );

    new RecordValidator({ id: ownerId }, [['id', { required: [true] }, DbMessages.INVALID_ID]]);
    const { insertedId } = await mongoDbService.insertOne<CreateConversation>(DbCollection.CONVERSATIONS, { ...conversation, userId: ownerId });

    return insertedId ? { returnCode: 0, conversationId: insertedId.toString(), ownerId } : { returnCode: 1 };
  },

  [SEND_CONVERSATION_MESSAGE]: async ({ message, id }: SendConversationReq, userId: BaseId): Promise<ChatMessage> => {
    const fromId = $toObjectId(userId);
    const _id = $toObjectId(id);

    const conversationMessage: ChatMessage = { key: generateId(userId.slice(4)), fromId: fromId, message, updatedAt: Date.now(), history: [] };
    const userField = `lastSeenAt.${userId}`;

    const res = await mongoDbService.findOneAndUpdate<DocumentConversation>(
      DbCollection.CONVERSATIONS,
      { _id, $or: [{ participants: fromId }, { userId: fromId }] },
      {
        $set: { updatedAt: Date.now(), [userField]: Date.now() },
        $push: { messages: conversationMessage } as any,
        $addToSet: { participants: fromId } as any,
      },
      { returnDocument: 'after' }
    );

    if (res.value) {
      await mongoDbService.updateOne(DbCollection.POSITIONS, { _id: res.value.positionId }, { $set: { updatedAt: conversationMessage.updatedAt } });
    }

    return conversationMessage;
  },

  [UPDATE_CONVERSATION_MESSAGE]: async ({ id, message, key }: UpdateConversationReq, userId: BaseId): Promise<BaseResponse> => {
    const userField = `lastSeenAt.${userId}`;
    const { returnCode } = await mongoDbService.updateOne<DocumentConversation>(
      DbCollection.CONVERSATIONS,
      {
        _id: $toObjectId(id),
        [`history.fromId`]: $toObjectId(userId),
        [`history.key`]: key,
      },
      {
        $push: {
          [`messages.$.history`]: {
            message: `$messages.$.message`,
            updatedAt: `$messages.$.updatedAt`,
          },
        },
        $set: {
          updatedAt: Date.now(),
          [userField]: Date.now(),
          [`messages.$.message`]: message,
          [`messages.$.updatedAt`]: Date.now(),
        },
      }
    );

    if (returnCode) {
      throw new ValidationError(DbMessages.QUERY_FAILED);
    }

    return { returnCode: 0 };
  },

  [DELETE_CONVERSATION_MESSAGE]: async ({ id, key }: UpdateConversationReq, userId: BaseId): Promise<BaseResponse> => {
    const { returnCode } = await mongoDbService.updateOne<DocumentConversation>(
      DbCollection.CONVERSATIONS,
      {
        _id: $toObjectId(id),
        [`history.fromId`]: $toObjectId(userId),
        [`history.key`]: key,
      },
      { $set: { [`messages.$.isDeleted`]: true } }
    );

    if (returnCode) {
      throw new ValidationError(DbMessages.QUERY_FAILED);
    }

    return { returnCode: 0 };
  },

  [UPDATE_CONVERSATION_STATUS]: async ({ id, status }: UpdateConversationStatusReq, userId: BaseId): Promise<BaseResponse & DocumentConversation> => {
    const { filter } = conversationStatusFilter(status, userId);

    const update: ConversationStatus = { id: uniqueKey(), type: status, userId: $toObjectId(userId), createdAt: Date.now() };
    const { returnCode, value } = await mongoDbService.findOneAndUpdate<DocumentConversation>(
      DbCollection.CONVERSATIONS,
      { _id: $toObjectId(id), ...filter },
      {
        ...(status === ConversationStatusType.CANCEL ? { $pop: { status: 1 } } : { $push: { status: update } }),
        $set: { updatedAt: Date.now(), [`lastSeenAt.${userId}`]: Date.now() },
      }
    );

    if (returnCode || !value) {
      throw new ValidationError(DbMessages.QUERY_FAILED);
    }

    return { returnCode: 0, ...value };
  },

  [UPDATE_CONVERSATION_AGREEMENTS]: async (
    conversationId: BaseId,
    userId: BaseId,
    payload: Omit<ConversationAgreement, 'updatedAt'>
  ): Promise<BaseResponse> => {
    const validator = new RecordValidator<{ id: string } & ConversationAgreement>(
      { id: conversationId, ...payload },
      [
        ['id', { required: [true], custom: [mongoIdValidator] }],
        ['amount', { required: [true] }],
        ['currencyType', { required: [true] }],
        ['includeTax', { type: [['Boolean']] }],
      ],
      { id: 1, amount: 1, currencyType: 1, includeTax: 1 }
    );

    const { id, ...agreement } = validator.results;

    const { returnCode } = await mongoDbService.findOneAndUpdate<DocumentConversation>(
      DbCollection.CONVERSATIONS,
      {
        _id: $toObjectId(conversationId),
        participants: $toObjectId(userId),
        $and: [
          { 'status.type': { $ne: ConversationStatusType.FREELANCER_LEFT } },
          { 'status.type': { $ne: ConversationStatusType.FREELANCER_ACCEPT } },
          { 'status.type': { $ne: ConversationStatusType.OWNER_ACCEPT } },
        ],
      },
      {
        $set: { agreement: { ...agreement, updatedAt: Date.now() } },
      }
    );

    return { returnCode };
  },
};

export default conversationService;
