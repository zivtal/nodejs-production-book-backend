import type { Role } from '../../../shared/models';
import type { UserPrivacy } from './user-privacy';

export interface UserConfiguration {
  language?: string;
  authActions?: Array<string>;
  role?: Role;
  hashedPass: string;
  verificationCode?: {
    code: string;
    createdAt: number;
  };
  privacy?: UserPrivacy;
}
