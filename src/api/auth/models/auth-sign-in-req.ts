interface AuthSignIn {
  email: string;
}
export interface AuthSecuredSignIn extends AuthSignIn {
  hash: string;
}

export interface AuthUnsecuredSignIn extends AuthSignIn {
  password: string;
}

export type AuthSignInReq = AuthSecuredSignIn | AuthUnsecuredSignIn;
