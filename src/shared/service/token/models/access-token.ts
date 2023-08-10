import type { BaseId, DocumentUser } from '../../../models';

export interface AccessToken {
  id: BaseId;
  email: DocumentUser['email'];
  hashedPass?: string;
  rootId?: BaseId;
}
