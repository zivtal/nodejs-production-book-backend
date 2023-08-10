import type { ChatMessage, DocumentChat, ListChatsRes, DeleteMessageReq, GetMessagesRes, UpdateMessageReq } from './models';
import type { BasePagination, BaseResponse } from '../../shared/models';
import { DELETE_MESSAGE, GET_MESSAGES, LIST_CHATS, SEND_MESSAGE, UPDATE_MESSAGE } from './chat.map';
import { DbCollection } from '../../shared/service/mongodb/constants';
import { uniqueKey } from '../../shared/helpers';
import { PROFILE_BASE_DETAILS_SCHEME } from '../employee/constants';
import { hasUpdated } from '../job/query';
import { GetMessagesReq } from './models';
import { $lookup, $match, $project, $set, $toObjectId, $toObjectIds } from '../../shared/service/mongodb/helpers';
import ValidationError from '../../shared/composables/middleware/errors/validation-error';
import { ChatErrors } from './chat.errors.enum';
import mongoDbService from '../../shared/service/mongodb/mongo-db.service';

const chatService = {
  [LIST_CHATS]: async (page: { page: BasePagination }, userId: string): Promise<ListChatsRes> => {
    return await mongoDbService.find<DocumentChat, Pick<GetMessagesRes, 'participants' | 'hasUpdated'>>(
      DbCollection.CHAT,
      [
        $match({ participants: $toObjectId(userId) }),
        $set({ hasUpdated: hasUpdated(userId) }),
        $project({
          participants: {
            $filter: {
              input: '$participants',
              as: 'participant',
              cond: { $ne: ['$$participant', $toObjectId(userId)] },
            },
          },
          hasUpdated: 1,
        }),
        $lookup({
          from: DbCollection.USERS,
          localField: 'participants',
          as: 'participants',
          pipeline: [$project(PROFILE_BASE_DETAILS_SCHEME)],
        }),
      ],
      page
    );
  },

  [SEND_MESSAGE]: async (payload: { participants: Array<string>; message: string }, userId: string): Promise<BaseResponse> => {
    const message: ChatMessage = {
      key: uniqueKey(),
      fromId: $toObjectId(userId),
      updatedAt: Date.now(),
      message: payload.message,
    };

    const participants = $toObjectIds([...payload.participants, userId]);

    const { returnCode } = await mongoDbService.findOneAndUpdate<DocumentChat>(
      DbCollection.CHAT,
      { participants: { $in: participants, $size: participants.length } },
      { $set: { participants, updatedAt: message.updatedAt, [`lastSeenAt.${userId}`]: Date.now() }, $push: { messages: message } },
      { upsert: true }
    );

    return { returnCode };
  },

  [DELETE_MESSAGE]: async ({ key, chatId }: DeleteMessageReq, userId: string): Promise<BaseResponse> => {
    const { returnCode } = await mongoDbService.updateOne<DocumentChat>(
      DbCollection.CHAT,
      { _id: $toObjectId(chatId), [`messages.fromId`]: $toObjectId(userId), [`messages.key`]: key },
      { $set: { [`messages.$.isDeleted`]: true, [`lastSeenAt.${userId}`]: Date.now() } }
    );

    return { returnCode };
  },

  [UPDATE_MESSAGE]: async ({ key, chatId, ...rest }: UpdateMessageReq, userId: string): Promise<BaseResponse> => {
    const update = Object.entries(rest).reduce((message, [key, value]) => ({ ...message, [`messages.$.${key}`]: value }), {});
    const history = Object.keys({ ...rest, updatedAt: 0 }).reduce((save, key) => ({ ...save, [key]: `$messages.$.${key}` }), {});

    const { returnCode } = await mongoDbService.updateOne<DocumentChat>(
      DbCollection.CHAT,
      { _id: $toObjectId(chatId), [`messages.fromId`]: $toObjectId(userId), [`messages.key`]: key },
      { $set: update, $push: { [`messages.$.history`]: history } }
    );

    return { returnCode };
  },

  [GET_MESSAGES]: async (payload: GetMessagesReq, userId: string): Promise<BaseResponse<GetMessagesRes>> => {
    const ids = $toObjectIds([...payload.participants, userId]);
    const participants: Record<string, any> = { $size: ids.length, $all: ids };

    const messages = await mongoDbService.fineOne<DocumentChat, GetMessagesRes>(DbCollection.CHAT, [
      $match({ participants }),
      $set({ hasUpdated: hasUpdated(userId), lastSeenAt: `$lastSeenAt.${userId}` }),
      $lookup({
        from: DbCollection.USERS,
        localField: 'participants',
        as: 'participants',
        pipeline: [$project(PROFILE_BASE_DETAILS_SCHEME)],
      }),
      $project({
        messages: { $filter: { input: '$messages', as: 'message', cond: { $ne: ['$$message.isDeleted', true] } } },
        participants: 1,
        hasUpdated: 1,
        lastSeenAt: 1,
      }),
    ]);

    if (!messages) {
      throw new ValidationError(ChatErrors.NO_MESSAGES_FOUND, 404);
    }

    return { returnCode: 0, ...messages };
  },
};

export default chatService;
