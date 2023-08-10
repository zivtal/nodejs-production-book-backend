import type { AuthSecuredSignUp, AuthUnsecuredSignUp } from '../models';
import type { ValidatorScheme } from '../../../shared/service/record-validator';

export const SIGN_UP_SCHEME: ValidatorScheme<AuthSecuredSignUp & AuthUnsecuredSignUp> = {
  email: 1,
  hash: 0,
  emailValidateCode: 0,
  phone: 1,
  password: 0,
  lastName: 1,
  firstName: 1,
  skills: 1,
  birthday: 1,
  company: 1,
  gender: 1,
  nickName: 1,
  location: 1,
  specialization: 1,
};
