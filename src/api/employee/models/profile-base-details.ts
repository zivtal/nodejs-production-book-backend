import type { DbResponse } from '../../../shared/service/mongodb/models';

export interface ProfileBaseDetails extends DbResponse {
  firstName: string;
  lastName: string;
  company?: string;
  nickName?: string;
  verified?: boolean;
  avatar?: string | null;
}
