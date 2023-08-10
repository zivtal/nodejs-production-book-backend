import type { ProfileExtendDetails } from './profile-extend-details';
import type { ReviewSummarize } from './review-summarize';
import type { Appearance } from './appearance';
import { Gender } from '../../../shared/constants';

export interface ProfileFullDetails extends ProfileExtendDetails, Partial<ReviewSummarize> {
  email: string;
  phone: string;
  birthday?: string;
  gender?: Gender;
  about?: string;
  appearance?: Appearance;
  language?: Array<string>;
}
