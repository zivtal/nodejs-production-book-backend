import type { MongoDbScheme } from '../../../shared/service/mongodb/models';
import type { ProfileBaseDetails } from '../models';

export const PROFILE_BASE_DETAILS_SCHEME: MongoDbScheme<ProfileBaseDetails> = {
  _id: 1,
  firstName: 1,
  lastName: 1,
  company: 1,
  nickName: 1,
  verified: 1,
  avatar: 1,
};
