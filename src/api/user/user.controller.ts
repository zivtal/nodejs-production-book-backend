import type { Response } from 'express';
import type { DocumentUser } from './models';
import type { BaseRequest, BaseErrorResponse, BasePagination } from '../../shared/models';

import { ADD_USER, GET_USER, GET_USERS, REMOVE_USER, UPDATE_USER } from './user.map';
import { UserErrorsEnum } from './user.errors.enum';
import userService from './user.service';
import NotFoundError from '../../shared/composables/middleware/errors/not-found-error';
import AuthorizationError from '../../shared/composables/middleware/errors/authorization-error';

const userController = {
  [GET_USERS]: async (req: BaseRequest<{ page: BasePagination }>, res: Response): Promise<void> => {
    try {
      const params = req.body;
      const send = await userService[GET_USERS](params);
      res.json(send);
    } catch (err) {
      const error: BaseErrorResponse = { errorMessage: [{ message: UserErrorsEnum.FAILED }] };
      res.status(401).send(error);
    }
  },

  [GET_USER]: async (req: BaseRequest, res: Response) => {
    try {
      const { id } = req.params;
      const user = await userService[GET_USER]({ userId: id });

      if (!user) {
        throw new NotFoundError(UserErrorsEnum.FAILED);
      }

      res.json(user);
    } catch (e) {
      const error: BaseErrorResponse = { errorMessage: [{ message: UserErrorsEnum.FAILED }] };
      res.status(401).send(error);
    }
  },

  [ADD_USER]: async (req: BaseRequest<DocumentUser>, res: Response) => {
    try {
      res.json(await userService[ADD_USER](req.body));
    } catch (err) {
      const error: BaseErrorResponse = { errorMessage: [{ message: UserErrorsEnum.FAILED }] };
      res.status(500).send(error);
    }
  },

  [UPDATE_USER]: async (req: BaseRequest<DocumentUser>, res: Response) => {
    if (req.body._id !== req.sender?.id) {
      throw new AuthorizationError(UserErrorsEnum.FAILED);
    }

    const savedUser = await userService[UPDATE_USER](req.body);

    res.send(savedUser);
  },

  [REMOVE_USER]: async (req: BaseRequest, res: Response) => {
    const { id } = req.params;
    const deletedId = await userService[REMOVE_USER](id);

    res.send(deletedId);
  },
};

export default userController;
