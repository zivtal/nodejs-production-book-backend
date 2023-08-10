import type { Response } from 'express';
import type { BaseRequest, BaseResponse, BaseRecords } from '../../shared/models';
import type { GetNotificationReq, GetNotificationRes } from './models';
import { GET_NOTIFICATIONS, REMOVE_NOTIFICATION, SAVE_TOKEN } from './notification.maps';
import AuthorizationError from '../../shared/composables/middleware/errors/authorization-error';
import { AuthErrors } from '../auth/auth.errors.enum';
import notificationService from './notification.service';
import { firebaseService } from '../../app';

const notificationController = {
  [GET_NOTIFICATIONS]: async (req: BaseRequest<GetNotificationReq>, res: Response<BaseRecords<GetNotificationRes>>): Promise<void> => {
    if (!req.sender?.id) {
      throw new AuthorizationError(AuthErrors.UNAUTHORIZED);
    }

    const { page, skills = req.skills || [], specialization = req.specialization || [] } = req.body;

    res.send(await notificationService[GET_NOTIFICATIONS](req.sender, { page, skills, specialization }));
  },

  [REMOVE_NOTIFICATION]: async (req: BaseRequest, res: Response<BaseResponse>): Promise<void> => {
    if (!req.sender?.id) {
      throw new AuthorizationError(AuthErrors.UNAUTHORIZED);
    }

    res.send(await notificationService[REMOVE_NOTIFICATION](req.params.id, req.sender.id));
  },

  [SAVE_TOKEN]: async (req: BaseRequest<{ token: string }>, res: Response<BaseResponse>): Promise<void> => {
    if (!req.sender?.id) {
      throw new AuthorizationError(AuthErrors.UNAUTHORIZED);
    }

    // TODO: Add logic save token to db, temporary send notification to token after 10 secs
    setTimeout(() => firebaseService.send(req.body.token, { notification: { title: 'test', body: 'body' } }), 10000);

    res.send({ returnCode: 0 });
  },
};

export default notificationController;
