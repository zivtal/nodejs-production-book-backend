import type { UserGender, UserLocation } from '../../user/models';

interface AuthSignUp {
  email: string;
  firstName: string;
  lastName: string;
  nickName?: string;
  company?: string;
  phone: string;
  birthday?: number;
  gender?: UserGender;
  skills?: Array<string>;
  specialization?: Array<string>;
  location?: UserLocation;
  emailValidateCode: number;
}

export interface AuthSecuredSignUp extends AuthSignUp {
  hash: string;
}

export interface AuthUnsecuredSignUp extends AuthSignUp {
  password: string;
}

export type AuthSignUpReq = AuthSecuredSignUp | AuthUnsecuredSignUp;
