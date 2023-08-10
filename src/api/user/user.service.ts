import type { DocumentUser } from './models';
import type { BaseRecords, BasePagination, BaseResponse, BaseId } from '../../shared/models';
import { ADD_USER, GET_USER, GET_USERS, REMOVE_USER, UPDATE_USER } from './user.map';
import { UserErrorsEnum } from './user.errors.enum';
import { DbCollection } from '../../shared/service/mongodb/constants';
import RecordValidator, { ValidationMessage } from '../../shared/service/record-validator';
import { ObjectId } from 'mongodb';
import AuthenticationError from '../../shared/composables/middleware/errors/authentication-error';
import RegexPattern from '../../shared/constants/regex-pattern';
import ValidationError from '../../shared/composables/middleware/errors/validation-error';
import { $match, $toObjectId } from '../../shared/service/mongodb/helpers';
import mongoDbService from '../../shared/service/mongodb/mongo-db.service';

const userService = {
  [GET_USERS]: async ({ page }: { page: BasePagination }): Promise<BaseRecords<DocumentUser>> => {
    try {
      return await mongoDbService.find<DocumentUser>(DbCollection.USERS, [], { page });
    } catch (err) {
      throw err;
    }
  },

  [GET_USER]: async ({ userId, email }: { userId?: BaseId; email?: string }): Promise<DocumentUser> => {
    new RecordValidator({ userId, email }, [
      ['userId', { required: [true] }],
      ['email', { regex: [RegexPattern.EMAIL_ADDRESS, ValidationMessage.INVALID_EMAIL_ADDRESS] }],
    ]);

    return await mongoDbService.fineOne<DocumentUser>(DbCollection.USERS, [
      $match({ ...(userId ? { _id: $toObjectId(userId) } : {}), ...(email ? { email } : {}) }),
    ]);
  },

  [ADD_USER]: async (user: DocumentUser): Promise<BaseResponse> => {
    const { email } = user;

    if (await mongoDbService.fineOne<DocumentUser>(DbCollection.USERS, [$match({ email })])) {
      throw new AuthenticationError(UserErrorsEnum.ALREADY_EXISTS, email);
    }

    if (!(await mongoDbService.insertOne(DbCollection.USERS, user))) {
      throw new AuthenticationError(UserErrorsEnum.FAILED);
    }

    return { returnCode: 0 };
  },

  [REMOVE_USER]: async (id: string): Promise<BaseResponse> => {
    try {
      return await mongoDbService.deleteOne(DbCollection.USERS, { _id: $toObjectId(id) });
    } catch (err) {
      throw err;
    }
  },

  [UPDATE_USER]: async (user: Partial<DocumentUser>): Promise<Partial<DocumentUser>> => {
    const userToSave: Partial<DocumentUser> = {
      ...user,
      _id: new ObjectId(user._id),
    };

    const { returnCode } = await mongoDbService.updateOne<DocumentUser>(DbCollection.USERS, { _id: userToSave._id }, { $set: userToSave });

    if (returnCode) {
      throw new ValidationError(UserErrorsEnum.FAILED);
    }

    return user;
  },
};

export default userService;
