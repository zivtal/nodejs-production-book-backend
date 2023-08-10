import type { Response } from 'express';
import type { BasePagination, BaseRequest, BaseResponse } from '../../shared/models';
import type { DeleteMessageReq, GetMessagesReq, GetMessagesRes, ListChatsRes, SendMessageReq, UpdateMessageReq } from './models';
import { DELETE_MESSAGE, GET_MESSAGES, LIST_CHATS, SEND_MESSAGE, UPDATE_MESSAGE } from './chat.map';
import chatService from './chat.service';
import { AuthErrors } from '../auth/auth.errors.enum';
import AuthenticationError from '../../shared/composables/middleware/errors/authentication-error';
import RecordValidator, { mongoIdValidator } from '../../shared/service/record-validator';

const chatController = {
  [LIST_CHATS]: async (req: BaseRequest<{ page: BasePagination }>, res: Response<ListChatsRes>): Promise<void> => {
    if (!req.sender) {
      throw new AuthenticationError(AuthErrors.UNAUTHORIZED);
    }

    const list = await chatService[LIST_CHATS](req.body, req.sender.id);
    res.send(list);
  },

  [SEND_MESSAGE]: async (req: BaseRequest<SendMessageReq>, res: Response<BaseResponse>): Promise<void> => {
    if (!req.sender) {
      throw new AuthenticationError(AuthErrors.UNAUTHORIZED);
    }

    const validator = new RecordValidator<SendMessageReq>(
      req.body,
      [
        ['message', { required: [true] }],
        ['participants', { required: [true], type: ['Array'], minLength: [1], custom: [mongoIdValidator] }],
      ],
      { message: 1, participants: 1 }
    );

    const { returnCode } = await chatService[SEND_MESSAGE](validator.results, req.sender.id);
    res.send({ returnCode });
  },

  [DELETE_MESSAGE]: async (req: BaseRequest<DeleteMessageReq>, res: Response<BaseResponse>): Promise<void> => {
    if (!req.sender) {
      throw new AuthenticationError(AuthErrors.UNAUTHORIZED);
    }

    const validator = new RecordValidator<DeleteMessageReq>(
      req.body,
      [
        ['key', { required: [true], type: ['String'] }],
        ['chatId', { required: [true], type: ['String'], custom: [mongoIdValidator] }],
      ],
      { key: 1, chatId: 1 }
    );

    res.send(await chatService[DELETE_MESSAGE](validator.results, req.sender.id));
  },

  [UPDATE_MESSAGE]: async (req: BaseRequest<UpdateMessageReq>, res: Response<BaseResponse>): Promise<void> => {
    if (!req.sender) {
      throw new AuthenticationError(AuthErrors.UNAUTHORIZED);
    }

    const validator = new RecordValidator<UpdateMessageReq>(
      req.body,
      [
        ['key', { required: [true], type: ['String'] }],
        ['chatId', { required: [true], type: ['String'], custom: [mongoIdValidator] }],
      ],
      { key: 1, chatId: 1, message: 1 }
    );

    res.send(await chatService[UPDATE_MESSAGE](validator.results, req.sender.id));
  },

  [GET_MESSAGES]: async (req: BaseRequest<GetMessagesReq>, res: Response<BaseResponse<GetMessagesRes>>): Promise<void> => {
    if (!req.sender) {
      throw new AuthenticationError(AuthErrors.UNAUTHORIZED);
    }

    const validator = new RecordValidator<GetMessagesReq>(
      req.body,
      [['participants', { required: [true], type: ['Array'], minLength: [1], custom: [mongoIdValidator] }]],
      { participants: 1 }
    );

    const chat = await chatService[GET_MESSAGES](validator.results, req.sender.id);
    res.send({ ...(chat || {}), returnCode: chat ? 0 : 1 });
  },
};

export default chatController;
