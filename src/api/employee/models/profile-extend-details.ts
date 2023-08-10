import type { UserLocation } from '../../user/models';
import type { Wage } from './wage';
import type { ProfileBaseDetails } from './profile-base-details';
import type { BaseOptions } from '../../../shared/models';
import type { AverageRating } from './average-rating';

export interface ProfileExtendDetails extends ProfileBaseDetails {
  location?: UserLocation;
  cover?: string | null;
  wage?: Wage;
  skills?: BaseOptions<string>;
  specialization?: BaseOptions<string>;
  rating?: AverageRating;
  distance?: number;
}
