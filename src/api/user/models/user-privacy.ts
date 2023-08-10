import type { CanSee } from '../../../shared/models';

export interface UserPrivacy {
  see: CanSee;
  sendMessage: CanSee;
}
