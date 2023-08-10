import type { AuthUser } from './auth-user';

export interface AuthCheckRes {
  language?: string;
  actions: Array<string>;
  user?: AuthUser;
  impersonate?: AuthUser;
}
