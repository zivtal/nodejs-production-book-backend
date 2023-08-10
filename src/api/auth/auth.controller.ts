import type { Response } from 'express';
import type {
  AuthEmailValidation,
  AuthForgotPasswordReq,
  AuthRecoverPasswordReq,
  AuthCheckRes,
  AuthSecuredSignUp,
  AuthSignUpReq,
  AuthUnsecuredSignUp,
  AuthSignInReq,
  AuthSecuredSignIn,
  AuthUnsecuredSignIn,
} from './models';
import type { DocumentUser } from '../user/models';
import type { BaseRequest, BaseResponse } from '../../shared/models';
import authService from './auth.service';
import { COOKIE_IMPERSONATED, COOKIE_OPTIONS } from './auth.constants';
import { EMAIL_VALIDATE, SIGN_OUT, SIGN_IN, SIGN_UP, AUTH_CHECK, FORGOT_PASSWORD, CHANGE_PASSWORD, IMPERSONATE_TO } from './auth.map';
import InternalError from '../../shared/composables/middleware/errors/internal-error';

const authController = {
  [IMPERSONATE_TO]: async (req: BaseRequest, res: Response<BaseResponse & Partial<DocumentUser>>): Promise<void> => {
    const { returnCode, accessToken, ...user } = await authService[IMPERSONATE_TO](req.sender, req.params.id);
    res.cookie('access-token', accessToken, req.sender?.id !== req.sender?.rootId ? COOKIE_IMPERSONATED : COOKIE_OPTIONS);
    res.send({ returnCode, ...user });
  },

  [AUTH_CHECK]: async (req: BaseRequest, res: Response<AuthCheckRes>) => {
    res.send(await authService[AUTH_CHECK](req.sender));
  },

  [SIGN_IN]: async (req: BaseRequest<AuthSignInReq>, res: Response<BaseResponse>): Promise<void> => {
    const { email, password, hash } = req.body as AuthSecuredSignIn & AuthUnsecuredSignIn;
    const { accessToken, returnCode } = await authService[SIGN_IN](email, { hash, password });

    res.cookie('access-token', accessToken, COOKIE_OPTIONS).send({ returnCode });
  },

  [SIGN_UP]: async (req: BaseRequest<AuthSignUpReq>, res: Response<BaseResponse>): Promise<void> => {
    const { email, password, hash, ...restForm } = req.body as AuthSecuredSignUp & AuthUnsecuredSignUp;
    const signUpResult = await authService[SIGN_UP]({ email, password, hash, ...restForm });
    const signInResult = await authService[SIGN_IN](email, { hash, password });

    res.cookie('access-token', signInResult.accessToken, COOKIE_OPTIONS);
    res.json({ returnCode: signUpResult.returnCode || signInResult.returnCode });
  },

  [SIGN_OUT]: async (req: BaseRequest, res: Response): Promise<void> => {
    if (req.isAsMode) {
      await authController[IMPERSONATE_TO](req, res);

      return;
    }

    try {
      res.clearCookie('access-token', COOKIE_OPTIONS);
      res.send({ returnCode: 0 });
    } catch (err) {
      const { message } = err as { message: string };

      throw new InternalError(message);
    }
  },

  [EMAIL_VALIDATE]: async (req: BaseRequest<AuthEmailValidation>, res: Response<BaseResponse & { expiredAt: number; enableIn: number }>) => {
    res.send(await authService[EMAIL_VALIDATE](req.body));
  },

  [FORGOT_PASSWORD]: async (req: BaseRequest<AuthForgotPasswordReq>, res: Response<BaseResponse & { expiredAt: number; enableIn: number }>) => {
    res.send(await authService[FORGOT_PASSWORD](req.body.email));
  },

  [CHANGE_PASSWORD]: async (req: BaseRequest<AuthRecoverPasswordReq>, res: Response<BaseResponse>) => {
    const { password, hash, code, email } = req.body;
    res.send(await authService[CHANGE_PASSWORD]({ password, hash, email, code }));
  },
};

export default authController;
