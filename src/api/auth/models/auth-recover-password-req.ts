export interface AuthRecoverPassword {
  email: string;
  code: string;
}

export interface AuthSecuredRecoverPassword extends AuthRecoverPassword {
  hash: string;
}

export interface AuthUnsecuredRecoverPassword extends AuthRecoverPassword {
  password: string;
}

export type AuthRecoverPasswordReq = AuthSecuredRecoverPassword & AuthUnsecuredRecoverPassword;
