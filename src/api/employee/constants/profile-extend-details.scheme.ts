import type { MongoDbScheme } from '../../../shared/service/mongodb/models';
import type { ProfileExtendDetails } from '../models';
import { PROFILE_BASE_DETAILS_SCHEME } from './profile-base-details-scheme';

export const PROFILE_EXTEND_DETAILS_SCHEME: MongoDbScheme<ProfileExtendDetails> = {
  ...PROFILE_BASE_DETAILS_SCHEME,
  skills: 1,
  specialization: 1,
  cover: 1,
  location: 1,
  wage: 1,
  rating: 1,
  distance: 1,
};
