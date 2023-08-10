import type { CookieOptions } from 'express-serve-static-core';
import config from '../../config';
import { USER_CONFIGURATION } from '../user/user.constants';

export const AUTH_ACTIONS: Array<string> = [...(config.AUTH_ACTIONS || [])];
export const AUTH_ACTIONS_LOGGED_IN: Array<string> = [...(config.AUTH_ACTIONS_LOGGED_IN || [])];
export const SALT_ROUNDS: number = 10;
export const COOKIE_OPTIONS: CookieOptions = {
  maxAge: 60 * 60 * 24 * 30 * 1000,
  sameSite: config.IS_PRODUCTION ? 'none' : undefined,
  secure: config.IS_PRODUCTION ? true : undefined,
};

export const COOKIE_IMPERSONATED: CookieOptions = {
  maxAge: 60 * 60 * 24 * 1000,
  sameSite: config.IS_PRODUCTION ? 'none' : undefined,
  secure: config.IS_PRODUCTION ? true : undefined,
};
export const CHANGE_PASSWORD_MAIL_SUBJECT = 'Change password verification code';
export const VERIFICATION_CODE_MAIL_SUBJECT = 'Verification code';
export const VERIFICATION_CODE_EXPIRE_IN = 60 * 1000;
export const AUTH_CHECK_SCHEME = { [`${USER_CONFIGURATION}.hashedPass`]: 0 };
