import type {
  ConversationStatus,
  SendConversationReq,
  UpdateConversationReq,
  UpdateConversationStatusReq,
  CreateConversationReq,
  GetConversationRes,
  CreateConversationRes,
  ConversationAgreement,
} from './models';
import type { BaseRequest, BaseResponse } from '../../../shared/models';
import type { Response } from 'express';

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
import AuthorizationError from '../../../shared/composables/middleware/errors/authorization-error';
import { AuthErrors } from '../../auth/auth.errors.enum';
import conversationService from './conversation.service';
import SocketService from '../../../shared/service/socket/socket.service';
import RecordValidator, { mongoIdValidator, ValidationMessage } from '../../../shared/service/record-validator';
import { ConversationStatusType } from './constants';
import { ChatMessage } from '../../chat/models';
import notificationService from '../../notification/notification.service';
import { SET_NOTIFICATION } from '../../notification/notification.maps';
import { NotificationType } from '../../notification/constants';
import { $toObjectId } from '../../../shared/service/mongodb/helpers';

const conversationController = {
  [CREATE_CONVERSATION]: async (req: BaseRequest<CreateConversationReq>, res: Response<CreateConversationRes>): Promise<void> => {
    if (!req.sender?.id) {
      throw new AuthorizationError(AuthErrors.UNAUTHORIZED);
    }

    const validation = new RecordValidator<CreateConversationReq>(
      { ...req.body, ...req.params },
      [
        ['positionId', { required: [true], custom: [mongoIdValidator] }],
        ['amount', { required: [true] }],
        ['currencyType', { required: [true] }],
        ['includeTax', { type: [['Boolean']] }],
      ],
      { positionId: 1, amount: 1, currencyType: 1, includeTax: 1 }
    );

    const { ownerId, ...conversation } = await conversationService[CREATE_CONVERSATION](validation.results, req.sender.id);

    res.send(conversation);

    if (conversation.returnCode !== 0 || !ownerId) {
      return;
    }

    const participants = await SocketService.send(CREATE_CONVERSATION, conversation, req.sender.id, req.body.positionId);

    if (!participants?.length) {
      return;
    }

    await notificationService[SET_NOTIFICATION]({
      userId: participants.map((id) => $toObjectId(id)),
      fromId: $toObjectId(req.sender.id),
      conversationId: conversation.conversationId,
      type: NotificationType.NEW_CONVERSATION,
    });
  },

  [GET_CONVERSATION]: async (req: BaseRequest<any, { id: string }>, res: Response<GetConversationRes>): Promise<void> => {
    if (!req.sender?.id) {
      throw new AuthorizationError(AuthErrors.UNAUTHORIZED);
    }

    const validation = new RecordValidator<{ id: string }>(req.params, [['id', { required: [true], custom: [mongoIdValidator] }]]);
    const conversation = await conversationService[GET_CONVERSATION](validation.results.id, req.sender.id);
    res.send(conversation);
  },

  [LEAVE_CONVERSATION]: async (req: BaseRequest<any, { id: string }>, res: Response<BaseResponse>): Promise<void> => {
    if (!req.sender?.id) {
      throw new AuthorizationError(AuthErrors.UNAUTHORIZED);
    }

    const validation = new RecordValidator<{ id: string }>(req.params, [['id', { required: [true], custom: [mongoIdValidator] }]]);
    res.send(await conversationService[LEAVE_CONVERSATION](validation.results.id, req.sender.id));
  },

  [UPDATE_CONVERSATION_STATUS]: async (req: BaseRequest<UpdateConversationStatusReq>, res: Response<BaseResponse>): Promise<void> => {
    if (!req.sender?.id) {
      throw new AuthorizationError(AuthErrors.UNAUTHORIZED);
    }

    const validation = new RecordValidator<UpdateConversationStatusReq>(req.body, [
      ['id', { required: [true], custom: [mongoIdValidator] }],
      ['status', { equal: [ConversationStatusType, ValidationMessage.INVALID_TYPE] }],
    ]);

    const { returnCode, ...conversation } = await conversationService[UPDATE_CONVERSATION_STATUS](validation.results, req.sender.id);

    res.send({ returnCode });

    if (returnCode !== 0) {
      return;
    }

    const participants = await SocketService.send<{ status: ConversationStatus }>(
      UPDATE_CONVERSATION_STATUS,
      { status: conversation.status.pop()! },
      req.sender.id,
      req.body.id
    );

    if (!participants?.length) {
      return;
    }

    await notificationService[SET_NOTIFICATION]({
      conversationId: conversation._id,
      type: NotificationType.STATUS_CONVERSATION,
      userId: participants.map((id) => $toObjectId(id)),
      conversationStatus: conversation.status.pop()?.type,
    });
  },

  [SEND_CONVERSATION_MESSAGE]: async (req: BaseRequest<SendConversationReq>, res: Response<ChatMessage>): Promise<void> => {
    if (!req.sender?.id) {
      throw new AuthorizationError(AuthErrors.UNAUTHORIZED);
    }

    const validation = new RecordValidator<SendConversationReq>(req.body, [
      ['id', { required: [true], custom: [mongoIdValidator] }],
      ['message', { required: [true], minLength: [1] }],
    ]);

    const message = await conversationService[SEND_CONVERSATION_MESSAGE](validation.results, req.sender.id);

    res.send(message);

    const participants = await SocketService.send(SEND_CONVERSATION_MESSAGE, message, req.sender.id, req.body.id);

    if (!participants?.length) {
      return;
    }

    await notificationService[SET_NOTIFICATION]({
      userId: participants.map((id) => $toObjectId(id)),
      fromId: $toObjectId(req.sender.id),
      conversationId: req.body.id,
      type: NotificationType.CONVERSATION_MESSAGE,
    });
  },

  [DELETE_CONVERSATION_MESSAGE]: async (req: BaseRequest<UpdateConversationReq>, res: Response<BaseResponse>): Promise<void> => {
    if (!req.sender?.id) {
      throw new AuthorizationError(AuthErrors.UNAUTHORIZED);
    }

    const payload = new RecordValidator<UpdateConversationReq>(req.body, [
      ['id', { required: [true], type: ['String'], custom: [mongoIdValidator] }],
      ['key', { required: [true], type: ['String'] }],
    ]);

    res.send(await conversationService[DELETE_CONVERSATION_MESSAGE](payload.results, req.sender.id));
  },

  [UPDATE_CONVERSATION_MESSAGE]: async (req: BaseRequest<UpdateConversationReq>, res: Response<BaseResponse>): Promise<void> => {
    if (!req.sender?.id) {
      throw new AuthorizationError(AuthErrors.UNAUTHORIZED);
    }

    const validation = new RecordValidator<UpdateConversationReq>(req.body, [
      ['id', { required: [true], type: ['String'], custom: [mongoIdValidator] }],
      ['message', { required: [true], type: ['String'] }],
      ['key', { required: [true], type: ['String'] }],
    ]);

    res.send(await conversationService[UPDATE_CONVERSATION_MESSAGE](validation.results, req.sender.id));
  },

  [UPDATE_CONVERSATION_AGREEMENTS]: async (
    req: BaseRequest<Omit<ConversationAgreement, 'updatedAt'>, { conversationId: string }>,
    res: Response<BaseResponse>
  ): Promise<void> => {
    if (!req.sender) {
      throw new AuthorizationError(AuthErrors.UNAUTHORIZED);
    }

    res.send(await conversationService[UPDATE_CONVERSATION_AGREEMENTS](req.params.conversationId, req.sender.id, req.body));
  },
};

export default conversationController;
