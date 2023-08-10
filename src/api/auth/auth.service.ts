import type {
  AuthRecoverPasswordReq,
  AuthCheckRes,
  AuthSecuredSignUp,
  AuthSignUpReq,
  AuthUnsecuredSignUp,
  AuthEmailValidation,
  AuthUser,
} from './models';
import type { DocumentUser } from '../user/models';
import type { BaseResponse, BaseRequest, BaseId } from '../../shared/models';
import type { AccessToken } from '../../shared/service/token/models/access-token';
import { Gender } from '../../shared/constants';
import bcrypt from 'bcrypt';
import { AUTH_CHECK, CHANGE_PASSWORD, EMAIL_VALIDATE, FORGOT_PASSWORD, IMPERSONATE_TO, SIGN_IN, SIGN_UP } from './auth.map';
import {
  AUTH_ACTIONS,
  AUTH_ACTIONS_LOGGED_IN,
  CHANGE_PASSWORD_MAIL_SUBJECT,
  SALT_ROUNDS,
  VERIFICATION_CODE_EXPIRE_IN,
  VERIFICATION_CODE_MAIL_SUBJECT,
} from './auth.constants';
import { SIGN_UP_SCHEME } from './constants/sign-up.scheme';
import { AuthErrors } from './auth.errors.enum';
import { DbCollection } from '../../shared/service/mongodb/constants';
import RecordValidator, { type CustomValidator, ValidatorRegex, ValidationMessage, coordinateValidator } from '../../shared/service/record-validator';
import MailChimp from '../../shared/service/mail-chimp.service';
import AuthenticationError from '../../shared/composables/middleware/errors/authentication-error';
import ValidationError from '../../shared/composables/middleware/errors/validation-error';
import CryptService from '../../shared/service/crypt.service';
import TokenService from '../../shared/service/token/token.service';
import RegexPattern from '../../shared/constants/regex-pattern';
import { AUTH_USER_SCHEME, USER_CONFIGURATION } from '../user/user.constants';
import { LENGTH } from '../../shared/constants';
import { uniqueKey } from '../../shared/helpers';
import { $match, $project, $toObjectId } from '../../shared/service/mongodb/helpers';
import mongoDbService from '../../shared/service/mongodb/mongo-db.service';

const authService = {
  [AUTH_CHECK]: async (accessToken: BaseRequest['sender']): Promise<BaseResponse & AuthCheckRes> => {
    const key = (accessToken?.id || accessToken?.rootId)?.slice(-5);

    if (!accessToken?.rootId && !accessToken?.id) {
      return {
        returnCode: 0,
        actions: AUTH_ACTIONS.map((action) => uniqueKey(action, key)),
      };
    }

    const rootUser =
      accessToken?.rootId || accessToken?.id
        ? (
            await mongoDbService.findOneAndUpdate<DocumentUser>(
              DbCollection.USERS,
              { _id: $toObjectId(accessToken.rootId || accessToken?.id) },
              { $set: { [`${USER_CONFIGURATION}.lastSeenAt`]: Date.now() } },
              { projection: { [`${USER_CONFIGURATION}.hashedPass`]: 0 } }
            )
          )?.value
        : undefined;

    const activeUser =
      accessToken?.id && accessToken?.rootId && accessToken.id !== accessToken?.rootId
        ? await mongoDbService.fineOne<DocumentUser>(
            DbCollection.USERS,
            [$match({ _id: $toObjectId(accessToken.id) }), $project({ [`${USER_CONFIGURATION}.hashedPass`]: 0 })],
            true
          )
        : undefined;

    const { [USER_CONFIGURATION]: rootConfig } = rootUser || {};
    const { [USER_CONFIGURATION]: activeConfig } = activeUser || {};

    const isValidKey = (key: string): boolean =>
      !!Object.entries(AUTH_USER_SCHEME)
        .filter(([_, value]) => value === 1)
        .find(([aKey]) => aKey === key);

    const authCreate = (user: any, config?: Record<string, any>) =>
      Object.entries({ ...user, ...(config || {}) }).reduce(
        (user, [key, value]) => (isValidKey(key) ? { ...user, [key]: value } : user),
        {} as AuthUser
      );

    const authActions = activeUser ? activeConfig?.authActions || [] : rootConfig?.authActions || [];

    return {
      returnCode: rootUser?._id ? 0 : 1,
      language: rootConfig?.language,
      user: rootUser ? authCreate(rootUser, rootConfig) : undefined,
      impersonate: activeUser ? authCreate(activeUser, activeConfig) : undefined,
      actions: [...new Set([...AUTH_ACTIONS, ...AUTH_ACTIONS_LOGGED_IN, ...authActions])].map((action) => uniqueKey(action, key)),
    };
  },

  [IMPERSONATE_TO]: async (
    accessToken: BaseRequest['sender'],
    userId?: BaseId
  ): Promise<BaseResponse & Partial<DocumentUser> & { accessToken?: string }> => {
    if (!accessToken?.rootId) {
      throw new AuthenticationError(AuthErrors.UNAUTHORIZED);
    }

    const { email, hashedPass, rootId } = accessToken;

    if (!userId) {
      return {
        returnCode: 0,
        accessToken: TokenService.encrypt<AccessToken>({ id: rootId, email, hashedPass, rootId }),
      };
    }

    const { [USER_CONFIGURATION]: userConfiguration } = await mongoDbService.fineOne<DocumentUser>(
      DbCollection.USERS,
      [
        $match({
          email,
          _id: $toObjectId(rootId),
          [`${USER_CONFIGURATION}.hashedPass`]: hashedPass,
          [`${USER_CONFIGURATION}.role`]: 'ADMIN',
        }),
      ],
      true
    );

    const { [USER_CONFIGURATION]: activeConfiguration, ...user } = await mongoDbService.fineOne<DocumentUser>(
      DbCollection.USERS,
      [$match({ _id: $toObjectId(userId) })],
      true
    );

    return userConfiguration.role === 'ADMIN'
      ? {
          returnCode: 0,
          accessToken: TokenService.encrypt<AccessToken>({
            id: user._id.toString(),
            email,
            hashedPass,
            rootId,
          }),
          ...user,
        }
      : { returnCode: 1 };
  },

  [SIGN_IN]: async (
    email: string,
    option: { hash: string } | { password: string }
  ): Promise<BaseResponse & { accessToken: string; superToken?: string }> => {
    const { hash, password } = option as { hash: string; password: string };
    new RecordValidator({ email, password: password || hash }, [
      ['email', { required: [true], type: ['String'], regex: [RegexPattern.EMAIL_ADDRESS, ValidationMessage.INVALID_EMAIL_ADDRESS] }],
      ['password', { required: [true], type: ['String'] }],
    ]);

    const { [USER_CONFIGURATION]: userConfiguration, ...user }: DocumentUser = await mongoDbService.fineOne<DocumentUser>(
      DbCollection.USERS,
      [$match({ email })],
      true
    );
    const { hashedPass } = userConfiguration;

    if (!hashedPass || !(await bcrypt.compare(hash ? CryptService.decrypt(hash, email) : password, hashedPass))) {
      throw new AuthenticationError(AuthErrors.LOGIN_FAILED);
    }

    const accessToken = TokenService.encrypt<AccessToken>({
      id: user._id.toString(),
      hashedPass,
      email: user.email,
      rootId: userConfiguration.role === 'ADMIN' ? (user._id as string) : undefined,
    });

    return { returnCode: 0, accessToken };
  },

  [SIGN_UP]: async (userSignupForm: AuthSignUpReq): Promise<BaseResponse> => {
    const { email, password, hash, firstName, lastName, emailValidateCode, ...restForm } = userSignupForm as AuthSecuredSignUp & AuthUnsecuredSignUp;

    const validator = new RecordValidator<AuthSecuredSignUp & AuthUnsecuredSignUp>(
      { email, password: (() => (hash ? CryptService.decrypt(hash, email) : password))(), hash, firstName, lastName, emailValidateCode, ...restForm },
      [
        ['email', { required: [true], type: ['String'], regex: ValidatorRegex.EMAIL_ADDRESS }],
        [['firstName', 'lastName'], { required: [true], type: ['String'], regex: ValidatorRegex.NAME }],
        ['birthday', { type: ['Number'] }],
        ['phone', { type: ['String'], regex: ValidatorRegex.PHONE.HE }],
        ['location', { required: [true], custom: [coordinateValidator] }],
        ['gender', { equal: [Gender, null, { valueReturn: true }] }],
        ['password', { required: [true], type: ['String'], minLength: [8], regex: ValidatorRegex.PASSWORD }],
        ['skills', { required: [true], minLength: [1], maxLength: [10] }],
        ['specialization', { required: [true], minLength: [1], maxLength: [10] }],
        ['emailValidateCode', { type: ['Number'], length: [LENGTH.VERIFICATION_CODE] }],
      ],
      SIGN_UP_SCHEME,
      { skipUndefined: true }
    );

    const { returnCode } = await mongoDbService.updateOne<DocumentUser>(
      DbCollection.USERS,
      {
        email,
        [`${USER_CONFIGURATION}.verificationCode.code`]: emailValidateCode,
        [`${USER_CONFIGURATION}.verificationCode.createdAt`]: { $gte: Date.now() - VERIFICATION_CODE_EXPIRE_IN },
        [`${USER_CONFIGURATION}.hashedPass`]: { $exists: false },
      },
      {
        $set: {
          ...validator.results,
          [`${USER_CONFIGURATION}.hashedPass`]: await bcrypt.hash(hash ? CryptService.decrypt(hash, email) : password, SALT_ROUNDS),
          [`${USER_CONFIGURATION}.isActivated`]: true,
          createdAt: Date.now(),
        },
        $unset: { [`${USER_CONFIGURATION}.verificationCode`]: '' },
      }
    );

    if (returnCode) {
      const { [USER_CONFIGURATION]: userConfiguration } = await mongoDbService.fineOne<DocumentUser>(DbCollection.USERS, [$match({ email })], true);
      const { verificationCode, hashedPass } = userConfiguration;

      if (hashedPass) {
        throw new AuthenticationError(AuthErrors.SIGNUP_FAILED);
      }

      if (verificationCode) {
        const expiredValidator: CustomValidator = () => [verificationCode.createdAt + VERIFICATION_CODE_EXPIRE_IN > Date.now(), AuthErrors.EXPIRED];
        const validate = new RecordValidator({ emailValidateCode }, [
          ['emailValidateCode', { custom: [expiredValidator], equal: [verificationCode.code] }],
        ]);

        if (validate.errors) {
          throw new ValidationError(validate.errors);
        }
      }

      throw new AuthenticationError(AuthErrors.SIGNUP_FAILED);
    }

    return { returnCode: 0 };
  },

  [EMAIL_VALIDATE]: async ({ email, firstName, lastName }: AuthEmailValidation): Promise<BaseResponse & { expiredAt: number; enableIn: number }> => {
    new RecordValidator({ email }, [
      ['email', { required: [true], type: ['String'], regex: [RegexPattern.EMAIL_ADDRESS, ValidationMessage.INVALID_EMAIL_ADDRESS] }],
    ]);

    const createdAt = Date.now();
    const expiredAt = createdAt + VERIFICATION_CODE_EXPIRE_IN;
    const code = Math.floor(100000 + Math.random() * 900000);
    const { returnCode, value } = await mongoDbService.findOneAndUpdate<DocumentUser>(
      DbCollection.USERS,
      { email },
      { $set: { [`${USER_CONFIGURATION}.verificationCode`]: { code, createdAt } } },
      { upsert: true }
    );

    if (value[USER_CONFIGURATION].hashedPass) {
      throw new ValidationError({ message: ValidationMessage.ALREADY_EXISTS, property: 'email' });
    }

    const chimp = new MailChimp('CONFIRM', { title: VERIFICATION_CODE_MAIL_SUBJECT, 'verification-code': code, firstName, lastName });
    const sent = await chimp.send(email, VERIFICATION_CODE_MAIL_SUBJECT);

    if (!sent) {
      throw new ValidationError(AuthErrors.EMAIL_WAS_NOT_SENT);
    }

    return { returnCode, enableIn: 60 * 1000, expiredAt };
  },

  [FORGOT_PASSWORD]: async (email: string): Promise<BaseResponse & { expiredAt: number; enableIn: number }> => {
    new RecordValidator({ email }, [
      ['email', { required: [true], type: ['String'], regex: [RegexPattern.EMAIL_ADDRESS, ValidationMessage.INVALID_EMAIL_ADDRESS] }],
    ]);

    const createdAt = Date.now();
    const expiredAt = createdAt + VERIFICATION_CODE_EXPIRE_IN;
    const code = Math.floor(100000 + Math.random() * 900000);

    try {
      const { returnCode, value } = await mongoDbService.findOneAndUpdate<DocumentUser>(
        DbCollection.USERS,
        { email },
        { $set: { [`${USER_CONFIGURATION}.verificationCode`]: { code, createdAt: Date.now() } } }
      );

      if (returnCode) {
        throw new ValidationError(AuthErrors.EMAIL_WAS_NOT_SENT);
      }

      const chimp = new MailChimp('CONFIRM', {
        title: CHANGE_PASSWORD_MAIL_SUBJECT,
        'verification-code': code,
        firstName: value.firstName,
        lastName: value.lastName,
      });

      const sent = await chimp.send(email, CHANGE_PASSWORD_MAIL_SUBJECT);

      if (!sent) {
        throw new ValidationError(AuthErrors.EMAIL_WAS_NOT_SENT);
      }
    } catch (e) {
      throw new ValidationError(AuthErrors.NOT_EXISTS);
    }

    return { returnCode: 0, enableIn: 60 * 1000, expiredAt };
  },

  [CHANGE_PASSWORD]: async (data: AuthRecoverPasswordReq): Promise<BaseResponse> => {
    const { email, code, password, hash } = data;
    const decryptPassword = (() => (hash ? CryptService.decrypt(hash, email) : password))();

    new RecordValidator<AuthRecoverPasswordReq>(
      { ...data, password: decryptPassword },
      [
        ['password', { required: [true], type: ['String'], regex: [RegexPattern.STRONG_PASSWORD, ValidationMessage.WEAK_PASSWORD] }],
        ['email', { required: [true], type: ['String'], regex: [RegexPattern.EMAIL_ADDRESS, ValidationMessage.INVALID_EMAIL_ADDRESS] }],
        ['code', { required: [true], type: ['Number'], length: [6] }],
      ],
      { password: 1, email: 1, code: 1, hash: 0 }
    );

    const { returnCode } = await mongoDbService.updateOne(
      DbCollection.USERS,
      {
        email,
        [`${USER_CONFIGURATION}.verificationCode.code`]: code,
        [`${USER_CONFIGURATION}.verificationCode.createdAt`]: { $gte: Date.now() - VERIFICATION_CODE_EXPIRE_IN },
      },
      {
        $set: { [`${USER_CONFIGURATION}.hashedPass`]: await bcrypt.hash(decryptPassword, SALT_ROUNDS) },
        $unset: { [`${USER_CONFIGURATION}.verificationCode`]: '' },
      }
    );

    if (returnCode) {
      const { userConfiguration } = await mongoDbService.fineOne<DocumentUser>(DbCollection.USERS, [$match({ email })], true);
      const { verificationCode } = userConfiguration || {};

      if (verificationCode) {
        const expiredValidator: CustomValidator = () => [verificationCode.createdAt + VERIFICATION_CODE_EXPIRE_IN > Date.now(), AuthErrors.EXPIRED];
        const validate = new RecordValidator({ code }, [['code', { custom: [expiredValidator], equal: [verificationCode.code] }]]);

        if (validate.errors) {
          throw new ValidationError(validate.errors);
        }
      }

      throw new ValidationError(AuthErrors.CHANGE_PASSWORD_FAILED);
    }

    return { returnCode };
  },
};

export default authService;
