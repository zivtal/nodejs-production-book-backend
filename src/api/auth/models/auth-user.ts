import type { ProfileBaseDetails } from '../../employee/models';
import type { Role } from '../../../shared/models';
import type { DocumentUser, UserPrivacy } from '../../user/models';

export interface AuthUser extends ProfileBaseDetails {
  role?: Role;
  privacy?: UserPrivacy;
  lastSeenAt?: number;
  wage: DocumentUser['wage'];
  birthday: DocumentUser['birthday'];
  email: DocumentUser['email'];
  phone: DocumentUser['phone'];
  location: DocumentUser['location'];
  skills: DocumentUser['skills'];
  specialization: DocumentUser['specialization'];
}
