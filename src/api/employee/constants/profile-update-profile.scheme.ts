import type { ProfileFullDetails } from '../models';
import type { ValidatorScheme } from '../../../shared/service/record-validator';

export const PROFILE_UPDATE_PROFILE_SCHEME: ValidatorScheme<ProfileFullDetails> = {
  _id: 0,
  updatedAt: 0,
  createdAt: 0,
  email: 0,
  firstName: 1,
  lastName: 1,
  company: 1,
  nickName: 1,
  avatar: 1,
  cover: 1,
  location: 1,
  verified: 0,
  wage: 1,
  skills: 1,
  specialization: 1,
  phone: 1,
  birthday: 1,
  gender: 1,
  about: 1,
  appearance: 1,
  language: 1,
};
