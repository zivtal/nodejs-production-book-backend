import type { MongoDbScheme } from '../../../shared/service/mongodb/models';
import type { ProfileFullDetails } from '../models';
import { PROFILE_EXTEND_DETAILS_SCHEME } from './profile-extend-details.scheme';

export const PROFILE_FULL_DETAILS_SCHEME: MongoDbScheme<ProfileFullDetails> = {
  ...PROFILE_EXTEND_DETAILS_SCHEME,
  gender: 1,
  about: 1,
  appearance: 1,
  language: 1,
};
