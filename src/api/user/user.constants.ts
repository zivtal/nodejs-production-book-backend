import type { AuthUser } from '../auth/models';

export const USER_CONFIGURATION = 'userConfiguration';

export const AUTH_USER_SCHEME: Record<keyof AuthUser, any> = {
  _id: 1,
  firstName: 1,
  lastName: 1,
  company: 1,
  nickName: 1,
  verified: 1,
  avatar: 1,
  birthday: 1,
  email: 1,
  phone: 1,
  role: 1,
  privacy: 1,
  createdAt: 0,
  updatedAt: 0,
  lastSeenAt: 1,
  location: 1,
  skills: 1,
  wage: 1,
  specialization: 1,
};
